import { Client } from './Client';
import { Hap } from './HAP';
import { LockAccessory } from './LockAccessory';
import { Logger } from './Logger';
import { HAP, Lock } from './types';

export class LockPlatform {
  platform: HAP.Platform;
  accessories: Array<HAP.Accessory>;
  registeredAccessories: Map<string, HAP.Accessory>;
  log: HAP.Log;

  constructor(log: HAP.Log, config: HAP.AccessoryConfig, platform: HAP.Platform) {
    Logger.setLogger(log, config['debug']);

    this.platform = platform;
    this.accessories = [];
    this.registeredAccessories = new Map();

    if (!this.platform) return

    this.platform.on('didFinishLaunching', () => {
      let token = config['token'];

      if (!token) {
        throw Error('A token was not found in the homebridge config. For more information, see: https://github.com/aschzero/homebridge-sesame#configuration');
      }

      this.retrieveLocks(token);
    });
  }

  async retrieveLocks(token: string): Promise<void> {
    let client = new Client(token);

    try {
      let locks = await client.listLocks();

      locks.forEach(lock => {
        let accessory = this.addAccessory(lock, token);
        new LockAccessory(accessory, token);
      });
    } catch(e) {
      Logger.error('Unable to retrieve locks', e.message);
    }
  }

  addAccessory(lock: Lock, token: string): HAP.Accessory {
    let uuid: string = Hap.UUIDGen.generate(lock.nickname);
    let accessory: HAP.Accessory;

    if (this.registeredAccessories.get(uuid)) {
      accessory = this.registeredAccessories.get(uuid);
    } else {
      accessory = new Hap.Accessory(lock.nickname, uuid, token);

      accessory.getService(Hap.Service.AccessoryInformation)
        .setCharacteristic(Hap.Characteristic.Manufacturer, 'CANDY HOUSE')
        .setCharacteristic(Hap.Characteristic.Model, 'Sesame')
        .setCharacteristic(Hap.Characteristic.SerialNumber, lock.serial);

      this.platform.registerPlatformAccessories('homebridge-sesame', 'Sesame', [accessory]);
    }

    this.accessories.push(accessory);

    return accessory;
  }

  configureAccessory(accessory: HAP.Accessory): void {
    accessory.reachability = false;
    this.registeredAccessories.set(accessory.UUID, accessory);
  }
}
