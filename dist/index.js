"use strict";
const LockPlatform_1 = require("./lib/LockPlatform");
const HAP_1 = require("./lib/HAP");
module.exports = (homebridge) => {
    HAP_1.Hap.Accessory = homebridge.platformAccessory;
    HAP_1.Hap.Service = homebridge.hap.Service;
    HAP_1.Hap.Characteristic = homebridge.hap.Characteristic;
    HAP_1.Hap.UUIDGen = homebridge.hap.uuid;
    homebridge.registerPlatform('homebridge-sesame', 'Sesame', LockPlatform_1.LockPlatform, true);
};
//# sourceMappingURL=index.js.map