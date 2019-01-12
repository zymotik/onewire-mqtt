
require('babel-register')();
require('babel-polyfill');

import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { expect } from 'chai';
import rewiremock from 'rewiremock';

chai.should();
chai.use(sinonChai);

var OneWire = require('../onewire');

describe('OneWire', function(){
    describe('emit', function(){
        it('should invoke the callback', function(){
            var spy = sinon.spy();
            var emitter = new OneWire();

            emitter.on('temperature', spy);
            emitter.emit('temperature');
            expect(spy.called).to.be.true;
        });

        it('should pass arguments to the callbacks', function(){
            var spy = sinon.spy();
            var emitter = new OneWire();

            emitter.on('temperature', spy);
            emitter.emit('temperature', 12345678, 12.3);
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, 12345678, 12.3);
        });
    });

    describe('findSensors', () => {
        function getOneWireMock(err, ids) {
            return rewiremock.proxy('../onewire', () => ({
                'logger': {
                    log: () => {}
                },
                'ds18b20': {
                    sensors: sinon.fake((callback) => {
                        callback(err, ids);
                    })
                }
            }));
        }

        it('returns sensors', (done) => {
            const OneWireMocked = getOneWireMock(undefined, [12345]);
            const onewire = new OneWireMocked();

            onewire.findSensors().then((sensors) => {
                expect(sensors[0]).to.equal(12345);
                done();
            });
        });

        it('returns sensors', (done) => {
            const OneWireMocked = getOneWireMock(undefined, undefined);
            const onewire = new OneWireMocked();

            onewire.findSensors().then((sensors) => {
                expect(sensors.length).to.equal(0);
                done();
            });
        });

        it('handles error', (done) => {
            const OneWireMocked = getOneWireMock({error: 'test error of some kind'}, undefined);
            const onewire = new OneWireMocked();

            onewire.findSensors().then((sensors) => {
                expect(sensors.length).to.equal(0);
                done();
            });
        });
    });

    describe('getTemperatures', () => {
        function getOneWireMock(spy) {
            return rewiremock.proxy('../onewire', () => ({
                'logger': {
                    log: () => {}
                },
                'ds18b20': {
                    sensors: (callback) => {
                        callback(undefined, [12345]); 
                    },
                    temperature: spy
                }
            }));
        }

        it('called', async () => {
            const spy = sinon.fake((id, options, callback) => callback(undefined, 12.3) );
            const OneWireMocked = getOneWireMock(spy);
            const onewire = new OneWireMocked();

            await onewire.start();
            onewire.getTemperatures();

            expect(spy.called).to.be.true;
        });

        it('emit', async () => {
            const spyTemperatureRead = sinon.fake((id, options, callback) => callback(undefined, 12.3) );
            const spyEmit = sinon.spy();
            const OneWireMocked = getOneWireMock(spyTemperatureRead);
            const onewire = new OneWireMocked();
            
            onewire.on('temperature', spyEmit);

            await onewire.start();
            onewire.getTemperatures();

            expect(spyTemperatureRead.called).to.be.true;
            expect(spyEmit.called).to.be.true;
            expect(spyEmit.getCall(0).args[0]).to.equal(12345);
            expect(spyEmit.getCall(0).args[1]).to.equal(12.3);
        });

        it('handles error', async () => {
            const spy = sinon.fake((id, options, callback) => callback({ error: 'some error' }, undefined) );
            const OneWireMocked = getOneWireMock(spy);
            const onewire = new OneWireMocked();

            await onewire.start();
            onewire.getTemperatures();

            expect(spy.called).to.be.true;
        });
    });

    describe('interval', () => {
        function getOneWireMock() {
            return rewiremock.proxy('../onewire', () => ({
                'logger': {
                    log: () => {}
                },
                'ds18b20': {
                    sensors: (callback) => {
                        callback(undefined, [12345]); 
                    },
                    temperature: () => {}
                }
            }));
        }

        it('start', async () => {
            const OneWireMocked = getOneWireMock();
            const onewire = new OneWireMocked();

            await onewire.start();
            
            expect(onewire.publisher._destroyed).to.be.false;
        });

        it('stop', async () => {
            const OneWireMocked = getOneWireMock();
            const onewire = new OneWireMocked();

            await onewire.start();
            onewire.stop();

            setTimeout(() => {
                expect(onewire.publisher._destroyed).to.be.true;
            }, 100);
        });
    });
});