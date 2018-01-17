/*
 * Copyright (C) 2017 Fraunhofer IAO
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the Clear BSD license.  See the LICENSE file for details.
 */

/**
 * 
 */
export default class SituationFactory {
  
  /**
   * Creates a new SituationFactory
   */
  constructor() {
    
  }
  
  /**
   * 
   * 
   * @abstract
   * 
   * @param {String} situation
   * @param {Any[]} parameters
   * @param {Map} context
   */
  create(situation, parameters, context) {
    
  }
  
  /**
   * 
   * 
   * @abstract
   * 
   * @param {String} situation
   * @param {Any[]} parameters
   * @param {Map} context
   */
  refresh(situation, parameters, context) {
    
  }
}
