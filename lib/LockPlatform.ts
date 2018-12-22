import * as store from 'store';

import { Client } from './Client';
import { HAP } from './HAP';
import { Accessory, Log, Platform } from './interfaces/HAP';
import { PlatformConfig } from './interfaces/PlatformConfig';
import { Lock } from './Lock';
import { LockAccessory } from './LockAccessory';
import { Logger } from './Logger';

export class LockPlatform {
  log: Log;
  platform: Platform;
  accessories: Map<string, Accessory>;

  constructor(log: Log, config: PlatformConfig, platform: Platform) {
    Logger.setLogger(log, config['debug']);

    this.platform = platform;
    this.accessories = new Map<string, Accessory>();

    this.platform.on('didFinishLaunching', () => {
      if (!config.token) {
        throw Error('A token was not found in the homebridge config. For more information, see: https://github.com/aschzero/homebridge-sesame#configuration');
      }

      store.set('token', config.token);

      this.retrieveLocks();
    });
  }

  async retrieveLocks(): Promise<void> {
    try {
      let client = new Client();
      let locks = await client.listLocks();

      locks.forEach(lock => this.addAccessory(lock));
    } catch(e) {
      Logger.error('Unable to retrieve locks', e);
    }
  }

  configureAccessory(accessory: Accessory): void {
    this.accessories.set(accessory.UUID, accessory);
  }

  addAccessory(lock: Lock): Accessory {
    let uuid = HAP.UUID.generate(lock.id);
    let accessory = this.accessories.get(uuid);

    this.removeStaleAccessory(lock);

    if (!accessory) {
      accessory = new HAP.Accessory(lock.name, uuid);
      this.accessories.set(accessory.UUID, accessory);

      this.platform.registerPlatformAccessories('homebridge-sesame', 'Sesame', [accessory]);
    }

    let lockAccessory = new LockAccessory();
    lockAccessory.register(accessory, lock);

    Logger.log(`Found ${lock.name}`);

    return accessory;
  }

  removeStaleAccessory(lock: Lock): void {
    let oldUuid = HAP.UUID.generate(lock.name);
    let oldAccessory = this.accessories.get(oldUuid);

    if (oldAccessory) {
      this.platform.unregisterPlatformAccessories('homebridge-sesame', 'Sesame', [oldAccessory]);
      Logger.debug(`Removed stale accessory ${lock.name}`);
    }
  }
}
