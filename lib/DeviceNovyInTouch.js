import { RFDevice } from "homey-rfdriver";

export default class DeviceNovyInTouch extends RFDevice {
  // Static property assignment for ES2021 compatibility
  static get CAPABILITIES() {
    return {
      onoff: ({ value, data }) => ({
        ...data,
        state: !!value,
        group: false,
      }),
    };
  }

  async onAdded() {
    if (this.hasCapability("onoff")) {
      await this.setCapabilityValue("onoff", false);
    }
    this.log("Novy InTouch device added with ID:", this.getData().id);
  }

  async txOn() {
    await this.driver.tx({
      ...this.getData(),
      state: true,
    });
  }

  async txOff() {
    await this.driver.tx({
      ...this.getData(),
      state: false,
    });
  }
};
