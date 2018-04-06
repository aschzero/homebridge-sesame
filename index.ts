import { LockPlatform } from './lib/LockPlatform';
import { Hap } from './lib/HAP';

export = (homebridge) => {
  Hap.Accessory = homebridge.platformAccessory;
  Hap.Service = homebridge.hap.Service;
  Hap.Characteristic = homebridge.hap.Characteristic;
  Hap.UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform('homebridge-sesame', 'Sesame', LockPlatform, true);
}