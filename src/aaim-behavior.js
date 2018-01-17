/*
 * Copyright (C) 2017 Fraunhofer IAO
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the Clear BSD license.  See the LICENSE file for details.
 */

/**
 * The AAIMBehavior serves as the central coordinator of the system's behavior 
 * on state changes and transitions.
 * 
 * @param {SituationFactory} situationFactory
 *    The SituationFactory instance to use for the creation of situations 
 *    configured in state configurations.
 * @param {AAIMService} defaultService
 *    The AAIMService instance to use for method calls without a service name
 *    specified, may be undefined.
 */
export default class AAIMBehavior {
  constructor(situationFactory, defaultService) {
    /** 
     * The SituationFactory
     * @private
     */
    this._factory = situationFactory;
    
    /** 
     * Registered services
     * @private
     */
    this._services = new Map();
    if (defaultService) {
      this._services.set('', defaultService);
    }
    
    /** 
     * The data context
     * @private
     */
    this._data = new Map();
    
    /** 
     * The last executed state configuration
     * @private
     */
    this._currentConfig = undefined;
  }
  
  /**
   * Executes a state configuration
   *  
   * @param {AAIM.StateBehavior} config
   *    The state configuration object
   * 
   * @throws {Error} If the given state configuration can not be executed due to an error.
   */
  executeState(config) {
    let situationParameters;
    
    if (Array.isArray(config.parameters)) {
      // List of parameter values
      situationParameters = Promise.resolve(this._resolveParameters(config.parameters));

    } else if (typeof config.parameters === "object") {
      // Service call configuration
      situationParameters = this._callService(config.parameters);

    } else {
      situationParameters = Promise.resolve([]);
    }

    situationParameters.then((result) => {
      if (this._currentConfig === config) {
        // Refresh current situation with identical configuration
        this._factory.refresh(config.situation, result, this._data);

      } else {
        // Create new situation for new configuration
        this._factory.create(config.situation, result, this._data);
              
        // Store config
        this._currentConfig = config;
      }
    });
    
  }

  /**
   * Executes a transition configuration
   * 
   * @param {AAIM.ServiceCall} config
   *    The transition configuration object
   * 
   * @returns {Promise} A Promise to the result of the executed transition.
   */
  executeTransition(config) {
    if (typeof config === "object") {
      // Service call configuration
      return this._callService(config);
    }
    return Promise.resolve();
  }
	
  /**
   * Registers a service with a given name.
   * 
   * @param {String} name
   *    The non-empty name under which the service should be registered.
   * @param {AAIMService} service
   *    The actual service implementation to register.
   * 
   * @throws {Error} If name is empty or already taken or service seems not 
   *    to be a valid {@link AAIMService} implementation.
   */
  registerService(name, service) {
    if(!name || name.length < 1) {
      throw new Error("A service cannot be registered without a name.");
    } else if (!service || typeof service.execute !== "function") {
      throw new Error("Services are required to provide an 'execute' function.");
    } else if (this._services.has(name)) {
      throw new Error(`There is already a service named '${name}'.`);
    }
    
    this._services.set(name, service);
  }
	
  /**
   * Resolves the given array of parameter values and parameter references 
   * into an array of values.
   * 
   * @protected
   * 
   * @param {Array} parameters
   *    The parameter array to resolve.
   * 
   * @returns {Array} The array of resolved values.
   */
  _resolveParameters(parameters) {
    let varPattern = /\${(?:(\w+)|([\w\.]+))}/;
    let resolved = parameters.map(function(param) {
      let match = varPattern.exec(param);
      
      if (match !== null && match[1] !== undefined) {
        return this._data.get(match[1]);
        
      } else if (match !== null && match[2] !== undefined) {
        let steps = match[2].split(".");
        let val = this._data.get(steps[0]);
        for (let i=1; typeof val == "object" && i<steps.length; i++) {
          val = val[steps[i]];
        }
        return val;
        
      } else {
        return param;
      }
    }, this);
    return resolved;
  }

  /**
   * Performs a service call according to a given configuration object including
   * resolving or fetching parameters and mapping parameters and the result.
   * 
   * @protected
   * 
   * @param {AAIM.ServiceCall} config
   *    The configuration object of the service call to be performed.
   * @param {Array} defaultParameters
   *    List of parameter values to use, if no parameters are configured.
   * 
   * @returns {Promise} A Promise to the result of the service call.
   * 
   * @throws {Error} If the given configuration is invalid.
   */
  _callService(config, defaultParameters) {
    // Check configuration object
    if (typeof config !== 'object' || config === null) {
      throw new Error('No service configuration object provided!');
    }
    if (config.name === undefined || typeof config.name !== 'string' || config.name.length < 1) {
      throw new Error('Invalid service configuration: \'name\' is required!');
    }
    if (config.service && (typeof config.service !== 'string' || config.service.length < 1)) {
      throw new Error('Invalid service configuration: \'service\' has to be a non-empty string, if defined!');
    }

    // Determine service
    let service = this._services.get(config.service ? config.service : '');
    if (!service) {
      throw new Error('Invalid service configuration: There is no ' +
        (config.service && config.service.length > 0
          ? `service named '${config.service}'!` 
          : 'default service!')
      );
    }
    if (!service.provides(config.name)) {
      throw new Error('Invalid service configuration: ' + 
        (config.service && config.service.length > 0
          ? `Service '${config.service}'`
          : 'Default service') +
        ` does not provide a method '${config.name}'!`
      );
    }

    // Prepare parameters
    let parameters;
    if (Array.isArray(config.parameters)) {
      // List of parameter values or references to the data context
      parameters = Promise.resolve(this._resolveParameters(config.parameters));

    } else if (typeof config.parameters === 'object') {
      // Data acquisition function service call configuration
      parameters = this._callService(config.parameters).then(
        (value) => { return Promise.resolve([ value ]); }
      );

    } else if (Array.isArray(defaultParameters)) {
      // Default parameters provided
      parameters = Promise.resolve(defaultParameters);

    } else {
      // Empty parameters
      parameters = Promise.resolve([]);
    }
    
    // Map parameters
    if (Array.isArray(config.parameterMapping) && config.parameterMapping.length > 0) {
      // One mapping call for each parameter
      parameters = Promise.all(
        config.parameters.map((value, index) => {
          if (typeof config.parameterMapping[index] === 'object' && config.parameterMapping[index] !== null) {
            return this._callService(config.parameterMapping[index], [ value ]);
          } else {
            return value;
          }
        })
      );
      
    } else if (typeof config.parameters === 'object') {
      // TODO: One call for all parameters

    }

    // Perform service call
    let result = parameters.then((values) => {
      return service.execute(config.name, ...values);
    });

    // Map result
    if (typeof config.resultMapping === 'object' && config.resultMapping !== null) {
      result = result.then((value) => { 
        return this._callService(config.resultMapping, [ value ]);
      });
    }

    return result;
  }
}

/**
 * A structured object configuring the behavior in a state.
 * @typedef {Object} AAIM.StateBehavior
 * @property {String} situation 
 *    The name of the situation that will be handed over to the 
 *    {@link SituationFactory}
 * @property {AAIM.Param[]|AAIM.ServiceCall} [parameters]
 *    The parameters to be handed over to the {@link SituationFactory} 
 *    or a call to a service method to fetch those
 * @property {AAIM.ServiceCall[]} [parameterMapping]
 *    Service methods that are called to map the given parameters one 
 *    by one mathed by index. That means, the first parameter handed to 
 *    the first mapping method and so on.
 * 
 * @example
 * {
 *  situation: <situation identifier>,
 *  parameters: [
 *    <parameter value> or <data context reference>, ...
 *  ] or <service call configuration>,
 *  parameterMapping: [
 *    <service call configuration>, ...
 *  ]
 * }
 */

/**
 * A structured object defining a service call to be executed.
 * @typedef {Object} AAIM.ServiceCall
 * @property {String} [service]
 *    The name of the service to call or <code>undefined</code> to use 
 *    the default service
 * @property {String} name
 *    The name of the service method to call
 * @property {AAIM.Param[]|AAIM.ServiceCall} [parameters]
 *    The parameters to be handed over to the specified service method 
 *    or a call to another service method to fetch those
 * @property {AAIM.ServiceCall[]} [parameterMapping]
 *    Service methods that are called to map the given parameters one 
 *    by one mathed by index. That means, the first parameter handed to 
 *    the first mapping method and so on.
 * @property {AAIM.ServiceCall} [resultMapping]
 *    Service method that is called to map the result of this service call.
 * 
 * @example
 * {
 *  service: <name of registered serivce>,
 *  name: <method name>,
 *  parameters: [
 *    <parameter value> or <data context reference>, ...
 *  ] or <service call configuration>,
 *  parameterMapping: [
 *    <service call configuration>, ...
 *  ],
 *  resultMapping: <service call configuration>
 * }
 */

/**
 * A list of parameter values or data context references.
 * The notation of references to the data context uses the style of expressions in 
 * {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals#Expression_interpolation template literals}.
 * 
 * @typedef {Any} AAIM.Param
 *  
 * @example '${foo.bar}' // will be resolved to the value of the "bar" property of the "foo" object in the data context.
 */
