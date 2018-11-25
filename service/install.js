const Service = require('node-service-linux').Service;
const serviceDetails = require('./service-details');

var svc = new Service(serviceDetails);

svc.on('install', function() {
    console.log(`${serviceDetails.name}: install complete.`);
    svc.start();
    console.log(`${serviceDetails.name}: service started.`);
});

svc.install();
