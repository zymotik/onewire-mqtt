
const onewire = require('ds18b20');
const { log } = require('./logger');
const { config } = require('./config');

const { EventEmitter } = require('events');

class OneWire extends EventEmitter {

    constructor () {
        super();
        this.publisher;
        this.sensors = [];
    }

    async start() {
        this.sensors = await this.findSensors();
        
        if (this.sensors.length > 0) {
            this.publisher = setInterval(() => {
                this.getTemperatures();
            }, config.publishFrequency);
        }
    }
    
    stop() {
        clearInterval(this.publisher);
    }
    
    findSensors() {
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
    
    getTemperatures() {
        this.sensors.map((id) => {
            log(`Getting temperature for ${id}`, true);
            onewire.temperature(id, {}, (err, temperatureValue) => {
                if (!err && temperatureValue) {
                    log(`${id} temperature ${temperatureValue}`, true);        
                    this.emit('temperature', id, temperatureValue);
                }
            });
        });
    }

}

module.exports = OneWire;
