/*
 * Copyright (C) 2017 Fraunhofer IAO
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the Clear BSD license.  See the LICENSE file for details.
 */

import AAIMBehavior from 'aaim-behavior.js';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('The AAIM Behavior', () => {
  let behavior;

  describe('registers services', () => {
    let service;

    beforeEach(() => {
      behavior = new AAIMBehavior();
      service = new class {
        execute(name, ...params) { }
        provides(method) { }
      }();
    });

    it('under a specified name', () => {
      // Arrange
      // Act
      behavior.registerService('fancy', service);

      // Assert
      expect(behavior._services.get('fancy')).toBe(service);
    });

    it('but not without a name', () => {
      // Arrange
      // Act
      let illegalAction = () => {
        behavior.registerService(null, service);
      };

      // Assert
      expect(illegalAction).toThrow();
    });

    it('but not with an empty name', () => {
      // Arrange
      // Act
      let illegalAction = () => {
        behavior.registerService('', service);
      };

      // Assert
      expect(illegalAction).toThrow();
    });

    it('but not if name is already taken', () => {
      // Arrange
      let other = new class {
        execute(name, ...params) {
        }
      }();
      behavior.registerService('fancy', service);

      // Act
      let illegalAction = () => {
        behavior.registerService('fancy', other);
      };

      // Assert
      expect(illegalAction).toThrow();
      expect(behavior._services.get('fancy')).toBe(service);
    });

    it('but not without an \'execute\' function', () => {
      // Arrange
      let illegalService = new class {
        provides(method) { }
      }();

      // Act
      let illegalAction = () => {
        behavior.registerService('illegal', illegalService);
      };

      // Assert
      expect(illegalAction).toThrow();
      expect(behavior._services.has('illegal')).toBeFalsy();
    });
  });

  describe('executes state configurations', () => {
    let factory;

    beforeEach(() => {
      factory = new class {
        create(situation, parameters, context) { }
        refresh(situation, parameters, context) { }
      }();
      spyOn(factory, 'create');
      spyOn(factory, 'refresh');

      behavior = new AAIMBehavior(factory);
    });

    it('without configured parameters', (done) => {
      // Arrange
      // Act
      behavior.executeState({
        situation: 'SomeSituation'
      });

      // Assert
      setTimeout(() => {
        expect(factory.create).toHaveBeenCalledWith('SomeSituation', [], jasmine.any(Map));
        done();
      }, 10);
    });

    it('resolving a parameter list', (done) => {
      // Arrange
      behavior._data.set('name', 'some Value');

      // Act
      behavior.executeState({
        situation: 'SomeSituation',
        parameters: [
          'anyParam',
          42,
          '${name}'
        ]
      });

      // Assert
      setTimeout(() => {
        expect(factory.create).toHaveBeenCalledWith('SomeSituation', ['anyParam', 42, 'some Value'], jasmine.any(Map));
        done();
      }, 10);
    });

    it('calling a default service\'s method as data aquisition function', (done) => {
      // Arrange
      let service = new class {
        execute(method, ...params) { }
        provides(method) { }
      }();
      spyOn(service, 'execute').and.returnValue(Promise.resolve(42));
      spyOn(service, 'provides').and.returnValue(true);
      behavior = new AAIMBehavior(factory, service);

      // Act
      behavior.executeState({
        situation: 'SomeSituation',
        parameters: {
          name: 'theMethod',
          parameters: [
            'anyParam',
            42
          ]
        }
      });

      // Assert
      setTimeout(() => {
        expect(service.execute).toHaveBeenCalledWith('theMethod', 'anyParam', 42);
        expect(factory.create).toHaveBeenCalledWith('SomeSituation', 42, new Map());
        done();
      }, 10);
    });

    it('calling a service method with resolved parameters', (done) => {
      // Arrange
      let service = new class {
        execute(method, ...params) { }
        provides(method) { }
      }();
      spyOn(service, 'execute').and.returnValue(Promise.resolve(42));
      spyOn(service, 'provides').and.returnValue(true);
      behavior = new AAIMBehavior(factory, service);
      behavior._data.set('name', 'some Value');

      // Act
      behavior.executeState({
        situation: 'SomeSituation',
        parameters: {
          name: 'theMethod',
          parameters: [
            'anyParam',
            42,
            '${name}'
          ]
        }
      });

      // Assert
      setTimeout(() => {
        expect(service.execute).toHaveBeenCalledWith('theMethod', 'anyParam', 42, 'some Value');
        expect(factory.create).toHaveBeenCalledWith('SomeSituation', 42, jasmine.any(Map));
        done();
      }, 10);
    });

    it('but throws an error if no default service is configured', () => {
      // Arrange
      // Act
      let illegalAction = () => {
        behavior.executeState({
          situation: 'SomeSituation',
          parameters: {
            name: 'theMethod',
            parameters: [
              'anyParam',
              42,
              '${name}'
            ]
          }
        });
      };

      // Assert
      expect(illegalAction).toThrowError();
    });

    it('but throws an error if service does not provide a method with the given name', () => {
      // Arrange
      // Act
      let illegalAction = () => {
        behavior.executeState({
          situation: 'SomeSituation',
          parameters: {
            name: 'notTheMethod',
            parameters: [
              'anyParam',
              42,
              '${name}'
            ]
          }
        });
      };

      // Assert
      expect(illegalAction).toThrowError();
    });

    it('calling a configured service\'s method as data aquisition function', (done) => {
      // Arrange
      let namedservice = new class {
        execute(method, ...params) { }
        provides(method) { }
      }();
      spyOn(namedservice, 'execute').and.returnValue(Promise.resolve(42));
      spyOn(namedservice, 'provides').and.returnValue(true);
      behavior.registerService('TheName', namedservice);

      // Act
      behavior.executeState({
        situation: 'SomeSituation',
        parameters: {
          service: 'TheName',
          name: 'theMethod',
          parameters: [
            'anyParam',
            42
          ]
        }
      });

      // Assert
      setTimeout(() => {
        expect(namedservice.execute).toHaveBeenCalledWith('theMethod', 'anyParam', 42);
        expect(factory.create).toHaveBeenCalledWith('SomeSituation', 42, new Map());
        done();
      }, 10);
    });

    it('but throws an error if no service is configured under the given name', () => {
      // Arrange
      // Act
      let illegalAction = () => {
        behavior.executeState({
          situation: 'SomeSituation',
          parameters: {
            service: 'TheName',
            name: 'theMethod',
            parameters: [
              'anyParam',
              42
            ]
          }
        });
      };

      // Assert
      expect(illegalAction).toThrowError();
    });

    it('mapping the returned result using a configured service method', (done) => {
      // Arrange
      let namedservice = new class {
        execute(method, ...params) { }
        provides(method) { }
      }();
      spyOn(namedservice, 'execute').and.returnValues(Promise.resolve(42), Promise.resolve('Towel'));
      spyOn(namedservice, 'provides').and.returnValue(true);
      behavior.registerService('TheName', namedservice);

      // Act
      behavior.executeState({
        situation: 'SomeSituation',
        parameters: {
          service: 'TheName',
          name: 'theMethod',
          resultMapping: {
            service: 'TheName',
            name: 'mappingMethod'
          }
        }
      });

      // Assert
      setTimeout(() => {
        expect(namedservice.execute).toHaveBeenCalledWith('theMethod');
        expect(namedservice.execute).toHaveBeenCalledWith('mappingMethod', 42);
        expect(factory.create).toHaveBeenCalledWith('SomeSituation', 'Towel', new Map());
        done();
      }, 10);
    });

    it('refreshing the current state if it is identically configured', (done) => {
      // Arrange
      const config = {
        situation: 'SomeSituation',
        parameters: [
          'anyParam',
          42,
          '${name}'
        ]
      };
      behavior._data.set('name', 'some Value');
      behavior.executeState(config);
      setTimeout(() => {
        behavior._data.set('name', 'some other Value');
        factory.create.calls.reset();
  
        // Act
        behavior.executeState(config);
  
        // Assert
        setTimeout(() => {
          expect(factory.refresh).toHaveBeenCalledWith('SomeSituation', ['anyParam', 42, 'some other Value'], jasmine.any(Map));
          expect(factory.create).not.toHaveBeenCalled();
          done();
        }, 10);
      }, 10);
    });
  });

  describe('executes transition configurations', () => {
    const SERVICE_NAME = 'TheName';
    let defaultService, namedService;
    
    beforeEach(() => {
      defaultService = new class {
        execute(method, ...params) { }
        provides(method) { }
      }();
      spyOn(defaultService, 'execute').and.returnValues(Promise.resolve(42), Promise.resolve(21));
      spyOn(defaultService, 'provides').and.returnValue(true);
      behavior = new AAIMBehavior(null, defaultService);
      namedService = new class {
        execute(method, ...params) { }
        provides(method) { }
      }();
      spyOn(namedService, 'execute').and.returnValues(Promise.resolve('Towel'), Promise.resolve('Guide'));
      spyOn(namedService, 'provides').and.returnValue(true);
      behavior.registerService(SERVICE_NAME, namedService);
    });

    it('calling a default service\'s method', (done) => {
      // Arrange
      // Act
      behavior.executeTransition({
        name: 'defaultMethod',
        parameters: [ 1 ]
      });

      // Assert
      setTimeout(() => {
        expect(defaultService.execute).toHaveBeenCalledWith('defaultMethod', 1);
        done();
      }, 10);
    });

    it('calling a named service\'s method', (done) => {
      // Arrange
      // Act
      behavior.executeTransition({
        service: SERVICE_NAME,
        name: 'theMethod',
        parameters: [ 2 ]
      });

      // Assert
      setTimeout(() => {
        expect(namedService.execute).toHaveBeenCalledWith('theMethod', 2);
        done();
      }, 10);
    });

    it('with resolved parameters', (done) => {
      // Arrange
      behavior._data.set('name', 'some Value');

      // Act
      behavior.executeTransition({
        name: 'defaultMethod',
        parameters: [ 1, '${name}', 3 ]
      });

      // Assert
      setTimeout(() => {
        expect(defaultService.execute).toHaveBeenCalledWith('defaultMethod', 1, 'some Value', 3);
        done();
      }, 10);
    });

    it('with mapped parameters', (done) => {
      // Arrange
      // Act
      behavior.executeTransition({
        name: 'defaultMethod',
        parameters: [ 1 , 2 , 3 ],
        parameterMapping: [
          {
            service: SERVICE_NAME,
            name: 'p1mapper'
          },
          {
            service: SERVICE_NAME,
            name: 'p2mapper'
          }
        ]
      });

      // Assert
      setTimeout(() => {
        expect(namedService.execute).toHaveBeenCalledWith('p1mapper', 1);
        expect(namedService.execute).toHaveBeenCalledWith('p2mapper', 2);
        expect(defaultService.execute).toHaveBeenCalledWith('defaultMethod', 'Towel', 'Guide', 3);
        done();
      }, 10);
    });

    it('with parameters fetched from another service method', (done) => {
      // Arrange
      // Act
      behavior.executeTransition({
        name: 'defaultMethod',
        parameters: {
          name: 'paramMethod',
          parameters: [ 'foo' ]
        }
      });

      // Assert
      setTimeout(() => {
        expect(defaultService.execute).toHaveBeenCalledWith('paramMethod', 'foo');
        expect(defaultService.execute).toHaveBeenCalledWith('defaultMethod', 42);
        done();
      }, 10);
    });

    it('returns a promise', () => {
      // Arrange
      // Act
      let value = behavior.executeTransition({
        name: 'defaultMethod',
        parameters: [ 1 ]
      });

      // Assert
      expect(value).toEqual(jasmine.any(Promise));
    });
  });

  /* 
   * ------------------------------------------------------------------------ *
   * Testing internal functions, public API may still work if these fail...   *
   * ------------------------------------------------------------------------ *
   */
  describe('[internally]', () => {
    describe('resolves parameters', () => {
      beforeAll(() => {
        behavior = new AAIMBehavior(null);
        behavior._data.set('name', 'Just A. String');
        behavior._data.set('age', 42);
        behavior._data.set('flag', true);
        behavior._data.set('complex', { part: 1, value: 'Some' });
        behavior._data.set('list', [0, 8, 15]);
        behavior._data.set('deep', { first: { sec: { val: 42 } } });
      });

      it('keeping the defined order', () => {
        let result = behavior._resolveParameters(['${name}', '${flag}', '${age}']);

        expect(result).toEqual(['Just A. String', true, 42]);
      });

      it('preserving literal values', () => {
        let result = behavior._resolveParameters(['name', '${age}', 'age', '${name}', 42, false]);

        expect(result).toEqual(['name', 42, 'age', 'Just A. String', 42, false]);
      });

      it('to undefined, if not contained in data context', () => {
        let result = behavior._resolveParameters(['${name}', '${notthere}', '${age}']);

        expect(result).toEqual(['Just A. String', undefined, 42]);
      });

      it('to arrays', () => {
        let result = behavior._resolveParameters(['${list}']);

        expect(result).toEqual([[0, 8, 15]]);
      });

      it('to values of arrays', () => {
        let result = behavior._resolveParameters(['${list.2}']);

        expect(result).toEqual([15]);
      });

      it('to objects', () => {
        let result = behavior._resolveParameters(['${complex}']);

        expect(result).toEqual([{ part: 1, value: 'Some' }]);
      });

      it('to properties of objects', () => {
        let result = behavior._resolveParameters(['${deep.first.sec.val}', '${deep.first}']);

        expect(result).toEqual([42, { sec: { val: 42 } }]);
      });
    });
  });
});