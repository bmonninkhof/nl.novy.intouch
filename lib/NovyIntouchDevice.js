'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;
const Signal = require('../../lib/NovyIntouchSignal.js').Signal;

module.exports = RFDevice => class NovyIntouchDevice extends RFDevice {

    // If your driver handles raw payload requests instead of commands you need to implement the payloadToData function below
    static payloadToData(payload) {

        if (payload.length === 12 || payload.length === 18) {
            const address = util.bitArrayToString(payload.slice(0, 10));
            if (address === Signal.address) {
                const unit = util.bitArrayToString(payload.slice(10, payload.length));
                const data = { address, unit };

                // RFDriver requires an id property in the data object by default. This should be unique for every device instance
                data.id = data.address + data.unit;
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
        return super.matchesData(deviceData) || (deviceData.address === Signal.address && (deviceData.unit.length == 2 || deviceData.unit.length == 8))
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
};
