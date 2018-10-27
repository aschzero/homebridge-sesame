import { LockResponse } from './types';

export class Lock {
  id: string;
  serial: string;
  name: string;
  locked: boolean;
  responsive: boolean;
  battery: number;

  static buildFromResponse(metadata: LockResponse.Metadata, status?: LockResponse.Status): Lock {
    let lock = new Lock();

    lock.id = metadata.device_id;
    lock.name = metadata.nickname;
    lock.serial = metadata.serial;

    if (status) {
      lock.locked = status.locked;
      lock.responsive = status.responsive;
      lock.battery = status.battery;
    }

    return lock;
  }
}
