import * as request from 'request-promise';

import { Config } from './Config';
import { Lock } from './types';

export class Client {
  token: string;

  constructor(token: string) {
    this.token = token;
  }

  async listLocks(): Promise<Lock[]> {
    let locks = await request.get({
      uri: `${Config.API_URI}/sesames`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    });

    return locks;
  }

  async getLock(id: string): Promise<Lock> {
    let lock = await request.get({
      uri: `${Config.API_URI}/sesame/${id}`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    });

    return lock;
  }

  // async getState(): Promise<boolean> {
  //   let token = store.get('token');
  //   let payload = {
  //     uri: `${Config.API_URI}/sesames/${this.deviceId}`,
  //     method: 'GET',
  //     json: true,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-Authorization': token
  //     }
  //   }

  //   let response = await request(payload);
  //   Logger.debug('Got response:', response);

  //   let properties: LockResponse = response;
  //   this.setProperties(properties);

  //   return !properties.is_unlocked;
  // }

  // async control(secure: boolean): Promise<void> {
  //   let token = store.get('token');
  //   let payload = {
  //     uri: `${Config.API_URI}/sesames/${this.deviceId}/control`,
  //     method: 'POST',
  //     json: true,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'X-Authorization': token
  //     },
  //     body: {
  //       'type': (secure ? 'lock' : 'unlock')
  //     }
  //   }

  //   let response = await request(payload);
  //   Logger.debug('Got response:', response);
  // }
}
