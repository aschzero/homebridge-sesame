import * as request from 'request-promise';
import * as store from 'store';

import { Authenticator } from './Authenticator';
import { Config } from './Config';
import { LockResponse } from './types';
import { Logger } from './Logger';

export class Lock {
  deviceId: string;
  nickname: string;
  apiEnabled: boolean;
  battery: number;

  constructor(properties: LockResponse) {
    this.setProperties(properties);
  }

  setProperties(properties: LockResponse): void {
    // Device ID is not included in the response when getting
    // lock state (only returned when retrieving all locks)
    if (properties.device_id) {
      this.deviceId = properties.device_id;
    }

    this.nickname = properties.nickname;
    this.apiEnabled = properties.api_enabled;
    this.battery = properties.battery;
  }

  async getState(): Promise<boolean> {
    let token = store.get('token');
    let payload = {
      uri: `${Config.API_URI}/sesames/${this.deviceId}`,
      method: 'GET',
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token
      }
    }

    let response = await request(payload);
    Logger.debug('Got response:', response);

    let properties: LockResponse = response;
    this.setProperties(properties);

    return !properties.is_unlocked;
  }

  async control(secure: boolean): Promise<void> {
    let token = store.get('token');
    let payload = {
      uri: `${Config.API_URI}/sesames/${this.deviceId}/control`,
      method: 'POST',
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token
      },
      body: {
        'type': (secure ? 'lock' : 'unlock')
      }
    }

    let response = await request(payload);
    Logger.debug('Got response:', response);
  }
}
