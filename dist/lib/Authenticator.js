"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Request = require("request-promise");
const APIConfig_1 = require("./APIConfig");
class Authenticator {
    constructor(email, password, log) {
        this.log = log;
        this.email = email;
        this.password = password;
    }
    authenticate() {
        Logger.log('Authenticating with Sesame...');
        let options = {
            uri: `${APIConfig_1.APIConfig.baseUri}/accounts/login`,
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            json: true,
            body: {
                'email': this.email,
                'password': this.password
            }
        };
        return new Promise((resolve, reject) => {
            Request(options).then((response) => {
                let authenticationResponse = response;
                if (!authenticationResponse.authorization) {
                    throw Error('Unexpected response during authentication');
                }
                resolve(authenticationResponse);
            }).catch((err) => {
                Logger.log(`Encountered an error when trying to get user token: ${err}`);
                reject(err);
            });
        });
    }
    getLocks(token) {
        Logger.log('Retrieving locks...');
        let options = {
            uri: `${APIConfig_1.APIConfig.baseUri}/sesames`,
            method: 'GET',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': token
            }
        };
        return new Promise((resolve, reject) => {
            Request(options).then((response) => {
                resolve(response.sesames);
            }).catch((err) => {
                Logger.log(`Encountered an error when trying to get locks: ${err}`);
                reject(err);
            });
        });
    }
}
exports.Authenticator = Authenticator;
//# sourceMappingURL=Authenticator.js.map