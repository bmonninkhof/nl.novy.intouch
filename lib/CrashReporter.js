import Homey from "homey";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class CrashReporter {
  constructor(app) {
    this.app = app;
    this.loadConfig();
    this.setupGlobalErrorHandlers();
  }

  loadConfig() {
    // Simplified config loading without file system access
    this.config = {
      enabled: true,
      email: "bmonninkhof@gmail.com",
      enableNotifications: true,
      enableHTTP: false, // Disable HTTP for now to avoid fetch issues
      reportWarnings: false,
      reportLevel: "error"
    };

    // Set defaults
    this.reportEmail = this.config.email;
    this.enabled = this.config.enabled;
    this.webhookUrl = null; // Disable webhook for now
    this.enableNotifications = this.config.enableNotifications;
    this.enableHTTP = false; // Disable HTTP to avoid complications
    this.reportWarnings = this.config.reportWarnings;
    this.reportLevel = this.config.reportLevel;
  }

  setupGlobalErrorHandlers() {
    if (!this.enabled) {
      this.app.log("Crash reporter is disabled");
      return;
    }

    // Catch unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.app.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
      this.sendCrashReport({
        type: 'unhandledRejection',
        reason: reason?.toString() || 'Unknown reason',
        stack: reason?.stack || 'No stack trace available',
        timestamp: new Date().toISOString(),
        promise: promise?.toString() || 'Unknown promise'
      });
    });

    // Catch uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.app.error('Uncaught Exception:', error);
      this.sendCrashReport({
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

    // Catch warnings
    process.on('warning', (warning) => {
      this.app.log('Warning:', warning);
      // Only report warnings if enabled and not deprecation/experimental warnings
      if (!this.reportWarnings) return;
      if (warning.name === 'DeprecationWarning' || warning.name === 'ExperimentalWarning') {
        return;
      }
      
      this.sendCrashReport({
        type: 'warning',
        message: warning?.message || 'Unknown warning',
        stack: warning?.stack || 'No stack trace available',
        timestamp: new Date().toISOString(),
        name: warning?.name || 'Unknown warning type'
      });
    });

    this.app.log("Crash reporter initialized - will send reports to:", this.reportEmail);
  }

  async sendCrashReport(crashData) {
    try {
      const appInfo = {
        appId: this.app.manifest?.id || 'unknown',
        appVersion: this.app.manifest?.version || 'unknown',
        sdk: this.app.manifest?.sdk || 'unknown',
        homeyVersion: this.app.homey?.version || 'unknown',
        platform: this.app.homey?.platform || 'unknown'
      };

      const reportData = {
        ...crashData,
        appInfo,
        deviceInfo: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime()
        }
      };

      // Log the crash data locally first
      this.app.error("=== CRASH REPORT ===");
      this.app.error("Email would be sent to:", this.reportEmail);
      this.app.error("Crash data:", JSON.stringify(reportData, null, 2));
      this.app.error("===================");

      // Only try Homey notifications (safer)
      await this.sendViaHomeyNotification(reportData);

    } catch (error) {
      this.app.error("Failed to send crash report:", error);
    }
  }

  async sendViaHTTP(reportData) {
    if (!this.enableHTTP || !this.webhookUrl) {
      this.app.log("HTTP crash reporting disabled or no webhook URL configured");
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Novy-InTouch-Homey-App'
        },
        body: JSON.stringify({
          to: this.reportEmail,
          subject: `Novy InTouch App Crash Report - ${reportData.type}`,
          crashData: reportData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        this.app.log("Crash report sent via HTTP successfully");
      } else {
        this.app.error("HTTP crash report failed:", response.status, response.statusText);
      }
    } catch (error) {
      this.app.error("Failed to send crash report via HTTP:", error);
    }
  }

  async sendViaHomeyNotification(reportData) {
    if (!this.enableNotifications) {
      this.app.log("Homey notifications disabled for crash reporting");
      return;
    }

    try {
      // Send as a Homey notification
      const message = `Novy InTouch App Crash: ${reportData.type}\n${reportData.message || reportData.reason}\nTime: ${reportData.timestamp}`;
      
      await this.app.homey.notifications.createNotification({
        excerpt: `Novy InTouch App crashed: ${reportData.type}`,
        body: message
      });

      this.app.log("Crash report sent via Homey notification");
    } catch (error) {
      this.app.error("Failed to send crash report via Homey notification:", error);
    }
  }

  // Manual crash reporting method
  async reportError(error, context = {}) {
    const crashData = {
      type: 'manualReport',
      message: error?.message || 'Manual error report',
      stack: error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      context: context
    };

    await this.sendCrashReport(crashData);
  }
}
