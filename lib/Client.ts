import * as request from 'request-promise';

import { Config } from './Config';
import { Lock } from './Lock';
import { Logger } from './Logger';
import { LockResponse, Payload } from './types';

export class Client {
  token: string;

  constructor(token: string) {
    this.token = token;
  }

  async listLocks(): Promise<Lock[]> {
    let payload = this.buildPayload('sesames');
    let response: LockResponse.Metadata[] = await request.get(payload);

    return response.map(r => Lock.buildFromMetadata(r));
  }

  async getStatus(id: string): Promise<LockResponse.Status> {
    let payload = this.buildPayload(`sesame/${id}`);

    let status = await request.get(payload);

    return status;
  }

  async control(id: string, secure: boolean): Promise<void> {
    let payload = this.buildPayload(`sesame/${id}`);
    payload.body = {command: (secure ? 'lock' : 'unlock')}

    let response: LockResponse.Control = await request.post(payload);

    await this.waitForControlTask(response.task_id);
  }

  private async getTaskStatus(taskId: string): Promise<LockResponse.Task> {
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
