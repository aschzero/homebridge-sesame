export interface Payload {
  uri: string;
  json: boolean;
  headers: any;
  qs?: any;
  body?: any;
}

export interface Metadata {
  device_id: string;
  serial: string;
  nickname: string;
}

export interface Status {
  locked: boolean;
  responsive: boolean;
  battery: number;
}

export interface Control {
  task_id: string;
}

export interface Task {
  task_id: string;
  status: string;
  successful: boolean;
}