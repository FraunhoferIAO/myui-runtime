/*
 * Copyright (C) 2017 Fraunhofer IAO
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the Clear BSD license.  See the LICENSE file for details.
 */

import AAIMService from 'aaim-service.js';

describe('The AAIM Service', () => {
  let service;

  beforeAll(() => {
    service = new class extends AAIMService {
      constructor() {
        super();

        this._functions.set('primitive', this.primitive);
        this._functions.set('promised', this.promised);
        this._functions.set('thrown', this.thrown);
      }

      primitive(arg) {
        return arg;
      }

      promised(arg) {
        return new Promise(function (resolve, reject) {
          resolve(arg);
        });
      }

      thrown(arg) {
        throw new Error(arg);
      }
    }();
  });

  it('knows which functions it provides', () => {
    // Arrange
    // Act
    // Assert
    expect(service.provides('primitive')).toBeTruthy();
    expect(service.provides('promised')).toBeTruthy();
    expect(service.provides('thrown')).toBeTruthy();
    expect(service.provides('nonexisting')).toBeFalsy();
  });

  describe('returns a promise', () => {
    it('by forwarding returned promises', function (done) {
      // Arrange
      let random = Math.random();

      // Act
      let returned = service.execute('promised', random);

      // Assert
      expect(returned).toEqual(jasmine.any(Promise));
      returned.then(function (val) {
        expect(val).toEqual(random);
        done();
      }, function (err) {
        done.fail('Promise unexpectingly failed.');
      });
    });

    it('by wrapping primitive return values', function (done) {
      // Arrange
      let random = Math.random();

      // Act
      let returned = service.execute('primitive', random);

      // Assert
      expect(returned).toEqual(jasmine.any(Promise));
      returned.then(function (val) {
        expect(val).toEqual(random);
        done();
      }, function (err) {
        done.fail('Promise unexpectingly failed.');
      });
    });

    it('by wrapping thrown errors', function (done) {
      // Arrange
      let random = Math.random();

      // Act
      let returned = service.execute('thrown', random);

      // Assert
      expect(returned).toEqual(jasmine.any(Promise));
      returned.then(function (val) {
        done.fail('Promise unexpectingly resolved.');
      }, function (err) {
        expect(err).toEqual(jasmine.any(Error));
        expect(err.message).toEqual(random.toString());
        done();
      });
    });

    it('but throws an error if the function is not provided', () => {
      // Arrange
      // Act
      // Assert
      expect(() => { service.execute('nonexisting'); }).toThrowError(/not provided/);
    });
  });
});