### Novy Intouch Driver V2

With this app you can manage your Novy Intouch devices via Homey.

The driver is written for SDK 2 and contains most of the device features.  
This app is build from scratch, with some content borrowed from [this app][v1-link].

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
No conditions defined yet (*comming soon...*)

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

- Flow conditions
- Keep track of `Auto-Stop` timeout (security measure, hood (not light) is turned off after 3 our of inactivity)
- Keep track of `POWER level` timeout => reduced to speed level 3 after 6 minutes
- Setting to override `run out` timeout (< 10 minutes)
- Setting to override `auto-stop` timeout (< 3 hours)
- Setting to override `power` timeout (<6 minutes)
- Handle `light` dimming (continues press)
- Create seperate device for the Intouch Remote

### Known bugs

- Device state is not updated when changing settings

### Change log

- **V2.0.2** [2018-09-05]: Resolved App store crash
- **V2.0.1** [2018-09-04]: Bug fixes
- **V2.0.0** [2018-08-26]: Initial release

## Final note ##
The repository is available at: https://github.com/harriedegroot/nl.novy.intouch

If you like the app, consider a donation to support development :beer: 
 
[![Donate][pp-donate-image]][pp-donate-link]

[v1-link]: https://github.com/ralfvd/be.novy.intouch
[v1-author]: https://github.com/ralfvd/be.novy.intouch
[pp-donate-link]: https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=harriedegroot%40gmail%2ecom&lc=NL&item_name=Harrie%20de%20Groot&item_number=Homey%20Novy%20Intouch%20App&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted
[pp-donate-image]: https://img.shields.io/badge/Donate-PayPal-green.svg
