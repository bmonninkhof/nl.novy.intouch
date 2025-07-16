/* global setTimeout, clearTimeout */
import { RFDriver } from "homey-rfdriver";
import RFSignalNovyInTouch from "./RFSignalNovyInTouch.js";

export default class DriverNovyInTouch extends RFDriver {
  static get SIGNAL() {
    return RFSignalNovyInTouch;
  }

  async onRFInit() {
    try {
      await super.onRFInit();
      // Register flow cards for RF events if they exist
      try {
        this.rfReceivedTrigger =
          this.homey.flow.getDeviceTriggerCard("novy_rf_received");
        this.rfReceivedCondition =
          this.homey.flow.getConditionCard("novy_rf_condition");
        this.rfSendAction = this.homey.flow.getActionCard("novy_rf_send");
      } catch (error) {
        this.log("Flow card not found:", error.message);
        // Report flow card registration issues
        if (this.homey.app?.crashReporter) {
          await this.homey.app.crashReporter.reportError(error, { 
            context: 'driverFlowCardRegistration',
            driver: 'DriverNovyInTouch'
          });
        }
      }
      
      // Register handlers for flow condition and action
      if (this.rfReceivedCondition) {
        this.rfReceivedCondition.registerRunListener(async (args) => {
          try {
            // Check if the hood is on (uses onoff capability)
            const device = args.device;
            if (!device) return false;
            try {
              const onoff = await device.getCapabilityValue("onoff");
              return !!onoff;
            } catch (e) {
              this.error("Error in condition (is hood on):", e);
              if (this.homey.app?.crashReporter) {
                await this.homey.app.crashReporter.reportError(e, { 
                  context: 'conditionRunListener',
                  device: device.getName()
                });
              }
              return false;
            }
          } catch (error) {
            this.error("Error in condition handler:", error);
            if (this.homey.app?.crashReporter) {
              await this.homey.app.crashReporter.reportError(error, { 
                context: 'conditionHandler',
                driver: 'DriverNovyInTouch'
              });
            }
            return false;
          }
        });
      }
      
      if (this.rfSendAction) {
        this.rfSendAction.registerRunListener(async (args) => {
          try {
            // Send RF command to device
            const device = args.device;
            const command = args.command;
            if (!device || !command) return false;
            
            try {
              // Simpel voorbeeld: zet onoff aan/uit op basis van commando
              if (
                command.toLowerCase() === "on" ||
                command.toLowerCase() === "aan" ||
                command.toLowerCase() === "ein"
              ) {
                await device.setCapabilityValue("onoff", true);
              } else if (
                command.toLowerCase() === "off" ||
                command.toLowerCase() === "uit" ||
                command.toLowerCase() === "aus"
              ) {
                await device.setCapabilityValue("onoff", false);
              } else {
                // Voor custom commando's kun je hier RF logica toevoegen
                this.log("Custom RF command:", command);
              }
              return true;
            } catch (e) {
              this.error("Error in action (send RF command):", e);
              if (this.homey.app?.crashReporter) {
                await this.homey.app.crashReporter.reportError(e, { 
                  context: 'actionSendCommand',
                  device: device.getName(),
                  command: command
                });
              }
              return false;
            }
          } catch (error) {
            this.error("Error in action handler:", error);
            if (this.homey.app?.crashReporter) {
              await this.homey.app.crashReporter.reportError(error, { 
                context: 'actionHandler',
                driver: 'DriverNovyInTouch'
              });
            }
            return false;
          }
        });
      }
      
      this.log("RF Driver initialized for Novy InTouch");
    } catch (error) {
      this.error("Failed to initialize RF driver:", error);
      if (this.homey.app?.crashReporter) {
        await this.homey.app.crashReporter.reportError(error, { 
          context: 'onRFInit',
          driver: 'DriverNovyInTouch'
        });
      }
      throw error;
    }
  }

  // RF learning method for Homey SDK v3
  async onPairListDevices() {
    this.log("Starting RF signal learning for Novy InTouch");

    // Always return empty array to trigger proper pairing flow
    // The actual RF learning happens in onPair method
    return [];
  }

  // Modern pairing method for RF learning
  async onPair(session) {
    this.log("Pairing session started");
    // Session state
    session.state = session.state || {};

    // 1. RF learning
session.setHandler("start_rf_learning", async () => {
      this.log("Starting RF learning from pairing interface");
      try {
        this.log("Starting RF signal learning...");
        const learnedSignal = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("RF learning timeout after 30 seconds"));
          }, 30000);
          const onRFSignal = (signal) => {
            this.log("RF signal received during learning:", signal);
            clearTimeout(timeout);
            this.removeListener("rf_signal", onRFSignal);
            resolve(signal);
          };
          this.on("rf_signal", onRFSignal);
          this.log("Listening for RF signals...");
        });
        this.log("RF signal learned successfully:", learnedSignal);
        session.state.learnedSignal = learnedSignal;
        return learnedSignal;
      } catch (error) {
        this.error("RF learning failed:", error);
        throw new Error(`RF learning failed: ${error.message}`);
      }
    });

    // 2. Test RF signal (user confirmation)
    session.setHandler("test_rf_signal", async ({ success }) => {
      this.log("User test_rf_signal:", success);
      session.state.signalConfirmed = !!success;
      if (!success) session.state.learnedSignal = null;
    });

    // 3. Device creation only if confirmed
    session.setHandler("list_devices", async () => {
      this.log("List devices called after RF learning and test");
      if (!session.state.learnedSignal || !session.state.signalConfirmed) {
        this.log("No valid signal learned or not confirmed by user");
        session.showView("rf_learning_failed");
        return [];
      }
      this.log("Creating device with signal:", session.state.learnedSignal);
      try {
        let deviceId = Math.random().toString(36).substr(2, 9);
        const learnedSignal = session.state.learnedSignal;
        if (learnedSignal.cmd) {
          deviceId = learnedSignal.cmd;
        } else if (learnedSignal.data) {
          deviceId = learnedSignal.data;
        }
        const device = {
          name: "Novy InTouch Hood",
          data: { id: deviceId },
          store: { learnedSignal },
        };
        this.log("Device created successfully:", device);
        return [device];
      } catch (error) {
        this.error("Failed to create device:", error);
        throw new Error(`Kon apparaat niet aanmaken: ${error.message}`);
      }
    });
  }

  // Handle RF signal reception
  async onRF(signal) {
    this.log("RF signal received:", signal);

    // Emit signal for learning process
    this.emit("rf_signal", signal);

    try {
      // Find devices that should respond to this signal
      const devices = this.getDevices();

      for (const device of devices) {
        const deviceSignal = device.getStoreValue("signal");
        if (deviceSignal && deviceSignal.cmd === signal.cmd) {
          await device.onRFReceived(signal);
        }
      }
    } catch (error) {
      this.error("Error handling RF signal:", error);
    }
  }
};
