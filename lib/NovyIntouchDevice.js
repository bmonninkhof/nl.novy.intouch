import { RFDevice } from "homey-rfdriver";

export default class DeviceNovyInTouch extends RFDevice {
  async onInit() {
    try {
      this.log("Novy InTouch Hood initialized");
      await super.onInit();

      // Register capabilities
      this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));
      
      // Initialize device state
      await this.setAvailable();
      
      this.log("Device capabilities:", this.getCapabilities());
      this.log("Device data:", this.getData());
      this.log("Device store:", this.getStore());
    } catch (error) {
      this.error("Failed to initialize device:", error);
      if (this.homey.app?.crashReporter) {
        await this.homey.app.crashReporter.reportError(error, { 
          context: 'deviceInit',
          device: this.getName() || 'Unknown device',
          deviceId: this.getData()?.id || 'Unknown ID'
        });
      }
      throw error;
    }
  }

  async onCapabilityOnoff(value) {
    try {
      this.log("onoff changed:", value);
      
      try {
        // Send RF signal if we have one stored
        const learnedSignal = this.getStoreValue("learnedSignal");
        if (learnedSignal) {
          this.log("Sending RF signal for onoff:", value);
          // Here you would implement actual RF signal sending
          // For now we just update the capability
        }
        
        await this.setCapabilityValue("onoff", value);
        return value;
      } catch (error) {
        this.error("Error setting onoff capability:", error);
        if (this.homey.app?.crashReporter) {
          await this.homey.app.crashReporter.reportError(error, { 
            context: 'onCapabilityOnoff',
            device: this.getName() || 'Unknown device',
            value: value
          });
        }
        throw error;
      }
    } catch (error) {
      this.error("Error in onCapabilityOnoff handler:", error);
      if (this.homey.app?.crashReporter) {
        await this.homey.app.crashReporter.reportError(error, { 
          context: 'onCapabilityOnoffHandler',
          device: this.getName() || 'Unknown device'
        });
      }
      throw error;
    }
  }

  async onRFReceived(signal) {
    try {
      this.log("RF signal received:", signal);
      
      try {
        // Process the signal and update capabilities
        if (signal && signal.state !== undefined) {
          await this.setCapabilityValue("onoff", signal.state);
          
          // Trigger flow card if available
          const driver = this.driver;
          if (driver && driver.rfReceivedTrigger) {
            await driver.rfReceivedTrigger.trigger(this, {
              signal: JSON.stringify(signal)
            });
          }
        }
      } catch (error) {
        this.error("Error handling RF signal:", error);
        if (this.homey.app?.crashReporter) {
          await this.homey.app.crashReporter.reportError(error, { 
            context: 'onRFReceived',
            device: this.getName() || 'Unknown device',
            signal: JSON.stringify(signal)
          });
        }
      }
    } catch (error) {
      this.error("Error in onRFReceived handler:", error);
      if (this.homey.app?.crashReporter) {
        await this.homey.app.crashReporter.reportError(error, { 
          context: 'onRFReceivedHandler',
          device: this.getName() || 'Unknown device'
        });
      }
    }
  }

  async onDeleted() {
    this.log("Device deleted");
    await super.onDeleted();
  }
}