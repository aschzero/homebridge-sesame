import * as express from 'express';
import { LockAccessory } from './LockAccessory';
import { Logger } from './Logger';

export class Server {
  locks: Map<string, LockAccessory>;
  port: number;
  api: express.Express;

  DEFAULT_PORT = 33892;

  constructor(port: number) {
    this.port = port || this.DEFAULT_PORT;

    this.locks = new Map<string, LockAccessory>();

    this.api = express();
    this.api.use(express.json());

    this.api.post('/', (req, res) => {
      try {
        this.handleRequest(req);
      } catch(e) {
        Logger.error(e);
      }

      res.end();
    });
  }

  listen(): void {
    this.api.listen(this.port, () => Logger.log(`Listening for webhooks on port ${this.port}`));
  }

  handleRequest(request: express.Request): void {
    let id = request.body.device_id;
    let locked = request.body.locked;

    if (id == null || locked == null) {
      Logger.log(`Unexpected webhook request body: ${JSON.stringify(request.body)}`);
      return;
    }

    let lockAccessory = this.locks.get(id);
    if (!lockAccessory) {
      Logger.log(`No lock accessory found from webhook request. Device ID: ${id}`);
      return;
    }

    lockAccessory.updateCurrentLockState(locked);

    Logger.log(`Set ${lockAccessory.lock.nickname} to ${locked ? 'locked' : 'unlocked'} from webhook`);
  }
}