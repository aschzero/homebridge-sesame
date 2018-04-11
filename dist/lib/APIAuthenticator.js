"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Request = require("request-promise");
const HSLogger_1 = require("./HSLogger");
const APIConfig_1 = require("./APIConfig");
class APIAuthenticator {
    authenticate(email, password) {
        this.email = email;
        this.password = password;
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
        HSLogger_1.Logger.log('Authenticating with Sesame');
        return new Promise((resolve, reject) => {
            Request(options).then((response) => {
                let authenticationResponse = response;
                if (!authenticationResponse.authorization) {
                    throw Error('Unexpected response during authentication');
                }
                this.token = authenticationResponse.authorization;
                resolve(authenticationResponse);
            }).catch((err) => {
                HSLogger_1.Logger.log(`Encountered an error when trying to get user token: ${err}`);
                reject(err);
            });
        });
    }
    getLocks() {
        HSLogger_1.Logger.log('Retrieving locks');
        let options = {
            uri: `${APIConfig_1.APIConfig.baseUri}/sesames`,
            method: 'GET',
            json: true,
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': this.token
            }
        };
        return new Promise((resolve, reject) => {
            Request(options).then((response) => {
                resolve(response.sesames);
            }).catch((err) => {
                HSLogger_1.Logger.log(`Encountered an error when trying to get locks: ${err}`);
                reject(err);
            });
        });
    }
}
exports.Authenticator = new APIAuthenticator();
//# sourceMappingURL=APIAuthenticator.js.map