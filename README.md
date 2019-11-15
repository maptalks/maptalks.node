# maptalks.node
maptalks adapter for Node

## Install

```
npm install maptalks.node --save
```

## Usage

```javascript
var maptalks = require('maptalks.node');

//do your stuff
```

if you need to custom http agent for ajax requests:
```
var maptalks = require('maptalks.node');
maptalks.setupHttpAgent({ keepAlive: true });
```

See [https://nodejs.org/dist/latest-v8.x/docs/api/http.html#http_new_agent_options](https://nodejs.org/dist/latest-v8.x/docs/api/http.html#http_new_agent_options)