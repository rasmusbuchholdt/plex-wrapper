import { parseXML } from './util';

let request = require('request-promise');

export class PlexWrapper {
  private clientId: string = '';
  private username: string = '';
  private password: string = '';
  private accessToken: string = '';

  constructor(clientId: string, username: string, password: string) {
    this.clientId = clientId;
    this.username = username;
    this.password = password;
  }

  authenticate(): Promise<any> {
    let options: {} = {
      method: 'POST',
      url: 'https://plex.tv/api/v2/users/signin',
      json: true,
      headers: {
        'X-Plex-Client-Identifier': this.clientId,
        'X-Plex-Device-Name': '',
        'X-Plex-Product': '',
        'X-Plex-Device': '',
        'X-Plex-Version': '',
      },
      form: {
        login: this.username,
        password: this.password,
      },
    };

    return new Promise<any>((resolve: any) => {
      request(options)
        .then((result: { authToken: string }) => {
          this.accessToken = result.authToken;
          resolve();
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }

  getServers(): Promise<any> {
    if (this.accessToken === '') return this.authenticate().then(() => this.getServers());
    let options: {} = {
      method: 'GET',
      url: 'https://plex.tv/api/servers',
      json: true,
      headers: {
        'X-Plex-Token': this.accessToken,
      },
    };

    return new Promise((resolve: any) => {
      request(options)
        .then((result: any) => {
          parseXML(result).then((parsedResult: any) => {
            resolve(parsedResult.MediaContainer.Server || []);
          });
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }

  getUsers(): Promise<any> {
    if (this.accessToken === '') return this.authenticate().then(() => this.getUsers());
    let options: {} = {
      method: 'GET',
      url: 'https://plex.tv/api/users',
      json: true,
      headers: {
        'X-Plex-Token': this.accessToken,
      },
    };

    return new Promise((resolve: any, reject: any) => {
      request(options)
        .then((result: any) => {
          parseXML(result).then((parsedResult: any) => {
            resolve(parsedResult.MediaContainer.User || []);
          });
        })
        .catch((error: any) => {
          throw new Error(error.message);
        });
    });
  }

  getPendingUsers(): Promise<any> {
    if (this.accessToken === '') return this.authenticate().then(() => this.getPendingUsers());
    let options: {} = {
      method: 'GET',
      url: 'https://plex.tv/api/invites/requested',
      json: true,
      headers: {
        'X-Plex-Token': this.accessToken,
      },
    };

    return new Promise((resolve: any, reject: any) => {
      request(options)
        .then((result: any) => {
          parseXML(result).then((parsedResult: any) => {
            resolve(parsedResult.MediaContainer.Invite || []);
          });
        })
        .catch((error: any) => {
          throw new Error(error.message);
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
}