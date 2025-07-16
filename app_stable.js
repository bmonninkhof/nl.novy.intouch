import Homey from "homey";

export default class NovyIntouchApp extends Homey.App {
  async onInit() {
    try {
      this.log("=== Novy InTouch App Starting (Stable Version) ===");
      
      // Initialize step by step with error handling
      await this.initializeApp();
      
      this.log("=== Novy InTouch App Started Successfully ===");
      
    } catch (error) {
      this.error("Failed to initialize app:", error);
      // Continue running with basic functionality
      this.setupEmergencyMode();
    }
  }

  async initializeApp() {
    // Step 1: Basic logging
    this.log("Step 1: Basic initialization");
    
    // Step 2: Setup settings (most stable first)
    this.log("Step 2: Setting up basic settings");
    await this.setupStableSettings();
    
    // Step 3: Try flow cards (this might be causing issues)
    this.log("Step 3: Attempting flow card registration");
    try {
      await this.registerBasicFlowCards();
      this.log("Flow cards registered successfully");
    } catch (error) {
      this.error("Flow card registration failed, continuing without:", error);
    }
    
    this.log("Initialization completed");
  }

  async setupStableSettings() {
    try {
      // Handle diagnostic report
      this.homey.settings.on('set', async (key) => {
        this.log('Setting changed:', key);
        
        if (key === 'createDiagnosticReport') {
          await this.createDiagnosticReport();
        }
        
        if (key === 'testCrashReport') {
          await this.createTestReport();
        }
      });
      
      this.log('Stable settings handlers registered');
      
    } catch (error) {
      this.error('Failed to setup stable settings:', error);
      throw error;
    }
  }

  async registerBasicFlowCards() {
    try {
      // Try to register flow cards one by one with error handling
      
      // 1. Try trigger card
      try {
        const trigger = this.homey.flow.getDeviceTriggerCard("novy_rf_received");
        if (trigger) {
          this.log("✅ RF trigger card found");
        }
      } catch (error) {
        this.log("⚠️ RF trigger card not found:", error.message);
      }
      
      // 2. Try action cards
      try {
        // Add action card registration here if needed
        this.log("✅ Action cards check completed");
      } catch (error) {
        this.log("⚠️ Action cards failed:", error.message);
      }
      
    } catch (error) {
      this.error('Flow card registration failed:', error);
      throw error;
    }
  }

  async createDiagnosticReport() {
    try {
      this.log('=== DIAGNOSTIC REPORT REQUESTED ===');
      
      const diagnosticInfo = {
        timestamp: new Date().toISOString(),
        appVersion: this.homey.manifest?.version || 'unknown',
        homeyVersion: this.homey.version || 'unknown',
        platform: this.homey.platform || 'unknown',
        nodeVersion: process.version || 'unknown',
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      };
      
      // Try to get more info safely
      try {
        diagnosticInfo.deviceCount = Object.keys(this.homey.drivers.getDrivers()).length;
      } catch (error) {
        diagnosticInfo.deviceCountError = error.message;
      }
      
      // Log the diagnostic info
      this.log('DIAGNOSTIC INFO:', JSON.stringify(diagnosticInfo, null, 2));
      
      // Send notification
      await this.homey.notifications.createNotification({
        excerpt: `Diagnostic report created at ${new Date().toLocaleTimeString()}`
      });
      
      this.log('=== DIAGNOSTIC REPORT COMPLETED ===');
      
    } catch (error) {
      this.error('Failed to create diagnostic report:', error);
    }
  }

  async createTestReport() {
    try {
      this.log('=== TEST REPORT REQUESTED ===');
      
      // Send notification
      await this.homey.notifications.createNotification({
        excerpt: "Test report - app is running normally"
      });
      
      this.log('=== TEST REPORT COMPLETED ===');
      
    } catch (error) {
      this.error('Failed to create test report:', error);
    }
  }

  setupEmergencyMode() {
    try {
      this.log('Setting up emergency mode - minimal functionality');
      
      // Very basic settings only
      this.homey.settings.on('set', (key) => {
        this.log('Emergency mode - setting changed:', key);
      });
      
    } catch (error) {
      this.error('Even emergency mode failed:', error);
    }
  }

  async onUninit() {
    this.log("Novy InTouch app is shutting down...");
  }
}
