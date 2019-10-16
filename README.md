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