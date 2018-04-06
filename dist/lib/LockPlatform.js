"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const APIAuthenticator_1 = require("./APIAuthenticator");
const LockAccessory_1 = require("./LockAccessory");
const HAP_1 = require("./HAP");
class LockPlatform {
    constructor(log, config, platform) {
        this.name = config['name'];
        this.log = log;
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
                APIAuthenticator_1.Authenticator.authenticate(email, password, this.log).then(() => {
                    return APIAuthenticator_1.Authenticator.getLocks();
                }).then((locks) => {
                    locks.forEach((lock => this.addAccessory(lock)));
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
        let lockAccessory = new LockAccessory_1.LockAccessory(accessory, properties, this.log);
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