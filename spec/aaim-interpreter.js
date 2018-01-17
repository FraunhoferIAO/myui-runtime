/*
 * Copyright (C) 2017 Fraunhofer IAO
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the Clear BSD license.  See the LICENSE file for details.
 */

import AAIMInterpreter from 'aaim-interpreter.js';

describe('The AAIM Interpreter', () => {
  let interpreter;
  let aaims = {};
  aaims.simple = {
    initial: 'First',
    states: [
      {
        name: 'Second',
        do: 'NothingSecond',
        events: [
          { on: 'win', goto: 'First' },
          { on: 'loose', goto: 'Third' }
        ]
      },
      {
        name: 'First',
        do: 'NothingFirst',
        events: [
          { on: 'secondarize', goto: 'Second' },
          { on: 'thirdify', goto: 'Third', do: 'NothingOnTheWay' }
        ]
      },
      {
        name: 'Third',
        do: 'NothingThird',
        events: [
          { on: 'top', goto: 'First' }
        ]
      }
    ]
  };
  aaims.empty = {
    initial: 'Init',
    states: []
  };
  aaims.missingInitial = {
    initial: 'Init',
    states: [
      {
        name: 'One'
      }
    ]
  };
  aaims.noInitial = {
    states: [
      {
        name: 'One'
      }
    ]
  };
  aaims.missingTarget = {
    initial: 'Init',
    states: [
      {
        name: 'Init',
        events: [
          { on: 'move', goto: 'Other' }
        ]
      },
      {
        name: 'Different'
      }
    ]
  };


  beforeEach(() => {
    // Create new AAIMInterpreter
    interpreter = new AAIMInterpreter();
  });

  it('is created stopped and clean', () => {
    // Arrange
    // Act
    // Assert
    expect(interpreter.running).toBeFalsy();
    expect(interpreter.aaim).toBeUndefined();
    expect(interpreter.state).toBeUndefined();
  });

  describe('loads AAIMs', () => {
    it('from objects', () => {
      // Arrange
      // Act
      let loaded = interpreter.load(aaims.simple);

      // Assert
      expect(loaded).toBeTruthy();
      expect(interpreter.aaim).toBe(aaims.simple);
    });

    it('not via simply assigning an AAIM', () => {
      // Arrange
      // Act
      let illegalAction = () => {
        interpreter.aaim = aaims.simple;
      };

      // Assert
      expect(illegalAction).toThrowError();
      expect(interpreter.aaim).not.toBe(aaims.simple);
    });

    it('replacing an already loaded AAIM', () => {
      // Arrange
      interpreter.load(aaims.simple);

      // Act
      let loaded = interpreter.load(aaims.missingInitial);

      // Assert
      expect(loaded).toBe(true);
      expect(interpreter.aaim).toBe(aaims.missingInitial);
    });

    it('but not undefined', () => {
      // Arrange
      interpreter.load(aaims.simple);

      // Act
      let loaded = interpreter.load(undefined);

      // Assert
      expect(loaded).toBeFalsy();
      expect(interpreter.aaim).toBe(aaims.simple);
    });

    it('but not null', () => {
      // Arrange
      interpreter.load(aaims.simple);

      // Act
      let loaded = interpreter.load(null);

      // Assert
      expect(loaded).toBeFalsy();
      expect(interpreter.aaim).toBe(aaims.simple);
    });

    it('but not without states', () => {
      // Arrange
      interpreter.load(aaims.simple);

      // Act
      let loaded = interpreter.load(aaims.empty);

      // Assert
      expect(loaded).toBeFalsy();
      expect(interpreter.aaim).toBe(aaims.simple);
    });

    it('but not while running', () => {
      // Arrange
      interpreter.load(aaims.simple);
      interpreter.running = true;

      // Act
      let loaded = interpreter.load(aaims.missingInitial);

      // Assert
      expect(loaded).toBeFalsy();
      expect(interpreter.running).toBeTruthy();
      expect(interpreter.aaim).toBe(aaims.simple);
    });
  });

  describe('starts', () => {
    it('not without loaded AAIM', () => {
      // Arrange
      // Act
      interpreter.running = true;

      // Assert
      expect(interpreter.running).toBeFalsy();
    });

    it('with an loaded AAIM', () => {
      // Arrange
      interpreter.load(aaims.simple);

      // Act
      interpreter.running = true;

      // Assert
      expect(interpreter.running).toBeTruthy();
      expect(interpreter.aaim).toBe(aaims.simple);
    });

    it('into the initial state', () => {
      // Arrange
      interpreter.load(aaims.simple);

      // Act
      interpreter.running = true;

      // Assert
      expect(interpreter.state).toBe(aaims.simple.states[1]);
    });

    it('not when initial state does not exist', () => {
      // Arrange
      interpreter.load(aaims.missingInitial);
      
      // Act
      interpreter.running = true;

      // Assert
      expect(interpreter.running).toBeFalsy();
      expect(interpreter.state).toBeUndefined();
      expect(interpreter.aaim).toBe(aaims.missingInitial);
    });

    it('not when no initial state is defined', () => {
      // Arrange
      interpreter.load(aaims.noInitial);

      // Act
      interpreter.running = true;

      // Assert
      expect(interpreter.running).toBeFalsy();
      expect(interpreter.state).toBeUndefined();
      expect(interpreter.aaim).toBe(aaims.noInitial);
    });

    it('and can be paused', () => {
      // Arrange
      interpreter.load(aaims.simple);
      interpreter.running = true;

      // Act
      interpreter.running = false;

      // Assert
      expect(interpreter.running).toBeFalsy();
      expect(interpreter.state).toBe(aaims.simple.states[1]);
    });

    it('into the previous state after beeing paused', () => {
      // Arrange
      interpreter.load(aaims.simple);
      interpreter.running = true;
      interpreter.executeEvent('secondarize');
      let prevState = interpreter.state;
      interpreter.running = false;

      // Act
      interpreter.running = true;

      // Assert
      expect(interpreter.state).toBe(prevState);
    });

    it('and can be reset when paused', () => {
      // Arrange
      interpreter.load(aaims.simple);
      interpreter.running = true;
      expect(interpreter.state).not.toBeUndefined();
      interpreter.running = false;

      // Act
      interpreter.reset();

      // Assert
      expect(interpreter.state).toBeUndefined();
    });

    it('and cannot be reset while running', () => {
      // Arrange
      interpreter.load(aaims.simple);
      interpreter.running = true;
      interpreter.executeEvent('secondarize');
      let prevState = interpreter.state;

      // Act
      interpreter.reset();

      // Assert
      expect(interpreter.state).toBe(prevState);
    });

    it('again into initial state after beeing reset', () => {
      // Arrange
      interpreter.load(aaims.simple);
      interpreter.running = true;
      interpreter.executeEvent('secondarize');
      interpreter.running = false;
      interpreter.reset();

      // Act
      interpreter.running = true;

      // Assert
      expect(interpreter.state).toBe(aaims.simple.states[1]);
    });
  });

  describe('executes transitions', () => {
    let prevState;

    beforeEach(() => {
      // Set up AaimInterpreter with loaded AAIM
      interpreter.load(aaims.simple);
      interpreter.running = true;
      prevState = interpreter.state;
    });

    it('to defined states in the same AAIM', () => {
      // Arrange
      // Act
      interpreter.executeEvent('secondarize');

      // Assert
      expect(interpreter.state).not.toBe(prevState);
      expect(interpreter.state).toBe(aaims.simple.states[0]);
    });

    it('but does not change the state on undefined events', () => {
      // Arrange
      // Act
      interpreter.executeEvent('nonexisting');

      // Assert
      expect(interpreter.state).toBe(prevState);
    });

    it('only on events of the current state', () => {
      // Arrange
      // Act
      interpreter.executeEvent('loose');

      // Assert
      expect(interpreter.state).toBe(prevState);
    });

    it('but not to missing states', () => {
      // Arrange
      interpreter.running = false;
      interpreter.load(aaims.missingTarget);
      interpreter.running = true;
      prevState = interpreter.state;

      // Act
      interpreter.executeEvent('move');

      // Assert
      expect(interpreter.state).toBe(prevState);
    });

    it('only when running', () => {
      // Arrange
      interpreter.running = false;

      // Act
      interpreter.executeEvent('secondarize');

      // Assert
      expect(interpreter.state).toBe(prevState);
    });
  });

  describe('calls the behavior', () => {
    let behavior;

    beforeEach(() => {
      // Set up behavior spy
      behavior = {
        executeState: jasmine.createSpy('executeState'),
        executeTransition: jasmine.createSpy('executeTransition').and.returnValue(Promise.resolve())
      };

      // Set up AaimInterpreter with loaded AAIM
      interpreter = new AAIMInterpreter(behavior);
      interpreter.load(aaims.simple);
    });

    it('of the initial state on startup', () => {
      // Arrange
      // Act
      interpreter.running = true;

      // Assert
      expect(behavior.executeState).toHaveBeenCalledWith('NothingFirst');
    });

    it('of the target state on transitions without behavior', () => {
      // Arrange
      interpreter.running = true;
      behavior.executeState.calls.reset();

      // Act
      interpreter.executeEvent('secondarize');

      // Assert
      expect(behavior.executeState).toHaveBeenCalledWith('NothingSecond');
    });

    it('of the transition and the target state on transitions with behavior', (done) => {
      // Arrange
      interpreter.running = true;
      behavior.executeState.calls.reset();
      
      // Act
      interpreter.executeEvent('thirdify');
      
      // Assert
      setTimeout(() => {
        expect(behavior.executeTransition).toHaveBeenCalledWith('NothingOnTheWay');
        expect(behavior.executeState).toHaveBeenCalledWith('NothingThird');
        done();
      }, 10);
    });
  });
});