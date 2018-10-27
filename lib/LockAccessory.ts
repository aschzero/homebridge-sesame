import { Client } from './Client';
import { Lock } from './Lock';
import { Hap } from './HAP';
import { Logger } from './Logger';
import { HAP } from './types';

export class LockAccessory {
  lock: Lock;
  accessory: HAP.Accessory;
  client: Client;

  constructor(accessory, lock: Lock, token: string) {
    this.lock = lock;
    this.accessory = accessory;
    this.client = new Client(token);

    this.setupInformationServiceCharacteristics();
    this.setupLockMechanismServiceCharacteristics();
    this.setupBatteryServiceCharacteristics();

    this.accessory.updateReachability(true);

    Logger.log(`Created accessory for ${this.lock.name}`);
  }

  getOrCreateLockMechanismService(): HAP.Service {
    let lockMechanismService = this.accessory.getService(Hap.Service.LockMechanism);

    if (!lockMechanismService) {
      lockMechanismService = this.accessory.addService(Hap.Service.LockMechanism, this.lock.name);
    }

    return lockMechanismService;
  }

  getOrCreateBatteryService(): HAP.Service {
    let batteryService = this.accessory.getService(Hap.Service.BatteryService);

    if (!batteryService) {
      batteryService = this.accessory.addService(Hap.Service.BatteryService, this.lock.name);
    }

    return batteryService;
  }

  setupInformationServiceCharacteristics(): void {
    this.accessory.getService(Hap.Service.AccessoryInformation)
      .setCharacteristic(Hap.Characteristic.Manufacturer, 'CANDY HOUSE')
      .setCharacteristic(Hap.Characteristic.Model, 'Sesame')
      .setCharacteristic(Hap.Characteristic.SerialNumber, this.lock.serial);
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

  async getLockState(callback): Promise<void> {
    try {
      let status = await this.client.getStatus(this.lock.id);

      this.lock.setStatus(status);

      if (status.locked) {
        callback(null, Hap.Characteristic.LockCurrentState.SECURED);
      } else {
        callback(null, Hap.Characteristic.LockCurrentState.UNSECURED);
      }
    } catch(e) {
      Logger.error('Unable to get lock state', e);
      callback(e);
    }
  }

  async setLockState(targetState, callback): Promise<void> {
    let lockMechanismService = this.getOrCreateLockMechanismService();

    Logger.log(`${this.lock.name} is ${targetState ? 'locking' : 'unlocking'}...`);

    try {
      await this.client.control(this.lock.id, targetState);

      Logger.log(`${this.lock.name} is ${targetState ? 'locked' : 'unlocked'}`);

      lockMechanismService.getCharacteristic(Hap.Characteristic.LockCurrentState)
                          .updateValue(targetState);

      callback(null);
    } catch(e) {
      Logger.error('Unable to set lock state', e);
      callback(e);
    }
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

