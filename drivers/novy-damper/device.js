'use strict';

const util = require('homey-rfdriver').util;
const NovyIntouchDevice = require('../../lib/NovyIntouchDevice');
const Signal = require('../../lib/NovyIntouchSignal.js').Signal;

module.exports = RFDevice => class NovyIntouchLDamperDevice extends NovyIntouchDevice(RFDevice) {

    //onRFInit() {
    //    super.onRFInit();

    //    //this.sendToggleTimeout = {};
    //    //this.toggleCapabilityValue = {};
    //}

    static generateData() {
        debugger;
        const data = super.generateData();
        data.onoff = false;
        data.light = false;
        data.damper = 'off';
        return data;
    }

    parseIncomingData(data) {
        //debugger;
        console.info("parseIncomingData", data);
        if (data) {
            delete data._sendOptions;

            const state = this.deviceState.lastFrame;
            data.onoff = Boolean(state.onoff);
            data.light = Boolean(state.light);

            if (!data.damper) {
                switch (data.unit) {
                    case Signal.light:
                        data.light = !data.light;
                        data.damper = data.light ? 'light_on' : 'light_off';
                        break;
                    case Signal.increase:
                        data.speed = Math.min(4, Math.max(0, Number(data.speed || 0) + 1));
                        data.damper = 'increase';
                        break;
                    case Signal.decrease:
                        data.speed = Math.min(4, Math.max(0, Number(data.speed || 0) - 1));
                        data.damper = 'decrease';
                        break;
                    case Signal.onoff:
                        data.onoff = !state.onoff;
                        data.damper = data.onoff ? 'on' : 'off';
                        break;
                }
            }
        }

        return super.parseIncomingData(data);
    }

    getData() {
        // HACK: Fix for unmatching ids @ send dataCheck due unit change => should be handled by matchesData call
        return this._data ? Object.assign({}, this._data) : super.getData();
    }

    getSendOptionsForData(data) {
        console.info("getSendOptionsForData", data);
        return data ? data._sendOptions || null : null;
    }

    assembleSendData(data) {
        console.info("assembleSendData", data);
        //debugger;

        if (data) {

            delete data._sendOptions;

            // map onoff to damper action
            if (data.onoff !== undefined) {
                data.damper = data.onoff ? 'on' : 'off';
                delete data.onoff; // delete to fetch from current state (lastFrame)
            }

            // assemble
            data = super.assembleSendData(data);

            let state = this.deviceState.lastFrame;
            data.onoff = Boolean(state.onoff); // TODO: Create reset override/read from settings?
            data.light = Boolean(state.light);

            // set action
            switch (data.damper) {
                case 'on':
                    if (data.onoff) {
                        return null;
                    }
                    data.onoff = true;
                    data.unit = Signal.onoff;
                    break;
                case 'off':
                    if (!data.onoff) {
                        return null;
                    }
                    data.onoff = false;
                    data.unit = Signal.onoff;
                    data._sendOptions = { repetitions: 1 }; // off = dubble press (skip timeout)
                    break;
                case 'light_on':
                    if (data.light) {
                        return null;
                    }
                    data.light = true;
                    data.unit = Signal.light;
                    break;
                case 'light_off':
                    if (!data.light) {
                        return null;
                    }
                    data.light = false;
                    data.unit = Signal.light;
                    break;
                case 'increase':
                    data.speed = Math.min(4, Math.max(0, (data.speed || 0) + 1));
                    data.unit = Signal.increase;
                    break;
                case 'decrease':
                    data.speed = Math.min(4, Math.max(0, (data.speed || 0) - 1));
                    data.unit = Signal.decrease;
                    break;
                case 'speed_0':
                case 'speed_1':
                case 'speed_2':
                case 'speed_3':
                case 'speed_4':
                    let speed = Number(data.damper.substr(6));
                    if (data.speed === speed) {
                        return null;
                    }
                    if (speed > data.speed) {
                        data.unit = Signal.increase;
                        data._sendOptions = { repetitions: Math.min(3, Math.max(0, speed - data.speed - 1)) }
                    } else if (speed < data.speed) {
                        data.unit = Signal.decrease;
                        data._sendOptions = { repetitions: Math.min(3, Math.max(0, data.speed - speed - 1)) }
                    }
                    break;
            }
        }

        // FIX: register data to fix id mismatches due unit change
        this._data = data;

        return data;
    }
};
