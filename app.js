import Homey from "homey";
import SimpleCrashReporter from "./lib/SimpleCrashReporter.js";

export default class NovyIntouchApp extends Homey.App {
  async onInit() {
    try {
      console.log("Novy InTouch app is starting...");
      this.log("Novy InTouch app is starting...");
      
      // Initialize crash reporter first
      this.crashReporter = new SimpleCrashReporter(this);
      console.log("Crash reporter initialized");
      
      // Register flow cards
      await this.registerFlowCards();
      
      console.log("Novy InTouch app has been initialized successfully");
      this.log("Novy InTouch app has been initialized successfully");
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.error("Failed to initialize app:", error);
      
      // Report the initialization error
      if (this.crashReporter) {
        await this.crashReporter.reportError(error, { phase: 'initialization' });
      }
      
      throw error;
    }
  }

  async registerFlowCards() {
    try {
      this.log("Registering flow cards...");
      
      // Register flow trigger card for RF received - using getDeviceTriggerCard
      try {
        const rfReceivedTrigger = this.homey.flow.getDeviceTriggerCard("novy_rf_received");
        if (rfReceivedTrigger) {
          this.log("RF received trigger card found and registered");
        }
      } catch (error) {
        this.log("RF received trigger card not found:", error.message);
        if (this.crashReporter) {
          await this.crashReporter.reportError(error, { context: 'registerFlowTrigger' });
        }
      }

      // Register flow condition card
      try {
        const rfCondition = this.homey.flow.getConditionCard("novy_rf_condition");
        if (rfCondition) {
          this.log("RF condition card found and registered");
        }
      } catch (error) {
        this.log("RF condition card not found:", error.message);
        if (this.crashReporter) {
          await this.crashReporter.reportError(error, { context: 'registerFlowCondition' });
        }
      }

      // Register flow action card
      try {
        const rfAction = this.homey.flow.getActionCard("novy_rf_send");
        if (rfAction) {
          this.log("RF action card found and registered");
        }
      } catch (error) {
        this.log("RF action card not found:", error.message);
        if (this.crashReporter) {
          await this.crashReporter.reportError(error, { context: 'registerFlowAction' });
        }
      }

      // Register manual crash report action
      try {
        const crashReportAction = this.homey.flow.getActionCard("send_crash_report");
        if (crashReportAction) {
          crashReportAction.registerRunListener(async (args) => {
            try {
              const message = args.message || "Manual crash report triggered via flow";
              this.log("Manual crash report requested:", message);
              
              if (this.crashReporter) {
                await this.crashReporter.reportError(new Error(message), { 
                  context: 'manualFlowReport',
                  userMessage: message,
                  triggeredBy: 'flow'
                });
              }
              
              // Also send a Homey notification
              await this.homey.notifications.createNotification({
                excerpt: "Crash report sent to developer"
              });
              
              return true;
            } catch (error) {
              this.error("Failed to send manual crash report:", error);
              throw new Error("Failed to send crash report");
            }
          });
          this.log("Manual crash report action registered");
        }
      } catch (error) {
        this.log("Manual crash report action not found:", error.message);
      }

      // Register settings handlers
      this.registerSettingsHandlers();

      this.log("Flow cards registration completed");
    } catch (error) {
      this.error("Failed to register flow cards:", error);
      
      // Report the flow card registration error
      if (this.crashReporter) {
        await this.crashReporter.reportError(error, { phase: 'flowCardRegistration' });
      }
      
      // Don't throw here, as flow cards might not exist yet
    }
  }

  registerSettingsHandlers() {
    try {
      // Handle crash reporting enable/disable
      this.homey.settings.on('set', (key) => {
        if (key === 'crashReportingEnabled') {
          const enabled = this.homey.settings.get('crashReportingEnabled');
          this.log('Crash reporting setting changed to:', enabled);
          
          if (this.crashReporter) {
            this.crashReporter.enabled = enabled;
          }
          
          // Update status label
          const statusText = enabled 
            ? 'Active - Reports will be sent to bmonninkhof@gmail.com'
            : 'Disabled - No reports will be sent';
          
          this.homey.settings.set('crashReportingStatus', statusText);
          
          // Send notification about change
          this.homey.notifications.createNotification({
            excerpt: enabled ? 'Crash reporting enabled' : 'Crash reporting disabled'
          }).catch(() => {}); // Silent fail if notifications don't work
        }
      });

      // Handle test crash report button
      this.homey.settings.on('set', async (key) => {
        if (key === 'testCrashReport') {
          try {
            this.log('Test crash report requested from settings');
            
            if (this.crashReporter) {
              await this.crashReporter.reportError(new Error('Test crash report from app settings'), {
                context: 'testCrashReport',
                userMessage: 'This is a test crash report to verify the reporting system is working',
                triggeredBy: 'settings_test_button',
                testReport: true
              });
            }
            
            // Send notification
            await this.homey.notifications.createNotification({
              excerpt: "Test crash report sent successfully",
              body: "Check console logs or email for the test report"
            });
            
          } catch (error) {
            this.error('Failed to send test crash report:', error);
            
            await this.homey.notifications.createNotification({
              excerpt: "Failed to send test crash report",
              body: "Check app logs for more details"
            });
          }
        }
      });

      // Handle manual report button
      this.homey.settings.on('set', async (key) => {
        if (key === 'sendManualReport') {
          try {
            const message = this.homey.settings.get('manualReportMessage') || 'Manual report from app settings';
            this.log('Manual report requested from settings:', message);
            
            if (this.crashReporter) {
              await this.crashReporter.reportError(new Error('Manual report from settings'), {
                context: 'manualSettingsReport',
                userMessage: message,
                triggeredBy: 'settings'
              });
            }
            
            // Send notification
            await this.homey.notifications.createNotification({
              excerpt: "Manual report sent to developer"
            });
            
            // Clear the message field
            this.homey.settings.set('manualReportMessage', '');
            
          } catch (error) {
            this.error('Failed to send manual report from settings:', error);
          }
        }
      });

      // Handle diagnostic report button  
      this.homey.settings.on('set', async (key) => {
        if (key === 'createDiagnosticReport') {
          try {
            this.log('Diagnostic report requested from settings');
            
            if (this.crashReporter) {
              // Collect comprehensive diagnostic information
              const diagnosticInfo = await this.collectDiagnosticInfo();
              
              await this.crashReporter.reportError(new Error('Diagnostic report requested by user'), {
                context: 'diagnosticReport',
                diagnosticInfo: diagnosticInfo,
                triggeredBy: 'settings_diagnostic_button',
                timestamp: new Date().toISOString()
              });
            }
            
            // Send notification
            await this.homey.notifications.createNotification({
              excerpt: "Diagnostic report has been sent to the developer"
            });
            
          } catch (error) {
            this.error('Failed to create diagnostic report:', error);
            
            // Still try to send error report
            if (this.crashReporter) {
              await this.crashReporter.reportError(error, {
                context: 'diagnosticReportFailure',
                triggeredBy: 'settings_diagnostic_button'
              });
            }
          }
        }
      });

      // Initialize status label
      const enabled = this.homey.settings.get('crashReportingEnabled');
      const statusText = enabled 
        ? 'Active - Reports will be sent to bmonninkhof@gmail.com'
        : 'Disabled - No reports will be sent';
      this.homey.settings.set('crashReportingStatus', statusText);

      this.log('Settings handlers registered');
    } catch (error) {
      this.error('Failed to register settings handlers:', error);
    }
  }

  async onUninit() {
    this.log("Novy InTouch app is shutting down...");
  }

  async collectDiagnosticInfo() {
    try {
      const info = {
        timestamp: new Date().toISOString(),
        appVersion: this.homey.manifest.version,
        homeyVersion: this.homey.version,
        platform: this.homey.platform || 'unknown',
        settings: {},
        devices: [],
        flows: [],
        systemInfo: {}
      };

      // Collect app settings (safely)
      try {
        info.settings = {
          crashReportingEnabled: this.homey.settings.get('crashReportingEnabled'),
          // Don't include sensitive data like messages
        };
      } catch (error) {
        info.settings = { error: error.message };
      }

      // Collect device information
      try {
        const devices = this.homey.drivers.getDrivers();
        for (const [driverId, driver] of devices) {
          const driverDevices = driver.getDevices();
          info.devices.push({
            driverId: driverId,
            deviceCount: driverDevices.length,
            devices: driverDevices.map(device => ({
              id: device.getData().id || 'unknown',
              name: device.getName(),
              class: device.getClass(),
              available: device.getAvailable(),
              capabilities: device.getCapabilities()
            }))
          });
        }
      } catch (error) {
        info.devices = [{ error: error.message }];
      }

      // Collect flow information (count only for privacy)
      try {
        const flows = await this.homey.flow.getFlows();
        info.flows = {
          totalFlows: flows.length,
          enabledFlows: flows.filter(flow => flow.enabled).length,
          // Don't include actual flow content for privacy
        };
      } catch (error) {
        info.flows = { error: error.message };
      }

      // Collect basic system info
      try {
        info.systemInfo = {
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          timezone: this.homey.clock.getTimezone(),
          // Don't include sensitive system info
        };
      } catch (error) {
        info.systemInfo = { error: error.message };
      }

      return info;
    } catch (error) {
      this.error('Failed to collect diagnostic info:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}
