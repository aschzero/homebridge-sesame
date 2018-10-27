import { LockResponse } from './types';

export class Lock {
  id: string;
  serial: string;
  name: string;
  locked: boolean;
  responsive: boolean;
  battery: number;

  static buildFromMetadata(metadata: LockResponse.Metadata): Lock {
    let lock = new Lock();

    lock.id = metadata.device_id;
    lock.name = metadata.nickname;
    lock.serial = metadata.serial;

    return lock;
  }

  setStatus(status: LockResponse.Status): Lock {
    this.locked = status.locked;
    this.responsive = status.responsive;
    this.battery = status.battery;

    return this;
  }
}
