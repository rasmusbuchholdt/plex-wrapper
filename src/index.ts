import { parseXML } from './util';

let request = require('request-promise');

export class PlexWrapper {

    private clientId: string = "";
    private username: string = "";
    private password: string = "";
    private accessToken: string = "";

    constructor(clientId: string, username: string, password: string) {
        this.clientId = clientId;
        this.username = username;
        this.password = password;
    }

    authenticate(): Promise<any> {
        let options: {} = {
            method: "POST",
            url: "https://plex.tv/api/v2/users/signin",
            json: true,
            headers: {
                "X-Plex-Client-Identifier": this.clientId,
                "X-Plex-Device-Name": "",
                "X-Plex-Product": "",
                "X-Plex-Device": "",
                "X-Plex-Version": ""
            },
            form: {
                login: this.username,
                password: this.password
            },
        };

        return new Promise<any>((resolve: any) => {
            request(options)
                .then((result: { authToken: string; }) => {
                    this.accessToken = result.authToken;
                    resolve();
                })
                .catch((error: any) => {
                    throw new Error(error.message)
                });
        });
    }

    getServers(): Promise<any> {
        if (this.accessToken === "") return this.authenticate().then(() => this.getServers());
        let options: {} = {
            method: "GET",
            url: `https://plex.tv/api/servers`,
            json: true,
            headers: {
                "X-Plex-Token": this.accessToken,
            },
        };

        return new Promise((resolve: any) => {
            request(options)
                .then((result: any) => {
                    parseXML(result).then((parsedResult: any)  => {
                        resolve(parsedResult.MediaContainer.Server);
                    });
                }).catch((error: any) => {
                    throw new Error(error.message)
                });
        });
    }
}