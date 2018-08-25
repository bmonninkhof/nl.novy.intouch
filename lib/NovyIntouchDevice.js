'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const Signal = require('../../lib/NovyIntouchSignal.js').Signal;

module.exports = RFDevice => class NovyIntouchDevice extends RFDevice {

    onRFInit() {
        super.onRFInit();
        //this.clearFromEmptySendObject = ['onoff'];
    }

    // If your driver handles raw payload requests instead of commands you need to implement the payloadToData function below
    // This function is "static" which means you cannot use 'this' inside this function!
    static payloadToData(payload) {

        if (payload.length === 12 || payload.length === 18) {
            const address = util.bitArrayToString(payload.slice(0, 10));
            if (address === Signal.address) {
                const unit = util.bitArrayToString(payload.slice(10, payload.length));
                const data = { address, unit };

                // RFDriver requires an id property in the data object by default. This should be unique for every device instance
                data.id = data.address + data.unit;
                console.log(JSON.stringify(data));
                return data;
            }
        }
        // If payload is not valid return null, payload will be discarded.
        return null;
    }

    // If your driver handles raw payload requests instead of commands you need to implement the dataToPayload function below
    static dataToPayload(data) {

        if (data.address && data.unit) {
            return util.bitStringToBitArray(data.address + data.unit);
        }

        // If data is not valid return null, data object will be discarded.
        return null;
    }

    // If your driver uses the rf.program, rf.codewheel or rf.dipswitch pair template you need to implement the generateData function below
    static generateData() {
        const data = {
            address: util.generateRandomBitString(10),
            unit: util.generateRandomBitString(8),
        };

        data.id = data.address + data.unit;
        return data;
    }

    matchesData(deviceData) {
        return super.matchesData(deviceData) || (deviceData.address === this.getData().address && deviceData.unit === this.getData().unit)
    }

    parseIncomingData(data) {
        data = super.parseIncomingData(data);
        data.id = data.address + data.unit;
        
        return data;
    }

    parseOutgoingData(data) {
        data = super.parseOutgoingData(data);
        data.id = data.address + data.unit;
        
        return data;
    }

    onFlowTriggerFrameReceived(args, state) {
        debugger;
        return super.onFlowTriggerFrameReceived(args, state);
    }

    setCapabilityValue(capability, value) {
        //debugger;

        //if (
        //    typeof value === 'boolean' &&
        //    this.options.sendToggleAfterTimeout &&
        //    (
        //        typeof this.options.sendToggleAfterTimeout === 'number' ||
        //        typeof this.options.sendToggleAfterTimeout === 'string' ||
        //        Array.isArray(this.options.sendToggleAfterTimeout) ||
        //        this.options.sendToggleAfterTimeout.hasOwnProperty(capability)
        //    ) &&
        //    this.hasCapability(capability)
        //) {
        //    const toggleValue = this.toggleCapabilityValue[capability];
        //    clearTimeout(this.sendToggleTimeout[capability]);
        //    delete this.toggleCapabilityValue[capability];
        //    if (toggleValue === undefined || toggleValue === null || toggleValue !== value) {
        //        let timeout;
        //        if (typeof this.options.sendToggleAfterTimeout === 'object' && !Array.isArray(this.options.sendToggleAfterTimeout)) {
        //            timeout = this.options.sendToggleAfterTimeout[capability];
        //        } else {
        //            timeout = this.options.sendToggleAfterTimeout;
        //        }
        //        if (Array.isArray(timeout)) {
        //            timeout = timeout[value ? 1 : 0];
        //        }
        //        if (typeof timeout === 'string') {
        //            timeout = this.getSetting(timeout);
        //            if (typeof timeout === 'string') {
        //                timeout = Number(timeout);
        //            }
        //            if (timeout && timeout < 1000) {
        //                timeout = timeout * 60 * 1000;
        //            }
        //        }
        //        if (timeout && typeof timeout === 'number') {
        //            this.sendToggleTimeout[capability] = setTimeout(async () => {
        //                const newValue = !value;
        //                this.toggleCapabilityValue[capability] = newValue;
        //                await this.emit('data', { [capability]: newValue, state: newValue ? 1 : 0 });
        //                delete this.toggleCapabilityValue[capability];
        //            }, timeout);
        //        }
        //    }
        //}
        return super.setCapabilityValue(capability, value);
    }

};
