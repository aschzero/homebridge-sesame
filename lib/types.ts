export namespace HAP {
  export interface Accessory {
    UUID: string;

    on(...args: any[]): void;
    getService(...args: any[]): Service;
    addService(...args: any[]): Service;
    getServiceByUUIDAndSubType(...args: any[]): Service;
    updateReachability(reachable: boolean): void;
  }

  export interface Service {
    AccessoryInformation: void;

    setCharacteristic(...args: any[]): Service;
    getCharacteristic(...args: any[]): Characteristic;
  }

  export interface Characteristic {
    on(...args: any[]): Characteristic;
  }

  export interface Log {
    (...args: any[]): void;
    error(...args: any[]): void;
  }

  export interface AccessoryConfig {
    error(...args: any[]): void
  }

  export interface Platform {
    on(...args: any[]): void
    registerPlatformAccessories(...args: any[]): void
  }
}

export interface LockResponse {
  device_id: string;
  nickname: string;
  is_unlocked: boolean;
  api_enabled: boolean;
  battery: number;
}
