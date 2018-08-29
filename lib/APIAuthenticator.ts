import * as request from 'request-promise';

import { Config } from './Config';
import { AuthenticationResponse, LockProperties } from './types';


class APIAuthenticator {
  email: string;
  password: string;
  token: string;

  async authenticate(email: string, password: string): Promise<void> {
    this.email = email;
    this.password = password;

    let payload = {
      uri: `${Config.API_URI}/accounts/login`,
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

    let response = await request(payload);
    let authResponse: AuthenticationResponse = response;

    this.token = authResponse.authorization;
  }

  async getLocks(): Promise<LockProperties[]> {
    let payload = {
      uri: `${Config.API_URI}/sesames`,
      method: 'GET',
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': this.token
      }
    }

    let response = await request(payload);
    let locks: LockProperties[] = response.sesames;

    return locks;
  }
}

export const Authenticator = new APIAuthenticator();