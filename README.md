# plex-wrapper
Small module that makes it easier to use the Plex API for management.
For now the wrapper will only support management side of things, media control will be added later.

## Usage
Installing the package
```bash
$ npm i plex-wrapper
```

### Getting started
First you need to require the package and then create an instance of the wrapper with the required parameters.
- **clientId**: A unique client identifier, you can generate a random one [here](https://www.guidgenerator.com/online-guid-generator.aspx). I do not recommend generating a new one every time you run it, as they will clutter up your authorized devices on your Plex.tv account.
- **username**: Your Plex.tv username
- **password**: Your Plex.tv password
```js
var plexWrapper = require("plex-wrapper");
var client = new plexWrapper("clientId", "username", "password");
```

### .authenticate() `optional`

**Authenticate login with the supplied username and password**
It is possible to manually authenticate, after the authentication has gone through you can then take advantage of the promise callback. All the functions built into this libarary will try to authenticate before performing any method, so this functionality is only for people that wants to have full control.

```js
var plexWrapper = require("plex-wrapper");
var client = new plexWrapper("clientId", "username", "password");

client.authenticate().then(() => {
    // Perform any action that requires the client to be signed in
    client.getServers();
});
```

### .getServers()

**Return all servers assosicated with Plex account**
By default Plex API returns servers in XML format, this function converts it to JSON before returning. This function is also taking advantage of promise callbacks, which is demonstrated in the example:

```js
var plexWrapper = require("plex-wrapper");
var client = new plexWrapper("clientId", "username", "password");

client.getServers().then(result => {
    // The result contains a JSON array with all the servers
    console.log(result);
});
```