import * as request from 'request-promise';

import { Config } from './Config';
import { Lock } from './Lock';
import { Logger } from './Logger';
import { LockResponse } from './types';

export class Client {
  token: string;

  constructor(token: string) {
    this.token = token;
  }

  async listLocks(): Promise<Lock[]> {
    let payload = {
      uri: `${Config.API_URI}/sesames`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    }

    let response: LockResponse.Metadata[] = await request.get(payload);

    return response.map(r => Lock.buildFromResponse(r));
  }

  async getStatus(id: string): Promise<LockResponse.Status> {
    let payload = {
      uri: `${Config.API_URI}/sesame/${id}`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    }

    let status = await request.get(payload);

    return status;
  }

  async control(id: string, secure: boolean): Promise<void> {
    let payload = {
      uri: `${Config.API_URI}/sesame/${id}`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      },
      body: {
        'command': (secure ? 'lock' : 'unlock')
      }
    }

    let response: LockResponse.Control = await request.post(payload);

    await this.waitForControlTask(response.task_id);
  }

  async getTaskStatus(taskId: string): Promise<LockResponse.Task> {
    let payload = {
      uri: `${Config.API_URI}/action-result`,
      json: true,
      qs: {
        task_id: taskId
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    }

    let status = await request.get(payload);

    return status;
  }

  async waitForControlTask(taskId: string): Promise<void> {
    let retries = Config.MAX_RETRIES;

    while (retries-- > 0) {
      Logger.debug(`Waiting for control task to complete. Attempts remaining: ${retries}/${Config.MAX_RETRIES}`);

      await this.delay(Config.DELAY);

      if (retries == 0) {
        throw Error('Control task took too long to complete.');
      }

      let status = await this.getTaskStatus(taskId);
      Logger.debug('Task response', status);

      if (status.successful) break;
    }

    return;
  }

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
