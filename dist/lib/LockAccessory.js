"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lock_1 = require("./Lock");
const HAP_1 = require("./HAP");
const HSLogger_1 = require("./HSLogger");
class LockAccessory {
    constructor(accessory, lockProperties) {
        this.lockProperties = lockProperties;
        this.accessory = accessory;
        this.lock = new Lock_1.Lock(lockProperties);
        this.setupAccessoryInformationServiceCharacteristics();
        this.setupLockMechanismServiceCharacteristics();
        this.setupBatteryServiceCharacteristics();
        this.accessory.updateReachability(true);
        HSLogger_1.Logger.log(`Created accessory for ${this.lock.nickname}`);
    }
    getOrCreateLockMechanismService() {
        let lockMechanismService = this.accessory.getService(HAP_1.Hap.Service.LockMechanism);
        if (!lockMechanismService) {
            lockMechanismService = this.accessory.addService(HAP_1.Hap.Service.LockMechanism, this.lock.nickname);
        }
        return lockMechanismService;
    }
    getOrCreateBatteryService() {
        let batteryService = this.accessory.getService(HAP_1.Hap.Service.BatteryService);
        if (!batteryService) {
            batteryService = this.accessory.addService(HAP_1.Hap.Service.BatteryService, this.lock.nickname);
        }
        return batteryService;
    }
    setupAccessoryInformationServiceCharacteristics() {
        this.accessory.getService(HAP_1.Hap.Service.AccessoryInformation)
            .setCharacteristic(HAP_1.Hap.Characteristic.Manufacturer, 'CANDY HOUSE')
            .setCharacteristic(HAP_1.Hap.Characteristic.Model, 'Sesame')
            .setCharacteristic(HAP_1.Hap.Characteristic.SerialNumber, '123-456-789');
    }
    setupLockMechanismServiceCharacteristics() {
        let lockMechanismService = this.getOrCreateLockMechanismService();
        lockMechanismService
            .getCharacteristic(HAP_1.Hap.Characteristic.LockCurrentState)
            .on('get', this.getLockState.bind(this));
        lockMechanismService
            .getCharacteristic(HAP_1.Hap.Characteristic.LockTargetState)
            .on('get', this.getLockState.bind(this))
            .on('set', this.setLockState.bind(this));
    }
    getLockState(callback) {
        this.lock.getStatus().then(() => {
            if (this.lock.isUnlocked) {
                HSLogger_1.Logger.log(this.lock.nickname, 'is unlocked');
                callback(null, HAP_1.Hap.Characteristic.LockCurrentState.UNSECURED);
            }
            else {
                HSLogger_1.Logger.log(this.lock.nickname, 'is locked');
                callback(null, HAP_1.Hap.Characteristic.LockCurrentState.SECURED);
            }
        })
            .catch((err) => {
            HSLogger_1.Logger.log(err);
            callback(err);
        });
    }
    setLockState(targetState, callback) {
        let lockMechanismService = this.getOrCreateLockMechanismService();
        HSLogger_1.Logger.log(`${targetState ? 'Locking' : 'Unlocking'} ${this.lock.nickname}`);
        this.lock.control(targetState).then(() => {
            if (targetState == HAP_1.Hap.Characteristic.LockCurrentState.SECURED) {
                lockMechanismService.setCharacteristic(HAP_1.Hap.Characteristic.LockCurrentState, HAP_1.Hap.Characteristic.LockCurrentState.SECURED);
            }
            else {
                lockMechanismService.setCharacteristic(HAP_1.Hap.Characteristic.LockCurrentState, HAP_1.Hap.Characteristic.LockCurrentState.UNSECURED);
            }
            callback(null);
        })
            .catch((err) => {
            HSLogger_1.Logger.log(err);
            callback(err);
        });
    }
    setupBatteryServiceCharacteristics() {
        let batteryService = this.getOrCreateBatteryService();
        batteryService
            .getCharacteristic(HAP_1.Hap.Characteristic.BatteryLevel)
            .on('get', this.getBatteryLevel.bind(this));
        batteryService
            .getCharacteristic(HAP_1.Hap.Characteristic.ChargingState)
            .on('get', this.getBatteryChargingState.bind(this));
        batteryService
            .getCharacteristic(HAP_1.Hap.Characteristic.StatusLowBattery)
            .on('get', this.getLowBatteryStatus.bind(this));
    }
    getBatteryLevel(callback) {
        callback(null, this.lock.battery);
    }
    getBatteryChargingState(callback) {
        callback(null, HAP_1.Hap.Characteristic.ChargingState.NOT_CHARGING);
    }
    getLowBatteryStatus(callback) {
        if (this.lock.battery <= 20) {
            callback(null, HAP_1.Hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
        }
        else {
            callback(null, HAP_1.Hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }
    }
}
exports.LockAccessory = LockAccessory;
//# sourceMappingURL=LockAccessory.js.map