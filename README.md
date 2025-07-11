### Novy Intouch Driver V3 (Homey SDK v3)

With this app you can manage your Novy Intouch devices via Homey.

**Note: This version has been completely rewritten for Homey SDK v3 and requires Homey v5.0.0 or higher.**

### What's New in V3
- **Complete SDK v3 Migration**: Fully rewritten to use Homey SDK v3
- **Modern RF Implementation**: Uses native Homey RF API instead of homey-rfdriver
- **Improved Performance**: Streamlined codebase with better error handling
- **Enhanced Compatibility**: Designed for Homey v5.0.0 and later

### Migration from V2
If you're upgrading from V2, please note:
- Devices will need to be re-paired after updating to V3
- All functionality remains the same, but the underlying implementation is modernized
- Settings and device data will be preserved during the upgrade


### Installation
After installing the app on your Homey, add your Novy Intouch system by pairing the device.  
Just follow the on-screen instructions...

If the device is added: **check the device settings** to ensure the `internal state` is correct (*see below*).

### Mobile

A mobile card with `on/off` button, `dimming slider` & `light` switch is available to control the device.
- `on/off` button controls the device state and can be configured via Settings (*see below*).   
- `slider` controls the motor `speed level`
- `light` switch controls the lights

The mobile card also contains a sensor displaying the current motor `speed level`.

### Settings
The app allows you to control the following device settings:
- `On/off` action: `hood & light` | `light only` | `hood only`
- `Run-out` mode: `enabled`/`disabled`
- `Light` state: `on/off` (*see explenation below*)
- `Speed level`: Current motor speed level (*see explenation below*)

### Flow support

*Commands*

- Device: `on`, `off`, `toggle` & `off with run-out mode` (10 min.)
- Light: `on`, `off` & `toggle` 
- Motor speed: `increase`, `decrease`, `off`, `level 1`, `level 2`, `level 3`, `POWER level`

*Triggers*  
There are triggers defined for all the above commands

*Conditions*  
No conditions defined yet (*coming soon...*)

*Actions*  
There are actions defined for all the above commands

### Internal state
**Important:** Novy Intouch does not specify seperate signals for `on` and `off` actions (only a `toggle` signal is available).
Therefore Homey has to keep an internal `state` for `on/off`, `light` & `motor speed level`. This internal `state` is used to be able to send seperate commands for `on`, `off` & `speed level`.  

The internal `state` is *updated* on:
1. Pressing buttons on the Novy Intouch remote (Homey receives a *signal*).
2. Triggers from the app (*Mobile card*)
3. Flow triggers & actions
4. Manual override via Settings

The internal `state` is **NOT** updated when:
1. Pressing buttons on the device (i.e. hood)
2. Remote signal is not detected
3. Device safety measures (e.g. overheating)
4. Timeouts (for now...*to be implemented*)
5. Other unknown reasons...

### TODO
- Support additional signals
- Create standalone light device
- Flow conditions
- Keep track of `Auto-Stop` timeout (security measure, hood (not light) is turned off after 3 our of inactivity)
- Keep track of `POWER level` timeout => reduced to speed level 3 after 6 minutes
- Setting to override `run out` timeout (< 10 minutes)
- Setting to override `auto-stop` timeout (< 3 hours)
- Setting to override `power` timeout (<6 minutes)
- Handle `light` dimming (continues press)
- Create seperate device for the Intouch Remote

### Change log

- **V2.0.3** [2019-02-03]: Resolved speed level BUG
- **V2.0.2** [2018-09-05]: Resolved App store crash
- **V2.0.1** [2018-09-04]: Bug fixes
- **V2.0.0** [2018-08-26]: Initial release

## Final note ##
The repository is available at: https://github.com/harriedegroot/nl.novy.intouch

Do you like this app? Consider a donation to support development. 
 
[![Donate][pp-donate-image]][pp-donate-link]

[v1-link]: https://github.com/ralfvd/be.novy.intouch
[v1-author]: https://github.com/ralfvd/be.novy.intouch
[pp-donate-link]: https://www.paypal.me/harriedegroot
[pp-donate-image]: https://img.shields.io/badge/Donate-PayPal-green.svg
