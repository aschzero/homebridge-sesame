import * as Request from 'request-promise';

import { Authenticator } from './APIAuthenticator';
import { APIConfig } from './APIConfig';
import { LockProperties } from './types';

class Lock {
  deviceId: string;
  nickname: string;
  isUnlocked: boolean;
  apiEnabled: boolean;
  battery: number;

  constructor(properties: LockProperties) {
    this.setProperties(properties);
  }

  setProperties(properties: LockProperties): void {
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

  getStatus(): Promise<void> {
    let options = {
      uri: `${APIConfig.baseUri}/sesames/${this.deviceId}`,
      method: 'GET',
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': Authenticator.token
      }
    }

    return new Promise((resolve, reject) => {
      Request(options).then((response) => {
        this.setProperties(response as LockProperties);
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  control(secure: boolean): Promise<void> {
    let options = {
      uri: `${APIConfig.baseUri}/sesames/${this.deviceId}/control`,
      method: 'POST',
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': Authenticator.token
      },
      body: {
        'type': (secure ? 'lock' : 'unlock')
      }
    }

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

export { Lock }