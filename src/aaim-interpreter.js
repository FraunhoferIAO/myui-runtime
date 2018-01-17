/*
 * Copyright (C) 2017 Fraunhofer IAO
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the Clear BSD license.  See the LICENSE file for details.
 */

/**
 * The AAIMInterpreter takes an AAIM object and interpretes the state machine it
 * represents. The execution of states and transitions triggered by events is 
 * delegated to an {@link AAIMBehavior}.
 * 
 * @param {AAIMBehavior} behavior
 *    The AAIMBehavior implementation the execution of the application states 
 *    is delegated to.
 */
export default class AAIMInterpreter {
  constructor(behavior) {
    /** 
     * The behavior instance executing state configurations
     * @private
     */
    this._behavior = behavior;
    
    /** 
     * The running state of the interpreter
     * @private
     */
    this._running = false;
    
    /** 
     * The currently loaded AAIM
     * @private
     */
    this._currentAAIM = undefined;
    
    /**
     * The current state
     * @private
     */
    this._currentState = undefined;
    
    /** 
     * The states of the current AAIM mapped by their names
     * @private
     */
    this._loadedStates = undefined;
	}

  /**
   * Returns if the interpreter is currently running.
   * 
   * @return {Boolean} true, if the interpreter is running, false otherwise
   */
  get running() {
    return this._running;
  }
  
  /**
   * Sets the interpreter to run or to pause. The interpreter can only be set
   * to running, if an AAIM is loaded. The interpreter upholds the current state 
   * when getting paused and restarted. To restart the AAIM in its initial state 
   * call {@link AAIMInterpreter#reset} after pausing the interpreter.
   * 
   * @param {Boolean} run
   *    true to run the interpreter, false to pause
   */
  set running(run) {
    if (run && !this._running && this._currentAAIM !== undefined) {
      this._running = true;
      
      // Initial startup?
      if (this._currentState === undefined) { 
        if (typeof this._currentAAIM.initial === "string" 
              && this._loadedStates.has(this._currentAAIM.initial)) {
          this._performTransition(this._loadedStates.get(this._currentAAIM.initial));
        } else {
          // Initial state is not defined or does not exist
          this._running = false;
        }
      }
    } else {
      this._running = false;
    }
  }
  
  /**
   * Returns the currently loaded AAIM.
   * 
   * @return {Object} the currently loaded AAIM or undefined
   */
  get aaim() {
    return this._currentAAIM;
  }
  
  /**
   * Returns the current state of the AAIM.
   * 
   * @return {Object} the current state or undefined
   */
  get state() {
    return this._currentState;
  }
  
  /**
   * Loads an AAIM.
   * 
   * @param {AAIM} aaim
   *    The javascript object representing the AAIM.
   */
  load(aaim) {
    if (!this._running) { // AAIMs can only be replaced while not running
      if (typeof aaim === "object" && aaim !== null // AAIM objects but not null
          && Array.isArray(aaim.states) && aaim.states.length > 0) { // with an non-empty states array
        this._currentAAIM = aaim;
        
        // Create states map
        this._loadedStates = new Map();
        for (let s of this._currentAAIM.states) {
          this._loadedStates.set(s.name, s);
        }
        
        return true;
      }
    }
    return false;
  }
  
  /**
   * Resets a paused interpreter. After the reset the interpreter will be in the
   * same state as directly after loading an AAIM (a.k.a. the initial state).
   * Calls to this method will have no effect if the interpreter is currently
   * running.
   */
  reset() {
    if (!this._running) {
      this._currentState = undefined;
    }
  }
  
  /**
   * Executes an event on the current state of the interpreter by its name. An
   * event name not defined for the current state will have no effect.
   * Calls to this method will have no effect if the interpreter is currently 
   * paused.
   * 
   * @param {String} name
   *    The name of the event so execute
   */
  executeEvent(name) {
    if (this._running) {
      for (let e of this._currentState.events) {
        if (e.on == name && this._loadedStates.has(e.goto)) {
          this._performTransition(this._loadedStates.get(e.goto), e.do);
          break;
        }
      }
    }
  }
  
  /**
   * Actually performs the transition to the given target state by executing the 
   * supplied behavior configuration.
   * 
   * @private
   * 
   * @param {Object} target
   *    The target state to transition to
   * @param {Object} config
   *    The do-configuration of the transition if specified or undefined
   */
  _performTransition(target, config) {
    this._currentState = target;
    
    if (config && this._behavior) {
      this._behavior.executeTransition(config).then(function() {
        this._behavior.executeState(target.do);
      }.bind(this));
    } else if (this._behavior) {
      this._behavior.executeState(target.do);
    }
  }
}

/**
 * A structured object representing an Abstract Application Interaction 
 * Model (AAIM).
 * @typedef {Object} AAIM
 * @property {String} initial
 *    The name of the inital state
 * @property {AAIM.State[]} states
 *    A list of all the states in this AAIM
 * 
 * @example
 * {
 *  initial: <name of initial state>,
 *  states: [
 *    {
 *      name: <name of the state>,
 *      do: <behavior configuration>
 *      events: [
 *        { 
 *          on: <name of event>, 
 *          goto: <name of target state>,
 *          do: <behavior configuration>
 *        }, ...
 *      ]
 *    }, ...
 *  ]
 * }
 */

/**
 * A structured object representing a single state of an AAIM.
 * @typedef {Object} AAIM.State
 * @property {String} name 
 *    The unique name of the state
 * @property {AAIM.StateBehavior} do
 *    An object containing the behavior configuration to be handed over to the 
 *    {@link AAIMBehavior}
 * @property {AAIM.Event[]} events
 *    A list of events triggering transitions
 */

/**
 * A structured object representing a transition triggered by an event.
 * @typedef {Object} AAIM.Event
 * @property {String} name 
 *    The name of the event (unique in its containing state)
 * @property {String} goto
 *    The name of the target state
 * @property {AAIM.ServiceCall} do 
 *    An object containing the behavior configuration to be handed over to the 
 *    {@link AAIMBehavior}
 */
