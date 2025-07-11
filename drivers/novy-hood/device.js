'use strict';

// Note: Homey SDK v3 provides global Homey object in runtime environment

// Signal definitions
const Signal = {
    address: '0101010101',
    light: '11010001',
    increase: '01',
    decrease: '10',
    onoff: '11010011',
    novy: '00',
    none: '00000000'
};

// Timeouts
const TimeOuts = {
    runOut: 10 * 60 * 1000,         // 10 minutes
    autoStop: 3 * 60 * 60 * 1000,   // Safety stop after 3 hours (hood motor only)
    power: 6 * 60 * 1000            // 6 minutes (reduced to speed 3)
};

class NovyIntouchHoodDevice extends Homey.Device {

    /**
     * onInit is called when the device is initialized.
     */
    async onInit() {
        this.log('NovyIntouchHoodDevice has been initialized');
        
        // Initialize state
        this._timeouts = {};
        this._settings = this.getSettings();
        
        // Register capability listeners
        this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
        this.registerCapabilityListener('light', this.onCapabilityLight.bind(this));
        this.registerCapabilityListener('speed', this.onCapabilitySpeed.bind(this));
        
        // Get RF signal - access through driver
        this._driver = this.getDriver();
        this._signal = this._driver.homey.rf.getSignal433('intouch');
    }

    /**
     * onAdded is called when the user adds the device, called just after pairing.
     */
    async onAdded() {
        this.log('NovyIntouchHoodDevice has been added');
    }

    /**
     * onSettings is called when the user updates the device's settings.
     */
    async onSettings({ oldSettings, newSettings, changedKeys }) {
        this.log('NovyIntouchHoodDevice settings changed');
        this._settings = newSettings;
    }

    /**
     * onRenamed is called when the user updates the device's name.
     */
    async onRenamed(name) {
        this.log('NovyIntouchHoodDevice was renamed');
    }

    /**
     * onDeleted is called when the user deleted the device.
     */
    async onDeleted() {
        this.log('NovyIntouchHoodDevice has been deleted');
        
        // Clear all timeouts
        Object.values(this._timeouts).forEach(timeout => clearTimeout(timeout));
    }
    
    /**
     * Check if this device matches the received frame
     */
    matchesFrame(data) {
        // For Novy devices, we accept all frames with the correct address
        // since the units identify different commands rather than different devices
        return data && data.address === Signal.address;
    }
    
    /**
     * Handle incoming RF frame
     */
    onRFFrame(data, meta) {
        this.log('Received RF frame:', data, meta);
        
        if (!data || !data.unit) return;
        
        const state = this.getState();
        const settings = this.getSettings();
        let command = '';
        
        switch (data.unit) {
            case Signal.onoff:
                command = this._handleOnOffSignal(state, settings);
                break;
            case Signal.light:
                command = this._handleLightSignal(state, settings);
                break;
            case Signal.increase:
                command = this._handleIncreaseSignal(state, settings);
                break;
            case Signal.decrease:
                command = this._handleDecreaseSignal(state, settings);
                break;
        }
        
        if (command) {
            // Trigger flow card
            this.homey.flow.getTriggerCard('novy-hood:received')
                .trigger(this, { command: command }, { command: command })
                .catch(this.error);
        }
    }
    
    /**
     * Get current device state
     */
    getState() {
        const settings = this.getSettings();
        const speed_level = settings.speed_level || 'speed_0';
        const speed = Number(speed_level.substr(6));
        
        return {
            speed: speed,
            speed_level: speed_level,
            light: Boolean(settings.light),
            onoff: speed > 0,
            offRunOut: settings.offRunOut,
            runOutActive: settings.runOutActive,
            targetSpeed: settings.targetSpeed,
            speedHistory: settings.speedHistory,
            lightHistory: settings.lightHistory
        };
    }
    
    /**
     * Save device state
     */
    async saveState(state) {
        const settings = {
            speed: state.speed || 0,
            speed_level: 'speed_' + (state.speed || 0),
            light: state.light,
            offRunOut: state.offRunOut,
            runOutActive: state.runOutActive,
            targetSpeed: state.targetSpeed,
            speedHistory: state.speedHistory,
            lightHistory: state.lightHistory
        };
        
        await this.setSettings(settings);
        
        // Update capabilities
        await this.setCapabilityValue('onoff', state.onoff);
        await this.setCapabilityValue('light', state.light);
        await this.setCapabilityValue('speed', state.speed);
        
        return settings;
    }
    
    /**
     * Handle on/off capability
     */
    async onCapabilityOnoff(value) {
        this.log('onCapabilityOnoff:', value);
        
        const settings = this.getSettings();
        const command = value ? 'on' : (settings.run_out ? 'off_run_out' : 'off');
        
        return this.sendCommand(command);
    }
    
    /**
     * Handle light capability
     */
    async onCapabilityLight(value) {
        this.log('onCapabilityLight:', value);
        
        const command = value ? 'light_on' : 'light_off';
        return this.sendCommand(command);
    }
    
    /**
     * Handle speed capability
     */
    async onCapabilitySpeed(value) {
        this.log('onCapabilitySpeed:', value);
        
        const command = 'speed_' + value;
        return this.sendCommand(command);
    }
    
    /**
     * Send command to device
     */
    async sendCommand(command) {
        this.log('Sending command:', command);
        
        const state = this.getState();
        const settings = this.getSettings();
        
        let unit;
        let newState = { ...state };
        
        switch (command) {
            case 'on':
                if (!state.onoff) {
                    unit = Signal.onoff;
                    newState.speed = state.speedHistory || 1;
                    newState.onoff = true;
                }
                break;
            case 'off':
            case 'off_run_out':
                if (state.onoff) {
                    unit = Signal.onoff;
                    newState.offRunOut = command === 'off_run_out';
                    newState.speed = 0;
                    newState.onoff = false;
                }
                break;
            case 'light_on':
                if (!state.light) {
                    unit = Signal.light;
                    newState.light = true;
                    newState.lightHistory = true;
                }
                break;
            case 'light_off':
                if (state.light) {
                    unit = Signal.light;
                    newState.light = false;
                    newState.lightHistory = false;
                }
                break;
            case 'toggle_light':
                unit = Signal.light;
                newState.light = !state.light;
                newState.lightHistory = newState.light;
                break;
            case 'increase':
                unit = Signal.increase;
                newState.speed = Math.min(4, state.speed + 1);
                newState.speedHistory = newState.speed;
                newState.onoff = newState.speed > 0;
                break;
            case 'decrease':
                unit = Signal.decrease;
                newState.speed = Math.max(0, state.speed - 1);
                newState.speedHistory = newState.speed;
                newState.onoff = newState.speed > 0;
                break;
            default:
                if (command.startsWith('speed_')) {
                    const targetSpeed = Number(command.substr(6));
                    if (targetSpeed !== state.speed) {
                        if (targetSpeed > state.speed) {
                            unit = Signal.increase;
                        } else {
                            unit = Signal.decrease;
                        }
                        newState.targetSpeed = targetSpeed;
                        newState.speed = targetSpeed;
                        newState.speedHistory = targetSpeed;
                        newState.onoff = targetSpeed > 0;
                    }
                }
                break;
        }
        
        if (unit) {
            // Convert unit to frame data
            const frame = this._createFrame(Signal.address, unit);
            
            // Send RF signal
            await this._signal.tx(frame);
            
            // Update state
            await this.saveState(newState);
        }
        
        return true;
    }
    
    /**
     * Create RF frame from address and unit
     */
    _createFrame(address, unit) {
        const frame = [];
        
        // Add address bits
        for (let i = 0; i < address.length; i++) {
            frame.push(parseInt(address[i]));
        }
        
        // Add unit bits
        for (let i = 0; i < unit.length; i++) {
            frame.push(parseInt(unit[i]));
        }
        
        return frame;
    }
    
    /**
     * Handle on/off signal
     */
    _handleOnOffSignal(state, settings) {
        this.resetTimeout(TimeOuts.runOut);
        
        const onoff = state.speed > 0;
        const command = state.runOutActive || onoff ? 'off' : 'on';
        
        const newState = { ...state };
        newState.speed = onoff ? (state.runOutActive ? 0 : state.speed) : state.speedHistory || 1;
        newState.light = onoff ? false : Boolean(settings.lightHistory);
        newState.runOutActive = command === 'off' && !state.runOutActive;
        newState.onoff = newState.speed > 0;
        
        if (newState.runOutActive && newState.offRunOut !== false) {
            this.activateTimeout(TimeOuts.runOut, () => {
                this.updateState({ runOutActive: false, speed: 0, speed_level: 'speed_0', onoff: false });
            });
        }
        
        this.saveState(newState);
        return command;
    }
    
    /**
     * Handle light signal
     */
    _handleLightSignal(state, settings) {
        const newState = { ...state };
        newState.light = !state.light;
        newState.lightHistory = newState.light;
        
        this.saveState(newState);
        return newState.light ? 'light_on' : 'light_off';
    }
    
    /**
     * Handle increase signal
     */
    _handleIncreaseSignal(state, settings) {
        this.resetTimeout(TimeOuts.runOut);
        
        const newState = { ...state };
        newState.runOutActive = false;
        newState.speed = Math.min(4, Math.max(0, Number(state.speed || 0) + 1));
        newState.speedHistory = newState.speed;
        newState.onoff = newState.speed > 0;
        
        this.saveState(newState);
        return 'increase';
    }
    
    /**
     * Handle decrease signal
     */
    _handleDecreaseSignal(state, settings) {
        this.resetTimeout(TimeOuts.runOut);
        
        const newState = { ...state };
        newState.runOutActive = false;
        newState.speed = Math.min(4, Math.max(0, Number(state.speed || 0) - 1));
        newState.speedHistory = newState.speed;
        newState.onoff = newState.speed > 0;
        
        this.saveState(newState);
        return 'decrease';
    }
    
    /**
     * Reset timeout
     */
    resetTimeout(timeout) {
        if (this._timeouts && this._timeouts[timeout]) {
            clearTimeout(this._timeouts[timeout]);
            delete this._timeouts[timeout];
        }
    }
    
    /**
     * Activate timeout
     */
    activateTimeout(timeout, callback) {
        if (!this._timeouts) {
            this._timeouts = {};
        }
        
        if (callback) {
            this._timeouts[timeout] = setTimeout(() => {
                callback();
                delete this._timeouts[timeout];
            }, timeout);
        }
    }
    
    /**
     * Update state
     */
    async updateState(settings) {
        this._settings = { ...this._settings, ...settings };
        await this.setSettings(this._settings);
        
        // Update capabilities if needed
        if (settings.onoff !== undefined) {
            await this.setCapabilityValue('onoff', settings.onoff);
        }
        if (settings.light !== undefined) {
            await this.setCapabilityValue('light', settings.light);
        }
        if (settings.speed !== undefined) {
            await this.setCapabilityValue('speed', settings.speed);
        }
    }

}

module.exports = NovyIntouchHoodDevice;
