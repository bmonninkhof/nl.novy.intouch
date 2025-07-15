

'use strict';
const Homey = require('homey');
const { RFDriver } = require('homey-rfdriver');

class App extends Homey.App {
  async onInit() {
    try {
      this.homey.log('Novy InTouch app is running');
      // Initialize RF driver
      this.rfDriver = new RFDriver(this, { signal: 'novy_intouch' });
      await this.rfDriver.init();
      this.homey.log('RF driver initialized successfully');
      // Register flow triggers
      this.registerFlowTriggers();
    } catch (err) {
      this.homey.error('Initialization failed:', err);
    }
  }

  registerFlowTriggers() {
    this.homey.flow.getTriggerCard('novy_rf_received')
      .registerRunListener(async (args, state) => {
        this.homey.log(`RF signal received: ${state.command} from device ${args.device.getName()}`);
        return true;
      })
      .on('update', () => {
        this.homey.log('Flow trigger novy_rf_received updated');
      });
  }
}

module.exports = App;
