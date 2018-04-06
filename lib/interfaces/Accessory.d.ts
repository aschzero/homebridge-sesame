import { Service } from './Service'

export interface Accessory {
  UUID: string;

  on(...args: any[]): void
  getService(...args: any[]): Service
  addService(...args: any[]): Service
  updateReachability(reachable: boolean): void
}
