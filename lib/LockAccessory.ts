import { HAP } from './HAP';
import { Accessory, Service } from './interfaces/HAP';
import { Lock } from './Lock';
import { Logger } from './Logger';

export class LockAccessory {
  lock: Lock;
  accessory: Accessory;

  constructor(lock: Lock) {
    this.lock = lock;
  }

  registerAccessory(accessory: Accessory) {
    this.accessory = accessory;

    this.accessory.getService(HAP.Service.AccessoryInformation)
      .setCharacteristic(HAP.Characteristic.Manufacturer, 'CANDY HOUSE')
      .setCharacteristic(HAP.Characteristic.Model, 'Sesame')
      .setCharacteristic(HAP.Characteristic.SerialNumber, this.lock.serial);

    this.setupLockMechanismServiceCharacteristics();
    this.setupBatteryServiceCharacteristics();
  }

  getOrCreateLockMechanismService(): Service {
    let lockMechanismService = this.accessory.getService(HAP.Service.LockMechanism);

    if (!lockMechanismService) {
      lockMechanismService = this.accessory.addService(HAP.Service.LockMechanism, this.lock.name);
    }

    return lockMechanismService;
  }

  getOrCreateBatteryService(): Service {
    let batteryService = this.accessory.getService(HAP.Service.BatteryService);

    if (!batteryService) {
      batteryService = this.accessory.addService(HAP.Service.BatteryService, this.lock.name);
    }

    return batteryService;
  }

  setupLockMechanismServiceCharacteristics(): void {
    let lockMechanismService = this.getOrCreateLockMechanismService();

    lockMechanismService
      .getCharacteristic(HAP.Characteristic.LockCurrentState)
      .on('get', this.getCurrentLockState.bind(this));

    lockMechanismService
      .getCharacteristic(HAP.Characteristic.LockTargetState)
      .on('get', this.getTargetLockState.bind(this))
      .on('set', this.setLockState.bind(this));
  }

  setupBatteryServiceCharacteristics(): void {
    let batteryService = this.getOrCreateBatteryService();

    batteryService
      .getCharacteristic(HAP.Characteristic.BatteryLevel)
      .on('get', this.getBatteryLevel.bind(this));

    batteryService
      .getCharacteristic(HAP.Characteristic.ChargingState)
      .on('get', this.getBatteryChargingState.bind(this));

    batteryService
      .getCharacteristic(HAP.Characteristic.StatusLowBattery)
      .on('get', this.getLowBatteryStatus.bind(this));
  }

  async getCurrentLockState(callback): Promise<void> {
    try {
      let status = await this.lock.getStatus();

      if (!status.responsive) {
        Logger.log(`${this.lock.name} is unresponsive, forcing a status sync...`);

        await this.lock.syncStatus();
        status = await this.lock.getStatus();

        if (!status.responsive) {
          throw new Error(`${this.lock.status} is still unresponsive. Check WiFi connectivity.`);
        }
      }

      if (status.locked) {
        callback(null, HAP.Characteristic.LockCurrentState.SECURED);
      } else {
        callback(null, HAP.Characteristic.LockCurrentState.UNSECURED);
      }
    } catch(e) {
      Logger.error('Unable to get lock state', e);
      callback(e);
    }
  }

  async getTargetLockState(callback): Promise<void> {
    try {
      let status = await this.lock.getStatus();

      if (status.locked) {
        callback(null, HAP.Characteristic.LockCurrentState.SECURED);
      } else {
        callback(null, HAP.Characteristic.LockCurrentState.UNSECURED);
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
      await this.lock.setLockedState(targetState);

      Logger.log(`${this.lock.name} is ${targetState ? 'locked' : 'unlocked'}`);

      lockMechanismService.getCharacteristic(HAP.Characteristic.LockCurrentState)
                          .updateValue(targetState);

      callback();
    } catch(e) {
      Logger.error('Unable to set lock state', e);
      callback(e);
    }
  }

  async getBatteryLevel(callback): Promise<void> {
    let status = await this.lock.getStatus();

    callback(null, status.battery);
  }

  async getLowBatteryStatus(callback): Promise<void> {
    let status = await this.lock.getStatus();

    if (status.battery <= 20) {
      callback(null, HAP.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
    } else {
      callback(null, HAP.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
    }
  }

  getBatteryChargingState(callback): void {
    callback(null, HAP.Characteristic.ChargingState.NOT_CHARGING);
  }
}

