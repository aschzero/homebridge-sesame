import * as request from 'request-promise';
import * as store from 'store';

import { Config } from './Config';
import { Control, Metadata, Payload, Status, Task } from './interfaces/API';
import { Lock } from './Lock';
import { Logger } from './Logger';

export class Client {
  token: string;

  constructor() {
    this.token = store.get('token');
  }

  async listLocks(): Promise<Lock[]> {
    let payload = this.buildPayload('sesames');
    let response: Metadata[] = await request.get(payload);

    return response.map(r => Lock.buildFromMetadata(r));
  }

  async getStatus(id: string): Promise<Status> {
    let payload = this.buildPayload(`sesame/${id}`);
    let status = await request.get(payload);

    return status;
  }

  async control(id: string, secure: boolean): Promise<void> {
    let payload = this.buildPayload(`sesame/${id}`);
    payload.body = {command: (secure ? 'lock' : 'unlock')}

    let response: Control = await request.post(payload);

    await this.waitForControlTask(response.task_id);
  }

  private async getTaskStatus(taskId: string): Promise<Task> {
    let payload = this.buildPayload('action-result');
    payload.qs = {task_id: taskId}

    let status = await request.get(payload);

    return status;
  }

  private async waitForControlTask(taskId: string): Promise<void> {
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

  private buildPayload(path: string): Payload {
    let payload: Payload = {
      uri: `${Config.API_URI}/${path}`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    }

    return payload;
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
