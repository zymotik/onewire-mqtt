const mqtt = require('./mqtt');
const { config } = require('./config');
const { log } = require('./logger');
const OneWire = require('./onewire');

async function init(){
    if (!config.loadError) {
        const onewire = new OneWire(); 

        mqttConnect();
        
        onewire.on('temperature', (id, temperature) => {
            mqttPublish(id, temperature);
        });

        onewire.start();
    }
}

function mqttConnect() {
    if (config.username && config.password) {
        log(`Connect MQTT server with credentials`);
        mqtt.connect(config.server, config.username, config.password);
    } else {
        log(`Connect MQTT server`);
        mqtt.connect(config.server);
    }
}

function mqttPublish(sensorId, value) {
    if (sensorId && !isNaN(value)){
        const topic = `${config.topic}/${sensorId}/SENSOR`;
        const data = { "DS18B20": { "Address": sensorId, "Temperature": value } };
        mqtt.publish(topic, JSON.stringify(data));
    }
}

init();
