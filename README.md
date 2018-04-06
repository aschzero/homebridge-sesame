# homebridge-sesame

Control and monitor your Sesame smart lock with HomeKit integration.

## Prerequisites

* Working installation of [Homebridge](https://github.com/nfarina/homebridge)
* iOS 11 or later
* Sesame lock with enabled cloud integration
* Sesame Wifi Access Point

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
      "name": "Sesame",
      "email": "my@email.com",
      "password": "password123"
    }
  ]
}
```

The plugin will automaticaly discover your connected locks when homebridge is restarted.

### Required Fields
* **platform** - Set to "Sesame"
* **name** - Name of the accessories that appears in HomeKit
* **email/password** - Your login credentials

## Functionality

* Automatic discovery of all connected locks
* Lock and unlock
* Reports battery percentage levels
* Alerting when battery runs low