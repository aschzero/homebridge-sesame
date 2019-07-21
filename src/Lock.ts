import { Client } from './Client';
import { LockMetadata, LockStatus, TaskResult } from './interfaces/API';
import { Mutex } from './util/Mutex';

export class Lock {
  id: string;
  serial: string;
  name: string;
  status: LockStatus;

  client: Client;
  statusMutex: Mutex<LockStatus>;
  syncMutex: Mutex<TaskResult>;

  constructor(metadata: LockMetadata) {
    this.client = new Client();
    this.statusMutex = new Mutex<LockStatus>();
    this.syncMutex = new Mutex<TaskResult>();

    this.id = metadata.device_id;
    this.name = metadata.nickname;
    this.serial = metadata.serial;
  }

  async getStatus(): Promise<LockStatus> {
    try {
      this.status = await this.statusMutex.wait(() => this.client.getStatus(this.id));
      return this.status;
    } catch(e) {
      throw e;
    }
  }

  async syncStatus(): Promise<void> {
    await this.syncMutex.wait(() => this.client.sync(this.id));
  }

  async setLockedState(locked: boolean): Promise<void> {
    await this.client.control(this.id, locked);
  }
}
