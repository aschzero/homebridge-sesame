import { HAP, LockProperties } from './types';

import { Hap } from './HAP';
import { Logger } from './HSLogger';
import { Lock } from './Lock';

export class LockAccessory {
  lock: Lock;
  lockProperties: LockProperties;
  accessory: HAP.Accessory;

  constructor(accessory: HAP.Accessory, lockProperties: LockProperties) {
    this.lockProperties = lockProperties;
    this.accessory = accessory;

    this.lock = new Lock(lockProperties);

    this.setupAccessoryInformationServiceCharacteristics();
    this.setupLockMechanismServiceCharacteristics();
    this.setupBatteryServiceCharacteristics();

    this.accessory.updateReachability(true);

    Logger.log(`Created accessory for ${this.lock.nickname}`);
  }

  getOrCreateLockMechanismService(): HAP.Service {
    let lockMechanismService = this.accessory.getService(Hap.Service.LockMechanism);

    if (!lockMechanismService) {
      lockMechanismService = this.accessory.addService(Hap.Service.LockMechanism, this.lock.nickname);
    }

    return lockMechanismService;
  }

  getOrCreateBatteryService(): HAP.Service {
    let batteryService = this.accessory.getService(Hap.Service.BatteryService);

    if (!batteryService) {
      batteryService = this.accessory.addService(Hap.Service.BatteryService, this.lock.nickname);
    }

    return batteryService;
  }

  setupAccessoryInformationServiceCharacteristics(): void {
    this.accessory.getService(Hap.Service.AccessoryInformation)
      .setCharacteristic(Hap.Characteristic.Manufacturer, 'CANDY HOUSE')
      .setCharacteristic(Hap.Characteristic.Model, 'Sesame')
      .setCharacteristic(Hap.Characteristic.SerialNumber, '123-456-789');
  }

  setupLockMechanismServiceCharacteristics(): void {
    let lockMechanismService = this.getOrCreateLockMechanismService();

    lockMechanismService
      .getCharacteristic(Hap.Characteristic.LockCurrentState)
      .on('get', this.getLockState.bind(this));

    lockMechanismService
      .getCharacteristic(Hap.Characteristic.LockTargetState)
      .on('get', this.getLockState.bind(this))
      .on('set', this.setLockState.bind(this));
  }

  getLockState(callback): void {
    this.lock.getStatus().then(() => {
      if (this.lock.isUnlocked) {
        Logger.log(this.lock.nickname, 'is unlocked');
        callback(null, Hap.Characteristic.LockCurrentState.UNSECURED);
      } else {
        Logger.log(this.lock.nickname, 'is locked');
        callback(null, Hap.Characteristic.LockCurrentState.SECURED);
      }
    })
    .catch((err) => {
      Logger.log(err);
      callback(err);
    });
  }

  setLockState(targetState, callback): void {
    let lockMechanismService = this.getOrCreateLockMechanismService();

    Logger.log(`${targetState ? 'Locking' : 'Unlocking'} ${this.lock.nickname}`);

    this.lock.control(targetState).then(() => {
      if (targetState == Hap.Characteristic.LockCurrentState.SECURED) {
        lockMechanismService.setCharacteristic(Hap.Characteristic.LockCurrentState, Hap.Characteristic.LockCurrentState.SECURED);
      } else {
        lockMechanismService.setCharacteristic(Hap.Characteristic.LockCurrentState, Hap.Characteristic.LockCurrentState.UNSECURED);
      }

      callback(null);
    })
    .catch((err) => {
      Logger.log(err);
      callback(err);
    });
  }

  setupBatteryServiceCharacteristics(): void {
    let batteryService = this.getOrCreateBatteryService();

    batteryService
      .getCharacteristic(Hap.Characteristic.BatteryLevel)
      .on('get', this.getBatteryLevel.bind(this));

    batteryService
      .getCharacteristic(Hap.Characteristic.ChargingState)
      .on('get', this.getBatteryChargingState.bind(this));

    batteryService
      .getCharacteristic(Hap.Characteristic.StatusLowBattery)
      .on('get', this.getLowBatteryStatus.bind(this));
  }

  getBatteryLevel(callback): void {
    callback(null, this.lock.battery);
  }

  getBatteryChargingState(callback): void {
    callback(null, Hap.Characteristic.ChargingState.NOT_CHARGING);
  }

  getLowBatteryStatus(callback): void {
    if (this.lock.battery <= 20) {
      callback(null, Hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
    } else {
      callback(null, Hap.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
    }
  }
}

