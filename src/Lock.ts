import { LockMetadata, LockStatus } from './interfaces/API';
import { Mutex } from './util/Mutex';

export class Lock {
  id: string;
  serial: string;
  name: string;

  constructor(metadata: LockMetadata) {
    this.id = metadata.device_id;
    this.name = metadata.nickname;
    this.serial = metadata.serial;
  }
}
