'use strict';

const util = require('homey-rfdriver').util;
const NovyIntouchDevice = require('../../lib/NovyIntouchDevice');
const Signal = require('../../lib/NovyIntouchSignal.js').Signal;

const TimeOuts = {
    runOut: 10 * 60 * 1000,         // 10 minutes
    autoStop: 3 * 60 * 60 * 1000,   // Safty stop after 3 hours (hood motor only)
    power: 6 * 60 * 1000            // 6 minutes (reduced to speed 3)
}

module.exports = RFDevice => class NovyIntouchHoodDevice extends NovyIntouchDevice(RFDevice) {

    static generateData() {
        const data = super.generateData();
        data.onoff = false;
        data.speed = 0;
        data.speed_level = "speed_0";
        data.light = false;
        data.command = 'off';
        return data;
    }

    getData() {
        // HACK: Fix for unmatching ids @ send dataCheck due unit change => should be handled by matchesData call
        return this._data ? Object.assign({}, this._data) : super.getData();
    }

    getState(settings) {
        settings = settings || this.getSettings();
        let speed_level = settings.speed_level || 'speed_0';
        let speed = Number(speed_level.substr(6));
        return {
            // public
            speed: speed,
            speed_level: speed_level,
            light: Boolean(settings.light),

            // internal
            offRunOut: settings.offRunOut,
            runOutActive: settings.runOutActive,
            targetSpeed: settings.targetSpeed,
            speedHistory: settings.speedHistory,
            lightHistory: settings.lightHistory
        };
    }

    saveState(state) {
        let settings = {
            // public
            speed: state.speed || 0,
            speed_level: 'speed_' + (state.speed || 0),
            light: state.light,

            // internal
            offRunOut: state.offRunOut,
            runOutActive: state.runOutActive,
            targetSpeed: state.targetSpeed,
            speedHistory: state.speedHistory,
            lightHistory: state.lightHistory
        };

        this.setSettings(settings)
            .then(this.log)
            .catch(this.error);

        return settings;
    }

    resetTimeout(timeout) {
        if (this._timeouts && this._timeouts[timeout]) {
            clearTimeout(this._timeouts[timeout]);
        }
    }

    activateTimeout(timeout, callback) {
        if (!this._timeouts) {
            this._timeouts = {};
        }

        if (callback) {
            this._timeouts[timeout] = setTimeout(() => callback(), timeout);
        }
    }

    updateState(settings) {
        this.setSettings(settings)
            .then(this.log)
            .catch(this.error);
    }

    parseIncomingData(data) {

        if (data) {

            const settings = this.getSettings();
            const state = this.getState(settings);

            switch (data.unit) {
                case Signal.onoff:

                    this.resetTimeout(TimeOuts.runOut);

                    let onoff = state.speed > 0;
                    data.command = state.runOutActive || onoff ? 'off' : 'on';
                    state.speed = onoff ? (state.runOutActive ? 0 : state.speed) : state.speedHistory || 1;
                    state.targetSpeed = state.speed;
                    state.light = onoff ? false : Boolean(settings.lightHistory);
                    state.runOutActive = data.command === 'off' && !state.runOutActive;

                    if (state.runOutActive) {
                        if (state.offRunOut === false) {
                            setTimeout(() => this.send({ address: Signal.address, unit: Signal.onoff, repeatingSignal: true }), 50); // re-send signal to skip run-out mode
                        } else {
                            this.activateTimeout(TimeOuts.runOut, () => this.updateState({ runOutActive: false, speed: 0, speed_level: 'speed_0' }));
                        }
                    } 
                    state.offRunOut = undefined;
                    break;
                case Signal.light:
                    state.light = !state.light;
                    state.lightHistory = state.light;
                    data.command = state.light ? 'light_on' : 'light_off';
                    break;
                case Signal.increase:
                    this.resetTimeout(TimeOuts.runOut);
                    state.runOutActive = false;
                    state.speed = Math.min(4, Math.max(0, Number(state.speed || 0) + 1));
                    state.speedHistory = state.speed;
                    data.command = 'increase';
                    this.handleTargetSpeed(state, data);
                    break;
                case Signal.decrease:
                    this.resetTimeout(TimeOuts.runOut);
                    state.runOutActive = false;
                    state.speed = Math.min(4, Math.max(0, Number(state.speed || 0) - 1));
                    state.speedHistory = state.speed;
                    data.command = 'decrease';
                    this.handleTargetSpeed(state, data);
                    break;
            }

            // update state
            state.speed_level = 'speed_' + state.speed;
            this.saveState(state);
            
            // update data
            data.light = Boolean(state.light);
            data.speed = state.targetSpeed || state.speed;
            data.onoff = data.speed > 0;
            data.speed_level = 'speed_' + data.speed;
        }

        return super.parseIncomingData(data);
    }

    handleTargetSpeed(state, data) {
        if (state.targetSpeed !== undefined) {
            if (state.speed < state.targetSpeed && data.unit == Signal.increase) {
                setTimeout(() => this.send({ address: Signal.address, unit: Signal.increase, repeatingSignal: true }), 50);
            } else if (state.speed > state.targetSpeed && data.unit == Signal.decrease) {
                setTimeout(() => this.send({ address: Signal.address, unit: Signal.decrease, repeatingSignal: true }), 50);
            } else {
                state.targetSpeed = undefined;
            }
        }

        // re-send signal (2x) if target speed == 0 (off)
        if (data.unit == Signal.decrease && state.speed === 0) {
            for (let i = 1; i <= 2; i++) {
                setTimeout(() => this.send({ address: Signal.address, unit: Signal.decrease, repeatingSignal: true }), i * 50);
            }
        }

        // re-send signal (2x) if target speed == 4 (POWER level)
        if (data.unit == Signal.increase && state.speed === 4) {
            for (let i = 1; i <= 2; i++) {
                setTimeout(() => this.send({ address: Signal.address, unit: Signal.increase, repeatingSignal: true }), i * 50);
            }
        }
    }

    assembleSendData(data) {

        if (data) {

            // get settings & state
            const settings = this.getSettings();
            const state = this.getState(settings);
            let onoff = state.speed > 0;

            // Skip repeating signals
            if (data.repeatingSignal) {
                delete data.repeatingSignal;

                // assemble
                data = super.assembleSendData(data);

                // update data
                data.speed = state.speed;
                data.light = state.light;
            }
            else {
                // map capability to command
                if (!data.unit) {
                    if (data.onoff !== undefined) {
                        switch (settings.onoff_action) {
                            case "light":
                                data.command = data.onoff ? 'light_on' : 'light_off';
                                break;
                            case "hood":
                                data.command = 'speed_' + (data.onoff ? state.speedHistory || 1 : 0);
                                break;
                            case "device":
                            default:
                                data.command = data.onoff ? 'on' : settings.run_out ? 'off_run_out' : 'off';
                                break;
                        }
                    }
                    if (data.speed !== undefined) {
                        data.command = 'speed_' + data.speed;
                    }
                    if (data.light !== undefined) {
                        data.command = data.light ? 'light_on' : 'light_off';
                    }
                }

                // assemble
                data = super.assembleSendData(data);

                // set action
                switch (data.command) {
                    case 'on':
                        data.unit = !onoff ? Signal.onoff : Signal.none;
                        data.speed = state.speedHistory || state.speed || 1;
                        break;
                    case 'off':
                    case 'off_run_out':
                        data.unit = onoff ? Signal.onoff : Signal.none;
                        state.offRunOut = data.command === 'off_run_out';
                        data.speed = 0;
                        break;
                    case 'toggle_onoff':
                    case 'toggle_onoff_run_out':
                        data.unit = Signal.onoff;
                        state.offRunOut = onoff && data.command === 'toggle_onoff_run_out';
                        data.speed = onoff ? 0 : state.speedHistory || state.speed || 1;
                        break;
                    case 'light_on':
                        data.unit = !state.light ? Signal.light : Signal.none;
                        data.light = true;
                        break;
                    case 'light_off':
                        data.unit = state.light ? Signal.light : Signal.none;
                        data.light = false;
                        break;
                    case 'toggle_light':
                        data.unit = Signal.light;
                        data.light = !state.light;
                        break;
                    case 'increase':
                        data.unit = Signal.increase;
                        state.targetSpeed = undefined;
                        data.speed = Math.min(4, Math.max(0, Number(state.speed || 0) + 1));
                        break;
                    case 'decrease':
                        data.unit = Signal.decrease;
                        state.targetSpeed = undefined;
                        data.speed = Math.min(4, Math.max(0, Number(state.speed || 0) - 1));
                        break;
                    case 'speed_0':
                    case 'speed_1':
                    case 'speed_2':
                    case 'speed_3':
                    case 'speed_4':
                        data.speed = Number(data.command.substr(6));
                        if (data.speed === state.speed) {
                            data.unit = Signal.none;
                            state.targetSpeed = undefined;
                        } else {
                            if (data.speed > state.speed) {
                                state.targetSpeed = data.speed;
                                data.unit = Signal.increase;
                            } else if (data.speed < state.speed) {
                                state.targetSpeed = data.speed;
                                data.unit = Signal.decrease;
                            }
                        }
                        break;
                }

                // update internal state (save settings)
                this.saveState(state);
            }

            // update data
            data.onoff = data.speed > 0;
            data.speed_level = 'speed_' + data.speed;

            // FIX: register data to fix id mismatches due unit change
            this._data = data;
        }
        
        return data;
    }
};
