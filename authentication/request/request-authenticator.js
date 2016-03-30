'use strict';

var Escher = require('escher-auth');
var KeyPool = require('escher-keypool');


var RequestAuthenticator = function(config, context) {
  if (!(this instanceof RequestAuthenticator)) {
    return new RequestAuthenticator(config, context);
  }
    this._escher = Escher.create({
      algoPrefix: 'EMS',
      vendorKey: 'EMS',
      authHeaderName: 'X-EMS-Auth',
      dateHeaderName: 'X-EMS-Date',
      credentialScope: config.credentialScope
    });

    this._config = config;
    this._context = context;
  }


  RequestAuthenticator.prototype.authenticate = function() {
    this._escher.authenticate(this._getRequest(), this._getKeyDb());
  };


  RequestAuthenticator.prototype._getRequest = function() {
    var request = this._context.req;

    if (this._hasRequestBody()) {
      request.body = JSON.stringify(this._context.request.body);
    }

    return request;
  }


  RequestAuthenticator.prototype._hasRequestBody= function() {
    return Object.keys(this._context.request.body).length > 0;
  }


  RequestAuthenticator.prototype._getKeyDb = function() {
    if (this._config.keyPool) {
      return KeyPool.create(this._config.keyPool).getKeyDb();
    }
    return function() {};
  }

}


module.exports = RequestAuthenticator;
