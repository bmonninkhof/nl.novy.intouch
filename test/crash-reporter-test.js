#!/usr/bin/env node

/**
 * Test script for crash reporting system
 * Run this to test if crash reports are being sent correctly
 */

import CrashReporter from '../lib/CrashReporter.js';

// Mock Homey app for testing
const mockApp = {
  log: (...args) => console.log('[LOG]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  manifest: {
    id: 'nl.novy.intouch',
    version: '3.0.1',
    sdk: 3
  },
  homey: {
    version: '12.0.1',
    platform: 'local',
    notifications: {
      createNotification: async (data) => {
        console.log('[NOTIFICATION]', data);
      }
    }
  }
};

async function testCrashReporter() {
  console.log('🧪 Testing Crash Reporter System...\n');

  const crashReporter = new CrashReporter(mockApp);

  // Test 1: Manual error reporting
  console.log('Test 1: Manual error reporting');
  try {
    await crashReporter.reportError(new Error('Test error'), { 
      test: true, 
      context: 'manual test' 
    });
    console.log('✅ Manual error reporting test completed\n');
  } catch (error) {
    console.error('❌ Manual error reporting test failed:', error, '\n');
  }

  // Test 2: Simulated unhandled promise rejection
  console.log('Test 2: Simulated unhandled promise rejection');
  setTimeout(() => {
    Promise.reject(new Error('Test unhandled promise rejection'));
  }, 100);

  // Test 3: Simulated uncaught exception (commented out as it would exit the process)
  // console.log('Test 3: Simulated uncaught exception');
  // setTimeout(() => {
  //   throw new Error('Test uncaught exception');
  // }, 200);

  console.log('✅ Promise rejection test triggered (check logs)\n');

  // Test 4: Warning test
  console.log('Test 4: Process warning test');
  setTimeout(() => {
    process.emitWarning('Test warning for crash reporter', 'TestWarning');
  }, 300);

  console.log('✅ Warning test triggered (check logs)\n');

  console.log('🎉 All crash reporter tests completed!');
  console.log('📧 If configured correctly, reports should be sent to:', crashReporter.reportEmail);
  
  // Keep process alive briefly to catch async events
  setTimeout(() => {
    console.log('\n🔚 Test script finished');
    process.exit(0);
  }, 2000);
}

testCrashReporter().catch(console.error);
