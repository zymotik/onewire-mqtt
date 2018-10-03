const mqtt = require('mqtt');
const onewire = require('ds18b20');
const fs = require('fs');

let settings = {};
let sensorIds = [];

async function init(){
    settings = await loadSettings();
    if (settings && settings.server) {
        
        sensorIds = await findSensors();

        if (sensorIds.length > 0) {
            log(`Init server: ${settings.server}`);        
            mqttClient = mqtt.connect({host: `${settings.server}`, username: settings.username, password: settings.password});
            setInterval(getTemperatures, settings.publishTimer * 1000);
        }
    }
}

function loadSettings(){
    return new Promise((resolve, reject) => {
        fs.readFile('./settings.json', (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve(JSON.parse(data));
        });
    
    });
}

function publishTemperature(sensorId, value) {
    if (sensorId && !isNaN(value)){
        mqttClient.publish(`${settings.topic}/${sensorId}/SENSOR`, value.toString(), {}, (err) => {
            if(!err) {
                log(`Published ${sensorId}: ${value}°C`);
            }
        });
    }
}

async function findSensors() {
    return new Promise((resolve, _) => {
        log('Searching for OneWire sensors...');
        onewire.sensors(function(err, ids) {
            if(err) {
                console.error(err);
                resolve([]);
            } else if (ids) {
                log(`Found: ${ ids.toString() }`);
                resolve(ids);
            } else {
                log('No sensors found');
                resolve([]);    
            }
        });
    });
    
}

function getTemperatures() {
    sensorIds.map((id) => {
        log(`Getting temperature for ${id}`);
        onewire.temperature(id, {}, (err, data) => {
           if (!err && data) {
            publishTemperature(id, data);
           }
        });
    });
}

function log(message){
    const now = new Date();
    const strNow = `${pad(now.getDate())}/${pad(now.getMonth())}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    console.log(`${strNow} ${message}`);
}

function pad(number){
    return number.toString().padStart(2,0);
}

init();
