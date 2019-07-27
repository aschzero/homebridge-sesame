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
* WebHook support
* Reports battery percentage levels
* Alerting when battery runs low

## Installation

```
npm install -g homebridge-sesame
```

### Obtain an API Token

This plugin now uses v3 of the Sesame API which requires an existing API token.

To create an API token, log into the [Sesame Dashboard](https://my.candyhouse.co/) and click on "API Settings" in the sidebar. The token you create will be used in your homebridge config file.

### Using WebHooks

This plugin can respond to WebHooks sent from the Sesame API which allows locks to update in the background when a lock or unlock action occurs outside of the Home app. Please note this requires the IP address of your homebridge host to be exposed to the outside world via port forwarding, etc.

#### Setting up the WebHook

* Log into the [Sesame Dashboard](https://my.candyhouse.co/) and click on "API Settings" in the sidebar.
* Under "Services", click the edit button next to "Webhook" and select "POST" from the dropdown.
* Enter the publicly-accessible IP address of your homebridge server and the port used by this plugin (default: `33892`). For example: `http://<IP address>:33892`.

When the plugin receives a WebHook request, the corresponding lock in HomeKit will update its locked state accordingly.

## Configuration

### Example config

At a minimum, you just need to provide your API token in the `token` field:

```
{
  "platforms": [
    {
      "platform": "Sesame",
      "token": "YOUR_API_TOKEN"
    }
  ]
}
```

The plugin will discover your connected locks when homebridge is restarted.

### Fields

Variable | Description
-------- | -----------
`token` | Your Sesame API token (required)
`port`  | The port of the WebHook listener (default: `33892`)
`debug` | Set to `true` to enable additional debug logging (default: `false`)

### Example config changing default values

```
{
  "platforms": [
    {
      "platform": "Sesame",
      "token": "YOUR_API_TOKEN",
      "port": 55901,
      "debug": true
    }
  ]
}
```