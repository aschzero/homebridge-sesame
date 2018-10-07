import * as retry from 'retry';

import { Config } from './Config';
import { Hap } from './HAP';
import { Logger } from './Logger';
import { Lock } from './Lock';
import { HAP, LockResponse } from './types';

export class LockAccessory {
  lock: Lock;
  LockResponse: LockResponse;
  accessory: HAP.Accessory;

  constructor(accessory: HAP.Accessory, LockResponse: LockResponse) {
    this.LockResponse = LockResponse;
    this.accessory = accessory;

    this.lock = new Lock(LockResponse);

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
    this.lock.getState().then((isSecure) => {
      Logger.debug(`Current lock state: ${isSecure ? 'locked' : 'unlocked'}`);

      if (isSecure) {
        callback(null, Hap.Characteristic.LockCurrentState.SECURED);
      } else {
        callback(null, Hap.Characteristic.LockCurrentState.UNSECURED);
      }
    })
    .catch((err) => {
      Logger.log(err);
      callback(err);
    });
  }

  setLockState(targetState, callback): void {
    let lockMechanismService = this.getOrCreateLockMechanismService();
    let shouldSecure = (targetState == Hap.Characteristic.LockCurrentState.SECURED);

    Logger.log(`${targetState ? 'Locking' : 'Unlocking'} ${this.lock.nickname}...`);

    this.lock.control(targetState).then(() => {
      this.waitForNewState(shouldSecure).then((newState) => {
        lockMechanismService.setCharacteristic(Hap.Characteristic.LockCurrentState, newState);
        callback(null);
      })
      .catch((err) => {
        Logger.log(err);
        callback(err);
      });
    })
    .catch((err) => {
      Logger.log(err);
      callback(err);
    });
  }

  waitForNewState(shouldSecure: boolean): Promise<boolean> {
    let operation = retry.operation({
      retries: Config.RETRIES,
      minTimeout: Config.TIMEOUT,
      maxTimeout: Config.TIMEOUT
    });

    return new Promise((resolve, reject) => {
      operation.attempt((attempt) => {
        this.lock.getState().then((isSecure) => {
          Logger.debug(`Secure: ${isSecure}, retry attempt: ${attempt}`);

          if (shouldSecure && isSecure) {
            Logger.log(this.lock.nickname, 'is locked');

            operation.stop();
            return resolve(Hap.Characteristic.LockCurrentState.SECURED);
          }

          if (!shouldSecure && !isSecure) {
            Logger.log(this.lock.nickname, 'is unlocked');

            operation.stop();
            return resolve(Hap.Characteristic.LockCurrentState.UNSECURED);
          }

          if (attempt == Config.RETRIES) {
            operation.stop();
            return reject(new Error('Unable to retrieve new lock state from the Sesame API'));
          }

          operation.retry(new Error());
        });
      });
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

