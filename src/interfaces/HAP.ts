export interface Accessory {
  new (name: string, uuid: string): Accessory;

  UUID: string;
  reachability: boolean;
  services: Service[];
  context: any;

  on(...args: any[]): void;
  getService(...args: any[]): Service;
  addService(...args: any[]): Service;
  removeService(...args: any[]): void;
  getServiceByUUIDAndSubType(...args: any[]): Service;
  updateReachability(reachable: boolean): void;
}

export interface Service {
  new (displayName: string): Service;

  UUID: string;
  AccessoryInformation: Service;

  LockMechanism: Service;
  BatteryService: Service;

  addCharacteristic(characteristic: Characteristic): Characteristic;
  setCharacteristic(...args: any[]): Service;
  getCharacteristic(...args: any[]): Characteristic;
}

export interface Characteristic {
  Manufacturer: Characteristic;
  Model: Characteristic;
  SerialNumber: Characteristic;

  LockCurrentState: LockCurrentState;
  LockTargetState: Characteristic;
  BatteryLevel: Characteristic;
  ChargingState: ChargingState;
  StatusLowBattery: StatusLowBattery;

  on(...args: any[]): Characteristic;
  updateValue(...args: any[]): Characteristic;
}

export interface LockCurrentState {
  new(): Characteristic;
  SECURED: number;
  UNSECURED: number;
}

export interface ChargingState {
  NOT_CHARGING: number;
}

export interface StatusLowBattery {
  BATTERY_LEVEL_LOW: number;
  BATTERY_LEVEL_NORMAL: number;
}

export interface Log {
  (...args: any[]): void;
  error(...args: any[]): void;
}

export interface Platform {
  on(...args: any[]): void
  registerPlatformAccessories(pluginName: string, platformname: string, accessories: Array<Accessory>): void;
  unregisterPlatformAccessories(pluginName: string, platformname: string, accessories: Array<Accessory>): void;
}

export interface UUID {
  generate(string): string;
}