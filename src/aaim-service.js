/*
 * Copyright (C) 2017 Fraunhofer IAO
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the Clear BSD license.  See the LICENSE file for details.
 */

/**
 * AAIMService serves as a base class for the implementation of configurable 
 * services that can be used in {@link AAIM} do-configurations.
 */
export default class AAIMService {
  constructor() {
    /** 
     * Provided methods by name
     * @protected
     */
    this._functions = new Map();
  }
  
  /**
   * Calls a function by its name applying the provided parameters.
   * 
   * @param {String} method
   *    The name of the method to call.
   * @param {Array} params
   *    The parameters to call the function with.
   * 
   * @returns {Promise} A promise to the result of the function call
   * @throws {Error} If no function with the requested name is provided by this service.
   */
  execute(method, ...params) {
    // Check if function exists
    if (!this._functions.has(method)) {
      throw new Error(`Function '${method}' is not provided by this service.`);
    }
    
    // Execute function with given params
    let val;
    try {
      // Actualy execute function
      val = this._functions.get(method).apply(this, params);
      
      if (val instanceof Promise) {
        // Forward returned promise
        return val;
      } else {
        // Wrap non-promise return values into promise
        return new Promise(function(resolve, reject) {
          resolve(val);
        });
      }
    } catch(e) {
      // On error, return immediatly rejecting promise
      return new Promise(function(resolve, reject) {
        reject(e);
      });
    }
  }
  
  /**
   * Checks if a function is provided by this service.
   * 
   * @param {String} method
   *    The name of the method to check.
   * 
   * @returns {Boolean} true if a method with the given name is provided by this service, false otherwise.
   */
  provides(method) {
    return this._functions.has(method);
  }
}
