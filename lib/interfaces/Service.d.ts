export interface Service {
  AccessoryInformation: void

  setCharacteristic(...args: any[]): Service
  getCharacteristic(...args: any[]): Characteristic
}

export interface Characteristic {
  on(...args: any[]): Characteristic
}