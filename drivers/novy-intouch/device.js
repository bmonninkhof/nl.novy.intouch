'use strict';

const Homey = require('homey');
const util = require('homey-rfdriver').util;

// To extend from another class change the line below to
// module.exports = RFDevice => class Novy-intouchDevice extends MyGenericDevice(RFDevice) {
// and define MyGenericDevice like so
// module.exports = RFDevice => class MyGenericDevice extends RFDevice {
module.exports = RFDevice => class NovyIntouchDevice extends RFDevice {

    onRFInit() {
        super.onRFInit();

        // Init your device here
    }

    // If your driver handles raw payload requests instead of commands you need to implement the payloadToData function below
    // This function is "static" which means you cannot use 'this' inside this function!
     static payloadToData(payload) {

         /** Signals
         light: (18) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1]
         plus: (12) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
         min: (12) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0]
         off: (18) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1]
         **/

         if (payload.length === 12 || payload.length === 18) {
             var address = util.bitArrayToString(payload.slice(0, 10));
             if (address === '0101010101') {
                 const data = {
                     address: address,
                     unit: util.bitArrayToString(payload.slice(10, payload.length)),

                     // A device capability id like onoff in the data object will automatically call this.setCapabilityValue.
                     light: payload.length === 18 && payload[16] === 0,
                     plus: payload.length === 12 && payload[11] === 1,
                     min: payload.length === 12 && payload[11] === 0,
                     off: payload.length === 18 && payload[16] === 1,
                 };
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
             return [].concat(
                 util.bitStringToBitArray(data.address),
                 util.bitStringToBitArray(data.unit),
                 // The default capabilityListener will send an object with the capability key set to its new value e.g. { onoff: true }
                 data.onoff ? 1 : 0
             );
         }
         // If data is not valid return null, data object will be discarded.
         return null;
     }

    // If your driver uses the rf.program, rf.codewheel or rf.dipswitch pair template you need to implement the generateData function below
    // static generateData() {
    //     const data = {
    //         address: util.generateRandomBitString(10),
    //         unit: util.generateRandomBitString(4),
    //         onoff: true,
    //     };
    //     data.id = data.address + data.unit;
    //     return data;
    // }
};
