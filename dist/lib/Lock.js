"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Request = require("request-promise");
const APIConfig_1 = require("./APIConfig");
const APIAuthenticator_1 = require("./APIAuthenticator");
class Lock {
    constructor(properties) {
        this.setProperties(properties);
    }
    setProperties(properties) {
        // Device ID is not included in the response when getting
        // lock state (only returned when retrieving all locks)
        if (properties.device_id) {
            this.deviceId = properties.device_id;
        }
        this.nickname = properties.nickname;
        this.isUnlocked = properties.is_unlocked;
        this.apiEnabled = properties.api_enabled;
        this.battery = properties.battery;
    }
    getStatus() {
        let options = {
            uri: `${APIConfig_1.APIConfig.baseUri}/sesames/${this.deviceId}`,
            method: 'GET',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': APIAuthenticator_1.Authenticator.token
            }
        };
        return new Promise((resolve, reject) => {
            Request(options).then((response) => {
                this.setProperties(response);
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }
    control(secure) {
        let options = {
            uri: `${APIConfig_1.APIConfig.baseUri}/sesames/${this.deviceId}/control`,
            method: 'POST',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': APIAuthenticator_1.Authenticator.token
            },
            body: {
                'type': (secure ? 'lock' : 'unlock')
            }
        };
        return new Promise((resolve, reject) => {
            Request(options).then(() => {
                this.isUnlocked = !secure;
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }
}
exports.Lock = Lock;
//# sourceMappingURL=Lock.js.map