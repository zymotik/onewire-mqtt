import rewiremock from 'rewiremock';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { expect } from 'chai';

const path = require('path');

chai.should();
chai.use(sinonChai);

describe('settings', function() {
    it('should load settings', function() {
        const settingsJson = `{
            "server": "192.168.0.1",
            "username": "someusername",
            "password": "password",
            "publishFrequency": 60,
            "topic": "tele/onewire",
            "debug": false
        }`;
        const fsMock = { readFileSync: sinon.fake(() => settingsJson) };

        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        fsMock.readFileSync.should.have.been.calledWith(path.join(__dirname, '../settings.json'));
        expect(configRewired.config.server).to.equal('192.168.0.1');
        expect(configRewired.config.username).to.equal('someusername');
        expect(configRewired.config.password).to.equal('password');
        expect(configRewired.config.publishFrequency).to.equal(60)
        expect(configRewired.config.topic).to.equal('tele/onewire')
        expect(configRewired.config.debug).to.equal(false);
    });

    it('should load enable logging', function() {
        const settingsJson = `{
            "debug": true
        }`;
        const fsMock = { readFileSync: sinon.fake(() => settingsJson) };

        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        fsMock.readFileSync.should.have.been.calledWith(path.join(__dirname, '../settings.json'));
        expect(configRewired.config.debug).to.equal(true);
    });

    it('should error when no settings found', function() {
        const fsMock = { readFileSync: sinon.fake(() => { throw { code: 'ENOENT' }; }) };

        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        expect(configRewired.config.loadError).to.equal(true);
    });

    it ('should hide password', function() {
        const settingsJson = `{
            "debug": true,
            "password": "secret"
        }`;

        const consoleLogSpy = sinon.spy(console, 'log');
        const fsMock = { readFileSync: sinon.fake(() => settingsJson) };
        const configRewired = rewiremock.proxy('../config', () => ({
            'fs': fsMock
        }));
        
        expect(consoleLogSpy.args[1][0]).to.contain('******');
        expect(configRewired.config.password).to.equal('secret');
        
        consoleLogSpy.restore();
    });

});