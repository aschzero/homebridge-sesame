import { Authenticator } from './Authenticator';
import { Hap } from './HAP';
import { LockAccessory } from './LockAccessory';
import { Logger } from './Logger';
import { HAP, LockResponse } from './types';

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

    if (this.platform) {
      this.platform.on('didFinishLaunching', () => {
        let email = config['email'];
        let password = config['password'];

        if (!email || !password) {
          throw Error('email and password fields are required in config');
        }

      let authenticator = new Authenticator();

        authenticator.authenticate(email, password).then(() => {
          authenticator.getLocks().then((locks) => {
            locks.forEach(lock => this.addAccessory(lock));
          });
        }).catch((e) => {
          Logger.log(`Unable to retrieve locks: ${e.message}`);
        });
      });
    }
  }

  configureAccessory(accessory: HAP.Accessory): void {
    accessory.updateReachability(false);

    this.registeredAccessories.set(accessory.UUID, accessory);
  }

  addAccessory(properties: LockResponse): void {
    let uuid: string = Hap.UUIDGen.generate(properties.nickname);
    let accessory: HAP.Accessory;

    if (this.registeredAccessories.get(uuid)) {
      accessory = this.registeredAccessories.get(uuid);
    } else {
      accessory = new Hap.Accessory(properties.nickname, uuid);
    }

    new LockAccessory(accessory, properties);

    accessory.on('identify', (paired, callback) => {
      callback();
    });

    this.accessories.push(accessory);
    if (!this.registeredAccessories.get(uuid)) {
      this.platform.registerPlatformAccessories('homebridge-sesame', 'Sesame', [accessory]);
    }
  }
}

