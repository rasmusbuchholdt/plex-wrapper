import { isUndefined } from 'util';

import { PlexAPIClientOptions } from './models/options';
import { PlexServer } from './models/server';
import { PlexSession } from './models/session';
import { PlexSessionPlayer } from './models/session/player';
import { PlexSessionUser } from './models/session/user';
import { PlexUser } from './models/user';
import { parseXML } from './util';

let request = require('request-promise');
let os = require('os');

export class PlexAPIClient {
  private clientId: string = '';
  private username: string = '';
  private password: string = '';
  private accessToken: string = '';
  private options: PlexAPIClientOptions = {};

  constructor(clientId: string, username: string, password: string, options?: PlexAPIClientOptions) {
    this.clientId = clientId;
    this.username = username;
    this.password = password;
    Object.assign(this.options, options);
  }

  authenticate(): Promise<string> {
    let options: {} = {
      method: 'POST',
      url: 'https://plex.tv/api/v2/users/signin',
      json: true,
      headers: {
        'X-Plex-Client-Identifier': this.clientId,
        'X-Plex-Device-Name': this.options.title || 'Node.js Device',
        'X-Plex-Version': this.options.version || '1.0',
        'X-Plex-Product': this.options.description || 'My awesome app!',
        'X-Plex-Device': this.options.operatingSystem || os.platform()
      },
      form: {
        login: this.username,
        password: this.password,
      },
    };

    return new Promise<string>(resolve => {
      request(options)
        .then((result: { authToken: string }) => {
          this.accessToken = result.authToken;
          resolve(result.authToken);
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }

  getServers(): Promise<PlexServer[]> {
    if (this.accessToken === '') return this.authenticate().then(() => this.getServers());
    let servers: PlexServer[] = [];
    let options: {} = {
      method: 'GET',
      url: 'https://plex.tv/api/servers',
      json: true,
      headers: {
        'X-Plex-Token': this.accessToken,
      },
    };

    return new Promise(resolve => {
      request(options)
        .then((result: any) => {
          parseXML(result).then((parsedResult: any) => {
            if (isUndefined(parsedResult.MediaContainer.Server)) return resolve(servers);
            parsedResult.MediaContainer.Server.forEach((server: any) => {
              servers.push(Object.assign(new Object as PlexServer, server.$));
            });
            resolve(servers);
          });
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }

  getUsers(): Promise<PlexUser[]> {
    if (this.accessToken === '') return this.authenticate().then(() => this.getUsers());
    let users: PlexUser[] = [];
    let options: {} = {
      method: 'GET',
      url: 'https://plex.tv/api/users',
      json: true,
      headers: {
        'X-Plex-Token': this.accessToken,
      },
    };

    return new Promise(resolve => {
      request(options)
        .then((result: any) => {
          parseXML(result).then((parsedResult: any) => {
            if (isUndefined(parsedResult.MediaContainer.User)) return resolve(users);
            parsedResult.MediaContainer.User.forEach((user: any) => {
              users.push(Object.assign(new Object as PlexUser, user.$));
            });
            resolve(users);
          });
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }

  getPendingUsers(): Promise<PlexUser[]> {
    if (this.accessToken === '') return this.authenticate().then(() => this.getPendingUsers());
    let users: PlexUser[] = [];
    let options: {} = {
      method: 'GET',
      url: 'https://plex.tv/api/invites/requested',
      json: true,
      headers: {
        'X-Plex-Token': this.accessToken,
      },
    };

    return new Promise(resolve => {
      request(options)
        .then((result: any) => {
          parseXML(result).then((parsedResult: any) => {
            if (isUndefined(parsedResult.MediaContainer.Invite)) return resolve(users);
            parsedResult.MediaContainer.Invite.forEach((user: any) => {
              users.push(Object.assign(new Object as PlexUser, user.$));
            });
            resolve(users);
          });
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }

  getAllUsers(): Promise<PlexUser[]> {
    let users: PlexUser[] = [];
    return new Promise((resolve: any, reject: any) => {
      this.getUsers().then(userResult => {
        users.push(...userResult);
        this.getPendingUsers().then(pendingUserResult => {
          users.push(...pendingUserResult);
          resolve(users);
        });
      });
    });
  }

  inviteUser(username: string, machineId: string): any {
    if (this.accessToken === '') return this.authenticate().then(() => this.inviteUser(username, machineId));
    let options: {} = {
      method: 'POST',
      uri: 'https://plex.tv/api/v2/shared_servers',
      headers: {
        'X-Plex-Client-Identifier': this.clientId,
        'X-Plex-Token': this.accessToken,
      },
      form: {
        invitedEmail: username,
        librarySectionIds: [],
        machineIdentifier: machineId,
        settings: {}
      }
    };
    request(options)
      .catch((error: any) => {
        throw new Error(error.message);
      });
  }

  removeUser(userId: string): any {
    if (this.accessToken === '') return this.authenticate().then(() => this.removeUser(userId));
    let options: {} = {
      method: 'DELETE',
      uri: `https://plex.tv/api/friends/${userId}`,
      headers: {
        'X-Plex-Client-Identifier': this.clientId,
        'X-Plex-Token': this.accessToken,
      },
    };
    request(options)
      .catch((error: any) => {
        throw new Error(error.message);
      });
  }

  removePendingUser(userId: string): any {
    if (this.accessToken === '') return this.authenticate().then(() => this.removePendingUser(userId));
    let options: {} = {
      method: 'DELETE',
      uri: `https://plex.tv/api/invites/requested/${userId}?friend=1&server=1&home=0`,
      headers: {
        'X-Plex-Client-Identifier': this.clientId,
        'X-Plex-Token': this.accessToken,
      },
    };
    request(options)
      .catch((error: any) => {
        throw new Error(error.message);
      });
  }

  getSessions(ip: string, port: number): Promise<PlexSession[]> {
    if (this.accessToken === '') return this.authenticate().then(() => this.getSessions(ip, port));
    let sessions: PlexSession[] = [];
    let options: {} = {
      method: 'GET',
      url: `http://${ip}:${port}/status/sessions`,
      headers: {
        'X-Plex-Token': this.accessToken,
      },
    };

    return new Promise(resolve => {
      request(options)
        .then((result: any) => {
          parseXML(result).then((parsedResult: any) => {
            if (isUndefined(parsedResult.MediaContainer.Video)) return resolve(sessions);
            parsedResult.MediaContainer.Video.forEach((session: any) => {
              sessions.push(Object.assign(new Object as PlexSession, session.$, {
                player: {
                  ...session.Player[0].$ as PlexSessionPlayer
                },
                user: {
                  ...session.User[0].$ as PlexSessionUser
                }
              }));
            });
            resolve(sessions);
          });
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }

  isValidUser (emailOrUsername: string): Promise<boolean> {
  
    if (this.accessToken === '') return this.authenticate().then(() => this.isValidUser(emailOrUsername));
  
    let options: {} = {
      method: 'POST',
      url: `https://plex.tv/api/users/validate?invited_email=${emailOrUsername}`,
      headers: {
        'X-Plex-Token': this.accessToken,
      },
    };
  
    return new Promise(resolve => {
      request(options)
        .then((result: any) => {
          resolve(result.includes('Valid user'))
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }
}
