# Node Ethernet/IP Scan List

[![npm](https://img.shields.io/npm/v/ethernet-ip-scanlist.svg?style=flat-square)](https://www.npmjs.com/package/ethernet-ip-scanlist)
[![license](https://img.shields.io/github/license/patrickjmcd/node-ethernet-ip-scanlist.svg?style=flat-square)](https://github.com/patrickjmcd/node-ethernet-ip-scanlist/blob/master/LICENSE)
![license](https://img.shields.io/travis/patrickjmcd/node-ethernet-ip-scanlist.svg?style=flat-square)
[![github stars](https://img.shields.io/github/stars/patrickjmcd/node-ethernet-ip-scanlist.svg?&amp;style=social&amp;logo=github&amp;label=Stars)](https://github.com/patrickjmcd/node-ethernet-ip-scanlist)

A small plugin to help with scanning a list of tags.

## Installation

```Shell
npm install --save ethernet-ip-scanlist
```

or

```Shell
yarn add ethernet-ip-scanlist
```

## API

### ScanTag

The ScanTag class wraps the ethernet-ip tag with the ability to react periodically or to value changes.

#### ScanTag Constructor

The ScanTag class is constructed with the following parameters:

- tagName: the tag name in the PLC
- vanityName: Description or cleaned-up name (often used for gauges or graphing)
- storePeriod: max number of minutes between periodic value updates. This can be disabled by setting the parameter = 0
- storeChangeDelta: max absolute value change before the value is updated. This can be disabled by setting the parameter = 0

#### ```ScanTag.gotValue(value, force=false)```

Function to be called when a new value is read by the PLC.

Returns an object ```{ storeValue: <boolean>, reason: <string | null> }```

### ScanList

The ScanList class holds the configuration and values of all the tags added to the list.

#### ScanList Constructor

The ScanList class is constructed with the following parameters:

- ipAddress: the IP address of the PLC (it is also possible to pass a FQDN to this parameter)
- slot (optional, default = 0)
- scanRate (optional, default = 200ms): the rate at which the PLC is scanned

#### ```add(tagName, vanityName, storePeriod, storeChangeDelta)```

Creates a ```ScanTag``` with the given parameters.

#### ```remove(tagName)```

Removes a ```ScanTag``` from the ```ScanList``` with the given tag name.

## Events

Since the ```ScanList``` class extends ```EventEmitter```, it has the ability to emit events, two of which have been defined:

### 1. ```Updated```

The ```Updated``` event is emitted by the ```ScanList``` class when a tag's value has changed or the tag has been updated by the ```keepAlive``` parameter of the tag. This could be a minor change or no change at all. This event is useful for displaying values on an HMI screen or updating an in-memory value.

The event is emitted with a payload of the updated ```ScanTag```.

### 2. ```newValue```

The ```newValue``` event is emitted by the ```ScanList``` class when any of the following are true:

- The tag's value has changed by more than the ```storeChangeDelta```
- The amount of time specified in the ```storePeriod``` has elapsed
- The ```force``` parameter was ```true``` when calling ```gotValue```
- There was no previous stored value or timestamp for the tag.

This event is useful for pushing values to a remote monitoring system or storing to a database.

The event is emitted with a payload of the updated ```ScanTag```.

## Usage

```Javascript
const { ScanList } = require("ethernet-ip-scanlist");
const scanList = new ScanList("192.168.1.1", 0);
scanList.add("analog_1_value", "Pressure Reading", 1, 60.0);
scanList.add("digital_2_status", "Valve Status (NC)", 1, 0);
scanList.start();
scanList.on("newValue", (tag) => {
    console.log(tag.vanityName, tag.value, tag.lastSendReason);
});
