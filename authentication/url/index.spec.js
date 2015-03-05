'use strict';

var expect = require('chai').expect;
var _ = require('lodash');
var sinon = require('sinon');
var Escher = require('escher-auth');
var SuiteSignedUrlAuthenticator = require('./');


describe('Suite API authentication', function() {

  var fakeEscher;

  beforeEach(function() {
    fakeEscher = { authenticate: sinon.stub() };
    this.sandbox.stub(Escher, 'create').returns(fakeEscher);
  });


  it('should authenticate through escher with request', function() {
    var suiteSignedUrlAuthenticator = new SuiteSignedUrlAuthenticator({
      credentialScope: 'testCredentialScope',
      escherSecret: 'testEscherSecret'
    });

    suiteSignedUrlAuthenticator.authenticate('testUrl', 'testHost');

    expect(Escher.create).to.have.been.calledWith({
      credentialScope: 'testCredentialScope',
      vendorKey: 'EMS',
      algoPrefix: 'EMS'
    });

    expect(fakeEscher.authenticate).to.have.been.calledWith({
      method: 'GET',
      url: 'testUrl',
      headers: [
        ['Host', 'testHost']
      ]
    });
  });


  it('should authenticate through escher with keyDb', function() {
    var suiteSignedUrlAuthenticator = new SuiteSignedUrlAuthenticator({
      credentialScope: 'testCredentialScope',
      escherSecret: 'testEscherSecret'
    });

    suiteSignedUrlAuthenticator.authenticate('testUrl', 'testHost');

    expect(fakeEscher.authenticate.lastCall.args[1]()).to.eql('testEscherSecret');
  });


  it('should thrown an error if escher auth fails', function(done) {
    fakeEscher.authenticate.throws();

    var suiteSignedUrlAuthenticator = new SuiteSignedUrlAuthenticator({
      credentialScope: 'testCredentialScope',
      escherSecret: 'testEscherSecret'
    });

    try{
      suiteSignedUrlAuthenticator.authenticate('testUrl', 'testHost');
    } catch (ex) {
      expect(ex).to.eql(new Error('Escher authentication'));
      done();
    }
  });


  describe('without options', function() {

    beforeEach(function() {
      process.env.SUITE_ESCHER_SECRET = 'testEscherSecretFromEnv';
      process.env.SUITE_ESCHER_CREDENTIAL_SCOPE = 'testEscherCredentialScoperFromEnv';
    });

    afterEach(function() {
      delete process.env.SUITE_ESCHER_SECRET;
      delete process.env.SUITE_ESCHER_CREDENTIAL_SCOPE;
    });


    it('should use credential scope from environment variable', function() {
      var suiteSignedUrlAuthenticator = new SuiteSignedUrlAuthenticator();

      suiteSignedUrlAuthenticator.authenticate('testUrl', 'testHost');

      expect(Escher.create).to.have.been.calledWith({
        credentialScope: 'testEscherCredentialScoperFromEnv',
        vendorKey: 'EMS',
        algoPrefix: 'EMS'
      });
    });


    it('should use secret from environment variable', function() {
      var suiteSignedUrlAuthenticator = new SuiteSignedUrlAuthenticator();

      suiteSignedUrlAuthenticator.authenticate('testUrl', 'testHost');

      expect(fakeEscher.authenticate.lastCall.args[1]()).to.eql('testEscherSecretFromEnv');
    });

  });

});