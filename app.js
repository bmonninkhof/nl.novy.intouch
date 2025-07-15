
'use strict';

const Homey = require('homey');

class App extends Homey.App {
  async onInit() {
    this.log('Novy InTouch app is running');
    this._registerFlows();
  }

  _registerFlows() {
    // Trigger: RF signal received
    this.rfReceivedTrigger = this.homey.flow.getDeviceTriggerCard('novy_rf_received');
    // Condition: Is the hood on?
    this.rfReceivedCondition = this.homey.flow.getConditionCard('novy_rf_condition');
    // Action: Send RF command
    this.rfSendAction = this.homey.flow.getActionCard('novy_rf_send');
    // Hier kun je extra logging of error handling toevoegen
  }
}

module.exports = App;
