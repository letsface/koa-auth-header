"use strict";

var _ = require('lodash');



module.exports = function (options) {
  options = _.defaults(options || {}, {
    required: true
  });

  var types = {
    Bearer: function(value) {
      this.request.token = value;
    }
  };

  return function* (next) {
    var header = this.request.header;
    if (typeof header === "undefined" || (typeof header !== "undefined" && typeof header.authorization === "undefined")) {
      if (options.required === true) {
        this.throw(401, 'Authorization header required');
      }

      yield next;
      return;
    }

    var parts = header.authorization.split(':');
    parts = parts.map((value) => {return value.trim()});

    if (parts.length === 2 && _.has(types, parts[0])) {
      // call the corresponding function for the type of authorization
      types[parts[0]].apply(this, [parts[1]]);
      yield next;
      return;
    }

    this.throw(401, 'Authorization header not supported');
  };
};
