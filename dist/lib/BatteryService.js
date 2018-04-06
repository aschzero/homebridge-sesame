"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HAP_1 = require("./HAP");
class BatteryService {
    constructor(name) {
        this.batteryService = new HAP_1.Hap.Service(name, '00000096-0000-1000-8000-0026BB765291');
    }
    addCharacteristics() {
        this.batteryService.addCharacteristic(HAP_1.Hap.Characteristic.BatteryLevel);
        this.batteryService.getCharacteristic(HAP_1.Hap.Characteristic.BatteryLevel)
            .on('get', (callback) => {
            callback(null, 44);
        });
    }
}
exports.BatteryService = BatteryService;
//# sourceMappingURL=BatteryService.js.map