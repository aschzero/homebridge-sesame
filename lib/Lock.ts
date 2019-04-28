import { Client } from './Client';
import { LockMetadata, LockStatus } from './interfaces/API';
import { Mutex } from './util/Mutex';

export class Lock {
  id: string;
  serial: string;
  name: string;
  status: LockStatus;

  client: Client;
  statusMutex: Mutex<LockStatus>;

  constructor(metadata: LockMetadata) {
    this.client = new Client();
    this.statusMutex = new Mutex<LockStatus>();

    this.id = metadata.device_id;
    this.name = metadata.nickname;
    this.serial = metadata.serial;
  }

  async getStatus(): Promise<LockStatus> {
    let status = await this.statusMutex.wait(() => this.client.getStatus(this.id));
    this.status = status;

    return status;
  }

  async setLockedState(locked: boolean): Promise<void> {
    let result = await this.client.control(this.id, locked);
    let action = locked ? 'lock' : 'unlock';

    if (result == null) {
      throw Error(`Took too long to ${action}, please try again.`);
    }

    if (!result.successful) {
      throw Error(`Unable to ${action}, got error ${result.error}`);
    }
  }
}
