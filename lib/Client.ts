import * as request from 'request-promise';
import * as store from 'store';
import { Config } from './Config';
import { LockMetadata, LockStatus, Payload, TaskResult } from './interfaces/API';
import { Lock } from './Lock';
import { Logger } from './Logger';


export class Client {
  token: string;

  constructor() {
    this.token = store.get('token');
  }

  async listLocks(): Promise<Lock[]> {
    let payload = this.buildPayload('sesames');
    let response: LockMetadata[] = await request.get(payload);

    Logger.debug('Got listLocks response', response);

    return response.map(r => new Lock(r));
  }

  async getStatus(id: string): Promise<LockStatus> {
    let payload = this.buildPayload(`sesame/${id}`);
    let status = await request.get(payload);

    Logger.debug('Got status response', status);

    return status;
  }

  async control(id: string, secure: boolean): Promise<TaskResult> {
    let payload = this.buildPayload(`sesame/${id}`);
    payload.body = {command: (secure ? 'lock' : 'unlock')}

    let response = await request.post(payload);
    let result = await this.waitForTask(response.task_id);

    return result;
  }

  async sync(id: string): Promise<TaskResult> {
    let payload = this.buildPayload(`sesame/${id}`);
    payload.body = {command: 'sync'}

    let response = await request.post(payload);
    let result = await this.waitForTask(response.task_id);

    return result;
  }

  private async getTaskStatus(taskId: string): Promise<TaskResult> {
    let payload = this.buildPayload('action-result');
    payload.qs = {task_id: taskId}

    let status = await request.get(payload);

    return status;
  }

  private async waitForTask(taskId: string): Promise<TaskResult> {
    let retries = Config.MAX_RETRIES;

    while (retries-- > 0) {
      Logger.debug(`Waiting for control task to complete. Attempts remaining: ${retries}/${Config.MAX_RETRIES}`);

      await this.delay(Config.DELAY);

      let task = await this.getTaskStatus(taskId);
      Logger.debug('Task response', task);

      return task;
    }

    return null;
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
