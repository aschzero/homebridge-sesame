import { Authenticator } from './APIAuthenticator';
import { Hap } from './HAP';
import { Logger } from './HSLogger';
import { LockAccessory } from './LockAccessory';
import { Accessory, AccessoryConfig, LockProperties, Log, Platform } from './types';

class LockPlatform {
  platform: Platform;
  accessories: Array<Accessory>;
  registeredAccessories: Map<string, Accessory>;

  constructor(log: Log, config: AccessoryConfig, platform: Platform) {
    Logger.setLogger(log);

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

        Authenticator.authenticate(email, password).then(() => {
          return Authenticator.getLocks();
        }).then((locks) => {
          locks.forEach((lock => this.addAccessory(lock)));
        })
        .catch((err) => {
          Logger.log(`Encountered an error when trying to retrieve locks: ${err}`);
        });
      });
    }
  }

  configureAccessory(accessory: Accessory): void {
    accessory.updateReachability(false);

    this.registeredAccessories.set(accessory.UUID, accessory);
  }

  addAccessory(properties: LockProperties): void {
    let uuid: string = Hap.UUIDGen.generate(properties.nickname);
    let accessory: Accessory;

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

export { LockPlatform }
