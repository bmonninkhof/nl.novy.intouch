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

    //static payloadToData(payload) {
    //    var data = super.payloadToData(payload);
    //    debugger;
    //    if (data) {
            
          

    //        //data.damper = unit == Signal.increase ? 'increase' : unit == Signal.decrease ? 'decrease' : unit == Signal.off ? 'off' : undefined;
    //        //data.light = unit == Signal.light ? 'light' : unit == Signal.off ? 'off' : undefined;

    //        //data.channel_up = unit == Signal.increase;
    //        //data.channel_down = unit == Signal.decrease;
    //        //data.onoff = unit == Signal.light ? true : unit == Signal.off ? false : undefined;
    //    }
    //    return data;
    //}

    static dataToPayload(data) {
        if (data) {

            //var action = data.damper || data.light;
            //if (action && Signal[action]) {
            //    return util.bitStringToBitArray(Signal.address + Signal[action]);
            //}
            //if (action.channel_up) {
            //    return util.bitStringToBitArray(Signal.address + Signal.increase);
            //}
            //if (action.channel_down) {
            //    return util.bitStringToBitArray(Signal.address + Signal.decrease);
            //}
            //if (action.onoff === false) {
            //    return util.bitStringToBitArray(Signal.address + Signal.off);
            //}
            //if (action.onoff === true) {
            //    // TODO: conditional?
            //    return util.bitStringToBitArray(Signal.address + Signal.light);
            //}
        }
        return super.dataToPayload(data);
    }

    static generateData() {
        debugger;
        const data = super.generateData();
        data.onoff = false;
        data.light = 'off';
        data.damper = 'speed_0';
        return data;
    }

    //assembleDeviceObject() {
    //    // Ignore check for group button
    //    return super.assembleDeviceObject(true);
    //}

    parseIncomingData(data) {
        data = super.parseIncomingData(data);
        //debugger;

        const state = this.deviceState.lastFrame;
        data.onoff = state.onoff === true ? true : false;
        data.light = state.light === "on" ? "on" : "off";
        data.damper = state.damper || 'speed_0';

        switch (data.unit) {
            case Signal.light:
                data.light = state.light === "on" ? "off" : "on";
                break;
            case Signal.increase:
                data.damper = 'increase';
                break;
            case Signal.decrease:
                data.damper = 'decrease';
                break;
            case Signal.onoff:
                //data.onoff = state.onoff == "1" ? "0" : "1";
                data.onoff = !state.onoff;
                break;
        }

        return data;
    }

    getData() {
        // HACK: Fix for unmatching ids @ send dataCheck due unit change
        return this._data ? JSON.parse(JSON.stringify(this._data)) : super.getData();
    }

    getSendOptionsForData(data) {
        if (data.unit == Signal.onoff && !data.onoff) {
            return { repetitions: 2 }; // Not working...needs a delay
        }
    }

    parseOutgoingData(data) {
        
        //debugger;

        const state = this.deviceState.lastFrame;

        if (state.onoff != data.onoff) {
            data.unit = Signal.onoff;
        } else if (data.light != state.light) {
            data.unit = Signal.light;
        } else {
            switch (data.damper) {
                case 'increase':
                    state.unit = Signal.increase;
                    break;
                case 'decrease':
                    state.unit = Signal.decrease;
                    break;
                case 'speed_0':
                case 'speed_1':
                case 'speed_2':
                case 'speed_3':
                case 'speed_4':
                    let speed = Number(state.damper.substr(6));
                    // handle speed
                    break;
            }
        }
        
        // FIX: register data to fix id mismatches due unit change
        this._data = data;

        return super.parseOutgoingData(data);
    }
};
