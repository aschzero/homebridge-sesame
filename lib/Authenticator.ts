// import * as request from 'request-promise';
// import * as store from 'store';

// import { Config } from './Config';
// import { Logger } from './Logger';
// import { LockResponse } from './types';

// export class Authenticator {
//   async authenticate(email: string, password: string): Promise<string> {
//     let payload = {
//       uri: `${Config.API_URI}/accounts/login`,
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       method: 'POST',
//       json: true,
//       body: {
//         'email': email,
//         'password': password
//       }
//     }

//     let response = await request(payload);
//     let authResponse = response;

//     Logger.debug('Got response:', authResponse);

//     let token = authResponse.authorization;
//     store.set('token', token);

//     return token;
//   }

//   async getLocks(): Promise<LockResponse[]> {
//     let token = store.get('token');
//     let payload = {
//       uri: `${Config.API_URI}/sesames`,
//       method: 'GET',
//       json: true,
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Authorization': token
//       }
//     }

//     let response = await request(payload);
//     let locks: LockResponse[] = response.sesames;

//     Logger.debug('Got response:', locks);

//     return locks;
//   }
// }
