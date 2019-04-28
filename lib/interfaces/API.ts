export interface Payload {
  uri: string;
  json: boolean;
  headers: any;
  qs?: any;
  body?: any;
}

export interface LockMetadata {
  device_id: string;
  serial: string;
  nickname: string;
}

export interface LockStatus {
  locked: boolean;
  responsive: boolean;
  battery: number;
}

export interface Control {
  task_id: string;
}

export interface TaskResult {
  task_id: string;
  status: string;
  successful: boolean;
  error: string;
}