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
        this.authenticate(username, password);
    }

    private authenticate(username: string, password: string): Promise<boolean> {
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
                login: username,
                password: password
            },
        };

        return new Promise<boolean>((resolve: any, reject: any) => {
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
}