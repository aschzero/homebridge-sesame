import { LockPlatform } from './src/LockPlatform';
import { HAP } from './src/HAP';

export = (homebridge) => {
  HAP.Accessory = homebridge.platformAccessory;
  HAP.Service = homebridge.hap.Service;
  HAP.Characteristic = homebridge.hap.Characteristic;
  HAP.UUID = homebridge.hap.uuid;

  homebridge.registerPlatform('homebridge-sesame', 'Sesame', LockPlatform, true);
}