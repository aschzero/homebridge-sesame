import * as request from 'request-promise';
import * as store from 'store';
import { Config } from './Config';
import { Lock, LockStatus, TaskResult } from './interfaces/API';
import { Logger } from './Logger';

export class Client {
  token: string;

  constructor() {
    this.token = store.get('token');
  }

  async listLocks(): Promise<Lock[]> {
    let options = this.buildRequestOptions('sesames');
    let response = await request.get(options);

    Logger.debug('Got listLocks response', response);

    return response;
  }

  async getStatus(id: string): Promise<LockStatus> {
    let options = this.buildRequestOptions(`sesame/${id}`);

    let status = await request.get(options);
    Logger.debug('Got status response', status);

    return status;
  }

  async control(id: string, secure: boolean): Promise<TaskResult> {
    let options = this.buildRequestOptions(`sesame/${id}`);
    options.body = {command: (secure ? 'lock' : 'unlock')}

    let response = await request.post(options);
    let result = await this.waitForTask(response.task_id);

    return result;
  }

  async sync(id: string): Promise<TaskResult> {
    let options = this.buildRequestOptions(`sesame/${id}`);
    options.body = {command: 'sync'}

    let response = await request.post(options);
    let result = await this.waitForTask(response.task_id);

    return result;
  }

  private async getTaskStatus(task_id: string): Promise<TaskResult> {
    let options = this.buildRequestOptions('action-result');
    options.qs = {task_id: task_id};

    let status = await request.get(options);

    return status;
  }

  private async waitForTask(task_id: string): Promise<TaskResult> {
    let retries = Config.MAX_RETRIES;
    let result: TaskResult;

    while (retries-- > 0) {
      if (retries == 0) {
        throw new Error('Control task took too long to complete.');
      }

      Logger.debug(`Waiting for task to complete. Attempts remaining: ${retries}/${Config.MAX_RETRIES}`);

      await this.delay(Config.DELAY);

      result = await this.getTaskStatus(task_id);
      Logger.debug('Task response', result);

      if (result.status == 'processing') {
        continue;
      }

      return result;
    }
  }

  private buildRequestOptions(path: string): request.Options {
    let options: request.Options = {
      uri: `${Config.API_URI}/${path}`,
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.token
      }
    }

    return options;
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
