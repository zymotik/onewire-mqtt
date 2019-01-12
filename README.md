# OneWire to MQTT node library

Quick and simple library to get one or more OneWire temperature sensors published from a Raspberry Pi onto an MQTT bus.

Quick start:
    
* clone this repo on to a RaspberryPi:

    `git clone https://github.com/zymotik/onewire-mqtt.git`

* switch to the `onewire-mqtt` folder

* install node libraries:

    `npm install`

* edit settings:

    * Copy: 
        `copy settings.sample.json settings.json`
    * Edit:
        `nano settings.json`

* run library

    `sudo npm run start`

In my use case, I'm using Home Assistant to manage MQTT sensor data for generic climate control.

Look at my other node packages for code for switching GPIO's on and off via MQTT.

## Install as service

Install this node module as a service that will start automatically on restart of the device:

`sudo npm service-install`

To uninstall the service:

`sudo npm service-uninstall`

## Developer notes

Find service logs on the RaspberryPi device in the /var/log/daemon.log file. To see the tail of these logs, run `sudo npm run view-log`.
