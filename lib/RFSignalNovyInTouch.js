import { RFSignal } from "homey-rfdriver";

export default class RFSignalNovyInTouch extends RFSignal {
  static get FREQUENCY() {
    return "433";
  }
  static get ID() {
    return "novy_intouch";
  }

  static commandToPayload({ id = "000000", state = false, group = false }) {
    // Convert hex ID to bits
    const idBits = [];
    for (let i = 0; i < id.length; i++) {
      const nibble = parseInt(id[i], 16);
      for (let j = 3; j >= 0; j--) {
        idBits.push((nibble >> j) & 1);
      }
    }

    // Create command bits
    const stateBit = state ? 1 : 0;
    const groupBit = group ? 1 : 0;

    // Combine into payload (24 bits total)
    const payload = [
      ...idBits.slice(0, 20), // 20 bits for ID
      groupBit, // 1 bit for group
      stateBit, // 1 bit for state
      0, // 1 bit padding
      0, // 1 bit padding
    ];

    return payload;
  }

  static payloadToCommand(payload) {
    if (!payload || payload.length < 22) {
      return null;
    }

    // Extract ID from first 20 bits
    let id = "";
    for (let i = 0; i < 20; i += 4) {
      let nibble = 0;
      for (let j = 0; j < 4; j++) {
        nibble = (nibble << 1) | (payload[i + j] || 0);
      }
      id += nibble.toString(16);
    }

    // Extract group and state bits
    const group = payload[20] === 1;
    const state = payload[21] === 1;

    return {
      id: id,
      group: group,
      state: state,
    };
  }
};
