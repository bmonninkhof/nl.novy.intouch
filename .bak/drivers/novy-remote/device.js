'use strict';

const util = require('homey-rfdriver').util;
const NovyIntouchDevice = require('../../lib/NovyIntouchDevice');
const Signal = require('../../lib/NovyIntouchSignal.js').Signal;

module.exports = RFDevice => class NovyIntouchRemoteDevice extends NovyIntouchDevice(RFDevice) {

    onRFInit() {
        super.onRFInit();

        //let device = this;
        //let tokens = {};
        //let state = {};

        //this._driver = this.getDriver();
        //this._driver.ready(() => {
        //    this._driver.triggerMyFlow(device, tokens, state);
        //});
    }

    //static payloadToData(payload) {
    //    var data = super.payloadToData(payload);
    //    debugger;
    //    if (data) {
    //        data.button = data.unit == Signal.light ? 'light'
    //            : data.unit == Signal.plus ? 'plus'
    //            : data.unit == Signal.min ? 'min'
    //            : data.unit == Signal.off ? 'off'
    //            : undefined;
    //    }
    //    return data;
    //}

    //static dataToPayload(data) {
    //    if (data && data.button && Signal[data.button]) {
    //        return util.bitStringToBitArray(Signal.address + Signal[data.button]);
    //    }
    //    return super.dataToPayload(data);
    //}

    //static generateData() {
    //    const data = super.generateData();
    //    data.damper = 'off';
    //    data.light = false;
    //    return data;
    //}

    onFlowTriggerFrameReceived(args, state) {
        //if (args.unitchannel) {
        //    args.unit = args.unitchannel.slice(0, 2);
        //    args.channel = args.unitchannel.slice(2, 4);
        //    delete args.unitchannel;
        //}
        //if (args.unit === 'g') {
        //    args.unit = '00';
        //    args.group = 1;
        //    delete args.channel;
        //} else {
        //    args.group = 0;
        //}
        return super.onFlowTriggerFrameReceived(args, state);
    }

    //assembleDeviceObject() {
    //    // Ignore check for group button
    //    return super.assembleDeviceObject(true);
    //}
};
