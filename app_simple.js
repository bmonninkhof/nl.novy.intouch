import Homey from "homey";

export default class NovyIntouchApp extends Homey.App {
  async onInit() {
    try {
      this.log("=== Novy InTouch App Starting (Simple Version) ===");
      
      // Minimal initialization
      this.log("App initialized successfully - basic version");
      
      // Setup basic settings handlers only
      this.setupBasicSettings();
      
      this.log("=== Novy InTouch App Started Successfully ===");
      
    } catch (error) {
      this.error("Failed to initialize app:", error);
      // Don't throw - let app continue running
    }
  }

  setupBasicSettings() {
    try {
      // Very basic settings handler
      this.homey.settings.on('set', async (key) => {
        this.log('Setting changed:', key);
        
        if (key === 'createDiagnosticReport') {
          this.log('Diagnostic report requested');
          
          try {
            // Create basic diagnostic info
            const diagnosticInfo = {
              timestamp: new Date().toISOString(),
              appVersion: this.homey.manifest?.version || 'unknown',
              homeyVersion: this.homey.version || 'unknown',
              message: 'Diagnostic report from simple app version'
            };
            
            this.log('Diagnostic info collected:', JSON.stringify(diagnosticInfo, null, 2));
            
            // Send notification
            await this.homey.notifications.createNotification({
              excerpt: "Diagnostic report created (check app logs)"
            });
            
          } catch (error) {
            this.error('Failed to create diagnostic report:', error);
          }
        }
      });
      
      this.log('Basic settings handlers registered');
      
    } catch (error) {
      this.error('Failed to setup settings:', error);
    }
  }

  async onUninit() {
    this.log("Novy InTouch app is shutting down...");
  }
}
