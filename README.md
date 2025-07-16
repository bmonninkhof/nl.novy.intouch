# Novy InTouch

Control your Novy InTouch hood with Homey.

**🇳🇱 [Nederlandse versie](README.nl.md)**

## Features

- Control hood fan speed (0-4 levels)
- Control hood lights
- Receive feedback from hood remote
- Support for run-out mode
- Flow cards for automation

## Supported Devices

- Novy InTouch hood with 433MHz remote control

## Installation

Install this app from the Homey Community Store or install it manually by uploading the app to your Homey.

## Pairing

1. Go to Devices → Add Device
2. Select Novy InTouch
3. Select the Novy InTouch hood device
4. Follow the pairing instructions to pair your remote control

## Usage

After pairing, you can control your hood using:

- The Homey mobile app
- Voice commands (if supported)
- Flows

## Settings

### General Settings

- **On/off action**: Choose what happens when you press the on/off button
  - Hood & Lights: Controls both hood and lights
  - Lights only: Controls only the lights
  - Hood only: Controls only the hood
- **Turn off with run-out mode**: When enabled, the hood will run for 10 minutes before turning off

### Current State

- **Lights on**: Indicates if the lights are currently on
- **Current hood speed**: Shows the current speed level (0-4)

## Flow Cards

### Triggers

- **Command received**: Triggered when a command is received from the remote

### Actions

- **Send command to the hood**: Send various commands to the hood

## Changelog

### v3.0.0 [2025-07-13]

- **Major update**: Complete migration to Homey SDK v3
- Updated to modern JavaScript async/await patterns
- Upgraded homey-rfdriver to v3.3.2
- Improved app manifest structure and validation
- Enhanced flow cards with proper titleFormatted support
- Modernized device capability handling
- Clean code architecture following SDK v3 best practices
- Removed deprecated SDK v2 features
- Full compatibility with Homey v5.0.0+

## Support

For support, please visit the [GitHub repository](https://github.com/TheLostHomeyAppRepositories/nl.novy.intouch).

## License

This project is licensed under the ISC License.

### Settings

The app allows you to control the following device settings:

- `On/off` action: `hood & light` | `light only` | `hood only`
- `Run-out` mode: `enabled`/`disabled`
- `Light` state: `on/off` (_see explanation below_)
- `Speed level`: Current motor speed level (_see explanation below_)

### Flow support

_Commands_

- Device: `on`, `off`, `toggle` & `off with run-out mode` (10 min.)
- Light: `on`, `off` & `toggle`
- Motor speed: `increase`, `decrease`, `off`, `level 1`, `level 2`, `level 3`, `POWER level`

_Triggers_  
There are triggers defined for all the above commands

_Conditions_  
No conditions defined yet (_coming soon..._)

_Actions_  
There are actions defined for all the above commands

### Internal state

**Important:** Novy Intouch does not specify separate signals for `on` and `off` actions (only a `toggle` signal is available).
Therefore Homey has to keep an internal `state` for `on/off`, `light` & `motor speed level`. This internal `state` is used to be able to send separate commands for `on`, `off` & `speed level`.

The internal `state` is _updated_ on:

1. Pressing buttons on the Novy Intouch remote (Homey receives a _signal_).
2. Triggers from the app (_Mobile card_)
3. Flow triggers & actions
4. Manual override via Settings

The internal `state` is **NOT** updated when:

1. Pressing buttons on the device (i.e. hood)
2. Remote signal is not detected
3. Device safety measures (e.g. overheating)
4. Timeouts (for now..._to be implemented_)
5. Other unknown reasons...

### TODO

- Support additional signals
- Create standalone light device
- Flow conditions
- Keep track of `Auto-Stop` timeout (security measure, hood (not light) is turned off after 3 hours of inactivity)
- Keep track of `POWER level` timeout => reduced to speed level 3 after 6 minutes
- Setting to override `run out` timeout (< 10 minutes)
- Setting to override `auto-stop` timeout (< 3 hours)
- Setting to override `power` timeout (<6 minutes)
- Handle `light` dimming (continuous press)
- Create separate device for the Intouch Remote

## Crash Reporting

This app includes an automated crash reporting system that helps improve stability and reliability. **You have full control over this feature.**

### 🔧 Control Options

#### In-App Settings (Recommended)
1. Open the Novy InTouch app in Homey
2. Click the ⚙️ **Settings** gear icon
3. Go to **"Crash Reporting"** section
4. **Toggle the checkbox** to enable/disable automatic reporting
5. View current status: "Active" or "Disabled" 
6. Click **"Test crash reporting"** to verify it's working

#### Real-time Control
- ✅ **Enable**: Turn on the checkbox → Reports are sent to bmonninkhof@gmail.com
- ❌ **Disable**: Turn off the checkbox → No reports are sent
- 🧪 **Test**: Click test button → Send a test report to verify functionality
- 📊 **Status**: Always shows current state (Active/Disabled)

### What gets reported

When the app encounters an error, the following information is automatically collected and sent:
- Error type and message
- Stack trace
- Timestamp
- App version and environment info
- Device context (no personal data)

### How it works

- **Automatic detection**: Catches unhandled errors, promise rejections, and critical warnings
- **User controlled**: You decide if reports are sent or not
- **Real-time toggle**: Changes take effect immediately
- **Privacy focused**: Only technical error data is collected, no personal information
- **Test function**: Verify the system works before relying on it

### Manual crash reporting

If you experience issues with the app, you can manually send a crash report in several ways:

#### Via App Settings
1. Open the Novy InTouch app in Homey
2. Go to App Settings (gear icon)
3. Under "Manual Reporting", describe your problem
4. Click "Send report to developer"

#### Via Flow Cards
1. Create a new Flow
2. Add action "Send crash report manually"
3. Enter your problem description
4. The report will be sent to bmonninkhof@gmail.com

#### What gets sent
- Your problem description
- App version and environment info
- Timestamp of the report
- No personal data or device information
