import { HAP } from "./HAP";
import { LockStatus, Lock } from "./interfaces/API";
import { Accessory, Service } from "./interfaces/HAP";
import { Logger } from "./Logger";
import { Client } from "./Client";
import { Mutex } from "./util/Mutex";

export class LockAccessory {
  lock: Lock;
  accessory: Accessory;

  client: Client;
  mutex: Mutex<LockStatus>;

  constructor(lock: Lock, accessory: Accessory) {
    this.lock = lock;
    this.accessory = accessory;

    this.client = new Client();
    this.mutex = new Mutex<LockStatus>();

    this.accessory.getService(HAP.Service.AccessoryInformation)
      .setCharacteristic(HAP.Characteristic.Manufacturer, 'CANDY HOUSE')
      .setCharacteristic(HAP.Characteristic.Model, 'Sesame')
      .setCharacteristic(HAP.Characteristic.SerialNumber, this.lock.serial);

    this.setupLockServiceCharacteristics();
    this.setupBatteryServiceCharacteristics();
  }

  getOrCreateHAPService(service: Service): Service {
    let hapService = this.accessory.getService(service);

    if (!hapService) {
      hapService = this.accessory.addService(service, this.lock.nickname);
    }

    return hapService;
  }

  setupLockServiceCharacteristics(): void {
    let lockService = this.getOrCreateHAPService(HAP.Service.LockMechanism);

    lockService.getCharacteristic(HAP.Characteristic.LockCurrentState)
      .on('get', this.getCurrentLockState.bind(this));

    lockService.getCharacteristic(HAP.Characteristic.LockTargetState)
      .on('get', this.getTargetLockState.bind(this))
      .on('set', this.setLockState.bind(this));
  }

  setupBatteryServiceCharacteristics(): void {
    let batteryService = this.getOrCreateHAPService(HAP.Service.BatteryService);

    batteryService.getCharacteristic(HAP.Characteristic.BatteryLevel)
      .on('get', this.getBatteryLevel.bind(this));

    batteryService.getCharacteristic(HAP.Characteristic.ChargingState)
      .on('get', this.getBatteryChargingState.bind(this));

    batteryService.getCharacteristic(HAP.Characteristic.StatusLowBattery)
      .on('get', this.getLowBatteryStatus.bind(this));
  }

  async getCurrentLockState(callback: Function): Promise<void> {
    let status: LockStatus;

    try {
      status = await this.mutex.wait(() => this.client.getStatus(this.lock.device_id));
    } catch(e) {
      Logger.error('Unable to get lock state', e);
      callback(e);
    }

    if (!status.responsive) {
      Logger.log(`${this.lock.nickname} is unresponsive, forcing a status sync...`);

      try {
        let result = await this.client.sync(this.lock.device_id);

        if (result.successful) {
          Logger.log(`${this.lock.nickname} sync successful.`)
        } else {
          Logger.error(`${this.lock.nickname} failed to sync, please check WiFi connectivity. API responded with: ${result.error}`);
        }
      } catch(e) {
        Logger.error(`Unable to sync`, e);
      }
    }

    if (status.locked) {
      callback(null, HAP.Characteristic.LockCurrentState.SECURED);
    } else {
      callback(null, HAP.Characteristic.LockCurrentState.UNSECURED);
    }
  }

  async getTargetLockState(callback: Function): Promise<void> {
    try {
      let status = await this.mutex.wait(() => this.client.getStatus(this.lock.device_id));

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

  async setLockState(targetState: boolean, callback: Function): Promise<void> {
    Logger.log(`${this.lock.nickname} is ${targetState ? 'locking' : 'unlocking'}...`);

    try {
      await this.client.control(this.lock.device_id, targetState);
    } catch(e) {
      Logger.error('Unable to set lock state', e);
      callback(e);
    }

    Logger.log(`${this.lock.nickname} is ${targetState ? 'locked' : 'unlocked'}`);

    let lockService = this.getOrCreateHAPService(HAP.Service.LockMechanism);

    lockService.getCharacteristic(HAP.Characteristic.LockCurrentState)
                .updateValue(targetState);

    callback();
  }

  async getBatteryLevel(callback: Function): Promise<void> {
    try {
      let status = await this.mutex.wait(() => this.client.getStatus(this.lock.device_id));

      callback(null, status.battery);
    } catch(e) {
      callback(e);
    }
  }

  async getLowBatteryStatus(callback: Function): Promise<void> {
    try {
      let status = await this.mutex.wait(() => this.client.getStatus(this.lock.device_id));

      if (status.battery <= 20) {
        callback(null, HAP.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
      } else {
        callback(null, HAP.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
      }
    } catch(e) {
      callback(e);
    }
  }

  getBatteryChargingState(callback: Function): void {
    callback(null, HAP.Characteristic.ChargingState.NOT_CHARGING);
  }
}