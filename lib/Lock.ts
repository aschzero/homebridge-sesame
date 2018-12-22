import { Metadata, Status } from './interfaces/API';

export class Lock {
  id: string;
  serial: string;
  name: string;
  locked: boolean;
  responsive: boolean;
  battery: number;

  static buildFromMetadata(metadata: Metadata): Lock {
    let lock = new Lock();

    lock.id = metadata.device_id;
    lock.name = metadata.nickname;
    lock.serial = metadata.serial;

    return lock;
  }

  setStatus(status: Status): Lock {
    this.locked = status.locked;
    this.responsive = status.responsive;
    this.battery = status.battery;

    return this;
  }
}
