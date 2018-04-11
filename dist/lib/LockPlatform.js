"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HSLogger_1 = require("./HSLogger");
const APIAuthenticator_1 = require("./APIAuthenticator");
const LockAccessory_1 = require("./LockAccessory");
const HAP_1 = require("./HAP");
class LockPlatform {
    constructor(log, config, platform) {
        HSLogger_1.Logger.setLogger(log);
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
                APIAuthenticator_1.Authenticator.authenticate(email, password).then(() => {
                    return APIAuthenticator_1.Authenticator.getLocks();
                }).then((locks) => {
                    locks.forEach((lock => this.addAccessory(lock)));
                })
                    .catch((err) => {
                    HSLogger_1.Logger.log(`Encountered an error when trying to retrieve locks: ${err}`);
                });
            });
        }
    }
    configureAccessory(accessory) {
        accessory.updateReachability(false);
        this.registeredAccessories.set(accessory.UUID, accessory);
    }
    addAccessory(properties) {
        let uuid = HAP_1.Hap.UUIDGen.generate(properties.nickname);
        let accessory;
        if (this.registeredAccessories.get(uuid)) {
            accessory = this.registeredAccessories.get(uuid);
        }
        else {
            accessory = new HAP_1.Hap.Accessory(properties.nickname, uuid);
        }
        let lockAccessory = new LockAccessory_1.LockAccessory(accessory, properties);
        accessory.on('identify', (paired, callback) => {
            callback();
        });
        this.accessories.push(accessory);
        if (!this.registeredAccessories.get(uuid)) {
            this.platform.registerPlatformAccessories('homebridge-sesame', 'Sesame', [accessory]);
        }
    }
}
exports.LockPlatform = LockPlatform;
//# sourceMappingURL=LockPlatform.js.map