'use strict';

/** Signals
    light:    (18) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 1, 1, 0, 1, 0, 0, 0, 1]
    increase: (12) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 0, 1]
    decrease: (12) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 1, 0]
    onoff:      (18) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 1, 1, 0, 1, 0, 0, 1, 1]

    light: short press on/off, long press 0 <-> 1 (dimming)
    fan: 0,1,2,3,4
    on  => restore previous fan & light
    off => keep state & light=0 & fan=0
    novy: nothing...

    NOTES:
    1. How to handle dimming?
    2. Set damper speed to 0,1,2,3,4?
    3. What about Signals when pressing buttons on the damper???
    4. Signals from the cooking unit?

**/

const Signal = {
    address: '0101010101',
    light: '11010001',
    increase: '01',
    decrease: '10',
    onoff: '11010011',
    novy: '00'
};

module.exports = { Signal };
