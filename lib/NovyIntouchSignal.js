'use strict';

/** Signals
    light:    (18) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 1, 1, 0, 1, 0, 0, 0, 1]
    increase: (12) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 0, 1]
    decrease: (12) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 1, 0]
    onoff:    (18) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 1, 1, 0, 1, 0, 0, 1, 1]
    novy:     (12) [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, | 0, 0]

    light: short press on/off, long press 0 <-> 1 (dimming)
    hood speed: 0 (off),1,2,3,4 (power level)
    on  => restore previous fan & light
    off => keep state & light=0 & fan=0
    novy: nothing...

    NOTES:
    1. Signals from the hood (buttons/state)???
    2. Signals from the cooking unit?

**/

const Signal = {
    address: '0101010101',
    light: '11010001',
    increase: '01',
    decrease: '10',
    onoff: '11010011',
    novy: '00',
    none: '00000000' // Invalid signal
};

module.exports = { Signal };
