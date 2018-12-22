# homebridge-sesame

[![npm version](http://img.shields.io/npm/v/homebridge-sesame.svg)](https://npmjs.org/package/homebridge-sesame)

Control and monitor your Sesame smart lock with HomeKit integration.

## Prerequisites

* Installation of [Homebridge](https://github.com/nfarina/homebridge)
* iOS 11 or later
* Sesame lock with enabled cloud integration
* Sesame Wifi Access Point

## Functionality

* Automatic discovery of all connected locks
* Lock control
* Reports battery percentage levels
* Alerting when battery runs low

## Installation

```
npm install -g homebridge-sesame
```

## Configuration

### Obtain an API Token

This plugin now uses v3 of the Sesame API which requires an existing API token.

To create an API token, log into the [Sesame Dashboard](https://my.candyhouse.co/) and click on "API Settings" in the sidebar. The token you create will be used in your homebridge config file.

### Configuration

Add the following to your homebridge config:

```
"platforms": [
  {
    "platform": "Sesame",
    "token": "YOUR_API_TOKEN"
  }
]
```

homebridge-sesame will discover your connected locks when homebridge is restarted.