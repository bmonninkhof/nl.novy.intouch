'use strict';

// Note: Homey SDK v3 provides global Homey object in runtime environment

class NovyIntouchHoodDriver extends Homey.Driver {

    /**
     * onInit is called when the driver is initialized.
     */
    async onInit() {
        this.log('NovyIntouchHoodDriver has been initialized');
        
        // Register RF signal
        this._signal = this.homey.rf.getSignal433('intouch');
        this._signal.register((frame, meta) => this._onFrame(frame, meta));
        
        // Register flow cards
        this._registerFlowCards();
    }
    
    /**
     * Register flow cards
     */
    _registerFlowCards() {
        // Register flow cards that are specific to this driver
        const receivedTrigger = this.homey.flow.getTriggerCard('novy-hood:received');
        const sendAction = this.homey.flow.getActionCard('novy-hood:send');
    }
    
    /**
     * Handle incoming RF frame
     */
    _onFrame(frame, meta) {
        this.log('Received frame:', frame, meta);
        
        // Parse the frame to extract device data
        const deviceData = this._parseFrame(frame);
        if (!deviceData) return;
        
        // Find devices and emit data to all matching devices
        const devices = this.getDevices();
        devices.forEach(device => {
            if (device.matchesFrame && device.matchesFrame(deviceData)) {
                device.onRFFrame(deviceData, meta);
            }
        });
    }
    
    /**
     * Parse RF frame to device data
     */
    _parseFrame(frame) {
        if (!frame || frame.length < 12 || frame.length > 18) {
            return null;
        }
        
        // Extract address and unit from frame
        const address = frame.slice(0, 10).join('');
        const unit = frame.slice(10).join('');
        
        // Check if this is a valid Novy signal
        if (address !== '0101010101') {
            return null;
        }
        
        return {
            id: address + unit,
            address: address,
            unit: unit
        };
    }
    
    /**
     * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called
     */
    async onPairListDevices() {
        return [
            {
                name: 'Novy Intouch Hood',
                data: {
                    id: this._generateDeviceId()
                }
            }
        ];
    }
    
    /**
     * Generate a unique device ID
     */
    _generateDeviceId() {
        return 'novy_' + Math.random().toString(36).substr(2, 9);
    }

}

module.exports = NovyIntouchHoodDriver;
