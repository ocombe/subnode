node-sickbeard
==============

Access SickBeard API with nodeJS


# Installation & usage

- Download sickbeard from npm
```bash
$ npm install sickbeard
```

- Usage example :
```javascript
var sickbeard = require('sickbeard');
sickbeard = new sickbeard('http://localhost:8081', 'bfca65a13f27a312569ea69cfc52251c');
sb.api('show.seasons', {tvdbid: 72108}, function(data) {
    console.log(data);
});
```