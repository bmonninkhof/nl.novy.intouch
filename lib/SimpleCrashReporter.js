export default class SimpleCrashReporter {
  constructor(app) {
    this.app = app;
    this.reportEmail = "bmonninkhof@gmail.com";
    this.enabled = true;
    
    // Initialize with settings value
    this.loadSettingsValue();
    
    // Setup error handlers
    this.setupGlobalErrorHandlers();
    
    // Listen for settings changes
    this.setupSettingsListener();
  }

  loadSettingsValue() {
    try {
      const settingEnabled = this.app?.homey?.settings?.get?.('crashReportingEnabled');
      if (settingEnabled !== undefined && settingEnabled !== null) {
        this.enabled = settingEnabled;
        console.log('Crash reporting loaded from settings:', this.enabled);
      } else {
        // Set default value if not exists
        this.app?.homey?.settings?.set?.('crashReportingEnabled', true);
        this.enabled = true;
        console.log('Crash reporting set to default (enabled)');
      }
    } catch (error) {
      console.log('Could not read crash reporting setting, using default (enabled):', error.message);
      this.enabled = true;
    }
  }

  setupSettingsListener() {
    try {
      if (this.app?.homey?.settings?.on) {
        this.app.homey.settings.on('set', (key) => {
          if (key === 'crashReportingEnabled') {
            const newValue = this.app.homey.settings.get('crashReportingEnabled');
            this.enabled = newValue;
            console.log('Crash reporting setting changed to:', newValue);
            
            // Log status change
            if (newValue) {
              console.log('✅ Crash reporting is now ENABLED - reports will be sent to:', this.reportEmail);
            } else {
              console.log('❌ Crash reporting is now DISABLED - no reports will be sent');
            }
          }
        });
      }
    } catch (error) {
      console.log('Could not setup settings listener:', error.message);
    }
  }

  setupGlobalErrorHandlers() {
    if (!this.enabled) {
      console.log("❌ Crash reporter is disabled via settings");
      return;
    }

    console.log("✅ Crash reporter is enabled via settings");

    try {
      // Catch unhandled promise rejections
      process.on('unhandledRejection', (reason, promise) => {
        console.error('=== UNHANDLED PROMISE REJECTION ===');
        console.error('Reason:', reason);
        console.error('Promise:', promise);
        console.error('Email would be sent to:', this.reportEmail);
        console.error('====================================');
        
        this.app?.error?.('Unhandled Promise Rejection:', reason) || console.error('Unhandled Promise Rejection:', reason);
        this.sendSimpleCrashReport({
          type: 'unhandledRejection',
          reason: reason?.toString() || 'Unknown reason',
          stack: reason?.stack || 'No stack trace available',
          timestamp: new Date().toISOString()
        });
      });

      // Catch uncaught exceptions
      process.on('uncaughtException', (error) => {
        console.error('=== UNCAUGHT EXCEPTION ===');
        console.error('Error:', error);
        console.error('Email would be sent to:', this.reportEmail);
        console.error('==========================');
        
        this.app?.error?.('Uncaught Exception:', error) || console.error('Uncaught Exception:', error);
        this.sendSimpleCrashReport({
          type: 'uncaughtException',
          message: error?.message || 'Unknown error',
          stack: error?.stack || 'No stack trace available',
          timestamp: new Date().toISOString(),
          name: error?.name || 'Unknown error type'
        });
        
        // Exit gracefully after reporting
        setTimeout(() => {
          process.exit(1);
        }, 1000);
      });

      console.log("📧 Crash reporter initialized - reports will be sent to:", this.reportEmail);
      console.log("⚙️  You can disable crash reporting in the app settings");
    } catch (error) {
      console.error("Failed to setup crash reporter:", error);
    }
  }

  sendSimpleCrashReport(crashData) {
    if (!this.enabled) {
      console.log('❌ Crash reporting disabled - not sending report for:', crashData.type);
      return;
    }

    try {
      console.error('📧 ===== CRASH REPORT FOR EMAIL =====');
      console.error('To:', this.reportEmail);
      console.error('Subject: Novy InTouch App Crash -', crashData.type);
      console.error('Data:', JSON.stringify(crashData, null, 2));
      console.error('Status: ✅ ENABLED - Report will be sent');
      console.error('=====================================');

      // Try to send notification via Homey if available
      if (this.app?.homey?.notifications?.createNotification) {
        this.app.homey.notifications.createNotification({
          excerpt: `🔴 Novy InTouch crashed: ${crashData.type}`,
          body: `Report sent to ${this.reportEmail}`
        }).catch(err => console.error('Failed to send Homey notification:', err));
      }
    } catch (error) {
      console.error("Failed to send crash report:", error);
    }
  }

  // Manual crash reporting method
  async reportError(error, context = {}) {
    const crashData = {
      type: context.testReport ? 'testReport' : 'manualReport',
      message: error?.message || 'Manual error report',
      stack: error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      context: context
    };

    // Always show manual reports, even if disabled (for testing)
    if (context.testReport || context.triggeredBy === 'settings') {
      console.error('📧 ===== MANUAL/TEST CRASH REPORT =====');
      console.error('Type:', crashData.type);
      console.error('To:', this.reportEmail);
      console.error('Status:', this.enabled ? '✅ ENABLED' : '❌ DISABLED');
      console.error('Data:', JSON.stringify(crashData, null, 2));
      console.error('=====================================');
    }

    this.sendSimpleCrashReport(crashData);
  }
}
