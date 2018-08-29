import { Authenticator } from './APIAuthenticator';
import { Hap } from './HAP';
import { Logger } from './HSLogger';
import { LockAccessory } from './LockAccessory';
import { HAP, LockProperties } from './types';

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

        try {
          this.authenticate(email, password);
        } catch(e) {
          Logger.log(e);
        }
      });
    }
  }

  async authenticate(email: string, password: string): Promise<void> {
    Logger.log('Authenticating with Sesame...');

    try {
      await Authenticator.authenticate(email, password);
    } catch(e) {
      Logger.log(`Unable to authenticate: ${e}`);
      return;
    }

    Logger.log('Retrieving locks...');
    try {
      let locks = await Authenticator.getLocks();

      locks.forEach((lock) => {
        this.addAccessory(lock);
      });
    } catch(e) {
      Logger.log(`Unable to retrieve locks: ${e}`);
    }
  }

  configureAccessory(accessory: HAP.Accessory): void {
    accessory.updateReachability(false);

    this.registeredAccessories.set(accessory.UUID, accessory);
  }

  addAccessory(properties: LockProperties): void {
    let uuid: string = Hap.UUIDGen.generate(properties.nickname);
    let accessory: HAP.Accessory;

    if (this.registeredAccessories.get(uuid)) {
      accessory = this.registeredAccessories.get(uuid);
    } else {
      accessory = new Hap.Accessory(properties.nickname, uuid);
    }

    let lockAccessory = new LockAccessory(accessory, properties);

    accessory.on('identify', (paired, callback) => {
      callback();
    });

    this.accessories.push(accessory);
    if (!this.registeredAccessories.get(uuid)) {
      this.platform.registerPlatformAccessories('homebridge-sesame', 'Sesame', [accessory]);
    }
  }
}

