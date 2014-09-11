'use strict';

describe('Service: liftagoService', function () {

  // load the service's module
  beforeEach(module('rideSharingApp'));

  // instantiate service
  var liftagoService;
  beforeEach(inject(function (_liftagoService_) {
    liftagoService = _liftagoService_;
  }));

  it('should do something', function () {
    expect(!!liftagoService).toBe(true);
  });

});
