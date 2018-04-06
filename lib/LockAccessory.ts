import { Lock } from './Lock';
import { Accessory } from './interfaces/Accessory';
import { Service } from './interfaces/Service';
import { Log } from './interfaces/Log';
import { LockProperties } from './interfaces/LockProperties';
import { Hap } from './HAP'

class LockAccessory {
  log: Log;
  lock: Lock;
  lockProperties: LockProperties;
  accessory: Accessory;

  constructor(accessory: Accessory, lockProperties: LockProperties, log: Log, token: string) {
    this.log = log;
    this.lockProperties = lockProperties;
    this.accessory = accessory;

    this.lock = new Lock(token, lockProperties, log);

    this.setupAccessoryInformationServiceCharacteristics();
    this.setupLockMechanismServiceCharacteristics();

    this.accessory.updateReachability(true);

    this.log(`Created accessory for lock "${this.lock.nickname}"`);
  }

  getOrCreateLockMechanismService(): Service {
    let lockMechanismService = this.accessory.getService(Hap.Service.LockMechanism);

    if (!lockMechanismService) {
      lockMechanismService = this.accessory.addService(Hap.Service.LockMechanism, this.lock.nickname);
    }
    
    return lockMechanismService;
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
      .on('get', this.getLockTargetState.bind(this))
      .on('set', this.setLockState.bind(this));
  }

  getLockState(callback): void {
    this.lock.getStatus().then((options) => {
      if (this.lock.isUnlocked) {
        this.log(`${this.lock.nickname} is unlocked`);
        callback(null, Hap.Characteristic.LockCurrentState.UNSECURED);
      } else {
        this.log(`${this.lock.nickname} is locked`);
        callback(null, Hap.Characteristic.LockCurrentState.SECURED);
      }
    }).catch((err) => {
      this.log(err);
    });
  }

  getLockTargetState(callback): void {
    // The target state is always immediately retrieved after getting
    // the current lock state, so we're able to just read the isUnlocked
    // property without making redundant requests to the API
    if (this.lock.isUnlocked) {
      callback(null, Hap.Characteristic.LockCurrentState.UNSECURED);
    } else {
      callback(null, Hap.Characteristic.LockCurrentState.SECURED);
    }
  }

  setLockState(targetState, callback): void {
    let lockMechanismService = this.getOrCreateLockMechanismService();

    this.log(`${targetState ? 'Locking' : 'Unlocking'} ${this.lock.nickname}...`);

    this.lock.control(targetState).then(() => {
      if (targetState == Hap.Characteristic.LockCurrentState.SECURED) {
        lockMechanismService.setCharacteristic(Hap.Characteristic.LockCurrentState, Hap.Characteristic.LockCurrentState.SECURED);
      } else {
        lockMechanismService.setCharacteristic(Hap.Characteristic.LockCurrentState, Hap.Characteristic.LockCurrentState.UNSECURED);
      }
      
      callback(null);
    });
  }
}

export { LockAccessory }
