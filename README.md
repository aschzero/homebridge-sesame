# homebridge-sesame

[![npm version](http://img.shields.io/npm/v/homebridge-sesame.svg)](https://npmjs.org/package/homebridge-sesame)

Control and monitor your Sesame smart lock with HomeKit integration.

## Prerequisites

* Working installation of [Homebridge](https://github.com/nfarina/homebridge)
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

Example homebridge configuration file:

```
{
  "bridge": {
    "name": "Homebridge",
    "username": "CD:22:3D:E3:CE:30",
    "port": 51826,
    "pin": "031-45-156"
  },
  "platforms": [
    {
      "platform": "Sesame",
      "email": "my@email.com",
      "password": "password123"
    }
  ]
}
```

| Field    | Usage                                                                    |
|----------|--------------------------------------------------------------------------|
| platform | Needs to be `Sesame`                                                     |
| email    | Your Sesame account email address                                        |
| password | Your Sesame account password                                             |
| debug    | Optional. Set to `true` to enable additional logging (default: `false`)  |

homebridge-sesame will automaticaly discover your connected locks when homebridge is restarted.
