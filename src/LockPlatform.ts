import * as store from 'store';

import { Client } from './Client';
import { HAP } from './HAP';
import { Accessory, Log, Platform } from './interfaces/HAP';
import { PlatformConfig } from './interfaces/PlatformConfig';
import { Logger } from './Logger';
import {LockAccessory} from "./LockAccessory";
import { Lock } from './interfaces/API';

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
        throw new Error('A token was not found in the homebridge config. For more information, see: https://github.com/aschzero/homebridge-sesame#configuration');
      }

      store.set('token', config.token);

      this.retrieveLocks();
    });
  }

  async retrieveLocks(): Promise<void> {
    let client = new Client();
    let locks: Lock[];

    try {
      locks = await client.listLocks();
    } catch(e) {
      Logger.error('Unable to retrieve locks', e);
    }

    locks.forEach(lock => this.addAccessory(lock));
  }

  configureAccessory(accessory: Accessory): void {
    this.accessories.set(accessory.UUID, accessory);
  }

  addAccessory(lock: Lock): Accessory {
    let uuid = HAP.UUID.generate(lock.device_id);
    let accessory = this.accessories.get(uuid);

    if (!accessory) {
      accessory = new HAP.Accessory(lock.nickname, uuid);
      this.accessories.set(accessory.UUID, accessory);

      this.platform.registerPlatformAccessories('homebridge-sesame', 'Sesame', [accessory]);
    }

    new LockAccessory(lock, accessory);

    Logger.log(`Found ${lock.nickname}`);

    return accessory;
  }
}
