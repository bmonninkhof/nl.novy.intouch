'use strict';

const Homey = require('homey');
const RFDriver = require('homey-rfdriver');
const util = RFDriver.util;

module.exports = class NovyIntouchDamperDriver extends RFDriver.Driver {

    onRFInit(){
        super.onRFInit();

        // register a capability listener
        //this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));

        //this._flowTriggerLightOn = new Homey.FlowCardTriggerDevice('light_on').register();
    }

    triggerMyFlow(device, tokens, state) {
        this._flowTriggerTurnedOn
            .trigger(device, tokens, state)
            .then(this.log)
            .catch(this.error)
    }

    // this method is called when the Device has requested a state change (turned on or off)
    onCapabilityOnoff(value, opts, callback) {
        debugger;
        var settings = this.getSettings();
        var lightOn = settings.lightOn;

        if (value !== undefined) {
            settings.lightOn = value === 1 ? !lightOn : 0;
            settings.onoff = settings.lightOn;
        }

        // Then, emit a callback ( err, result )
        callback();
    }
};
