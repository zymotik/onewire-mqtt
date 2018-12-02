const mqtt = require('mqtt');
const onewire = require('ds18b20');
const { config } = require('./config');
const { log } = require('./logger');

let sensorIds = [];

async function init(){
    if (!config.loadError) {    
        sensorIds = await findSensors();

        if (sensorIds.length > 0) {
            if (config.username && config.password) {
                log(`Connect MQTT server with credentials`);
                mqttClient = mqtt.connect({host: `${config.server}`, username: config.username, password: config.password});
            } else {
                log(`Connect MQTT server`);
                mqttClient = mqtt.connect({host: `${config.server}`});
            }
            
            setInterval(getTemperatures, config.publishFrequency * 1000);
        }
    }
}

function publishTemperature(sensorId, value) {
    if (sensorId && !isNaN(value)){
        const topic = `${config.topic}/${sensorId}/SENSOR`;
        const data = {"DS18B20": { "Address": sensorId, "Temperature": value } };
        mqttClient.publish(topic, 
                            JSON.stringify(data), {}, (err) => {
            if(!err) {
                log(`Published ${topic}: ${value}°C`, true);
            } else {
                log(`Error on MQTT publish: ${err}`);
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
        log(`Getting temperature for ${id}`, true);
        onewire.temperature(id, {}, (err, data) => {
           if (!err && data) {
            publishTemperature(id, data);
           }
        });
    });
}

init();
