
import * as Request from 'request-promise';

import { Log } from './interfaces/Log';
import { AuthenticationResponse } from './interfaces/AuthenticationResponse';
import { LockProperties } from './interfaces/LockProperties'
import { APIConfig } from './APIConfig'

class Authenticator {
  log: Log;
  email: string;
  password: string;
  token: string;

  constructor(email: string, password: string, log: Log) {
    this.log = log;
    this.email = email;
    this.password = password;
  }

  authenticate(): Promise<AuthenticationResponse> {
    this.log('Authenticating with Sesame...');

    let options = {
      uri: `${APIConfig.baseUri}/accounts/login`,
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      json: true,
      body: {
        'email': this.email,
        'password': this.password
      }
    }

    this.log('Authenticating with Sesame');

    return new Promise((resolve, reject) => {
      Request(options).then((response) => {
        let authenticationResponse = response as AuthenticationResponse;
        
        if (!authenticationResponse.authorization) {
          throw Error('Unexpected response during authentication');
        }

        resolve(authenticationResponse);
      }).catch((err) => {
        this.log(`Encountered an error when trying to get user token: ${err}`);
        reject(err);
      });
    });
  }

  getLocks(): Promise<LockProperties[]> {
    this.log('Retrieving locks');

    let options = {
      uri: `${APIConfig.baseUri}/sesames`,
      method: 'GET',
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token
      }
    }
    
    return new Promise((resolve, reject) => {
      Request(options).then((response) => {
        resolve(response.sesames as LockProperties[]);
      }).catch((err) => {
        this.log(`Encountered an error when trying to get locks: ${err}`);
        reject(err);
      });
    });
  }
}

export { Authenticator }