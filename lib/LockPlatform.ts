import { Client } from './Client';
import { Lock } from './Lock';
import { LockAccessory } from './LockAccessory';
import { Hap } from './HAP';
import { Logger } from './Logger';
import { HAP } from './types';

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

    if (!this.platform) return;

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
        new LockAccessory(accessory, lock, token);
      });
    } catch(e) {
      Logger.error('Unable to retrieve locks', e.message);
    }
  }

  addAccessory(lock: Lock, token: string): HAP.Accessory {
    let uuid: string = Hap.UUIDGen.generate(lock.name);
    let accessory: HAP.Accessory;

    if (this.registeredAccessories.get(uuid)) {
      accessory = this.registeredAccessories.get(uuid);
    } else {
      accessory = new Hap.Accessory(lock.name, uuid, token);

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
