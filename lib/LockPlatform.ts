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

  configureAccessory(accessory: Accessory): void {
    this.accessories.set(accessory.UUID, accessory);
  }

  addAccessory(lock: Lock, token: string): HAP.Accessory {
    let uuid: string = HAP.UUID.generate(lock.name);
    let accessory = this.accessories.get(uuid);

    if (!accessory) {
      accessory = new HAP.Accessory(lock.name, uuid);
      this.accessories.set(accessory.UUID, accessory);

      this.platform.registerPlatformAccessories('homebridge-sesame', 'Sesame', [accessory]);
    }

    let lockAccessory = new LockAccessory();
    lockAccessory.register(accessory, lock);

    return accessory;
  }
}
