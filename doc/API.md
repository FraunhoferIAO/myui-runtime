<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## AAIMBehavior

The AAIMBehavior serves as the central coordinator of the system's behavior 
on state changes and transitions.

**Parameters**

-   `situationFactory` **[SituationFactory](#situationfactory)** The SituationFactory instance to use for the creation of situations 
       configured in state configurations.
-   `defaultService` **[AAIMService](#aaimservice)** The AAIMService instance to use for method calls without a service name
       specified, may be undefined.

### executeState

Executes a state configuration

**Parameters**

-   `config` **[AAIM.StateBehavior](#aaimstatebehavior)** The state configuration object


-   Throws **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** If the given state configuration can not be executed due to an error.

### executeTransition

Executes a transition configuration

**Parameters**

-   `config` **[AAIM.ServiceCall](#aaimservicecall)** The transition configuration object

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** A Promise to the result of the executed transition.

### registerService

Registers a service with a given name.

**Parameters**

-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The non-empty name under which the service should be registered.
-   `service` **[AAIMService](#aaimservice)** The actual service implementation to register.


-   Throws **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** If name is empty or already taken or service seems not 
       to be a valid [AAIMService](#aaimservice) implementation.

### \_resolveParameters

Resolves the given array of parameter values and parameter references 
into an array of values.

**Parameters**

-   `parameters` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** The parameter array to resolve.

Returns **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** The array of resolved values.

### \_callService

Performs a service call according to a given configuration object including
resolving or fetching parameters and mapping parameters and the result.

**Parameters**

-   `config` **[AAIM.ServiceCall](#aaimservicecall)** The configuration object of the service call to be performed.
-   `defaultParameters` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** List of parameter values to use, if no parameters are configured.


-   Throws **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** If the given configuration is invalid.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** A Promise to the result of the service call.

## AAIM.ServiceCall

A structured object defining a service call to be executed.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `service` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The name of the service to call or <code>undefined</code> to use 
       the default service
-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the service method to call
-   `parameters` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[AAIM.Param](#aaimparam)> | [AAIM.ServiceCall](#aaimservicecall))?** The parameters to be handed over to the specified service method 
       or a call to another service method to fetch those
-   `parameterMapping` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[AAIM.ServiceCall](#aaimservicecall)>?** Service methods that are called to map the given parameters one 
       by one mathed by index. That means, the first parameter handed to 
       the first mapping method and so on.
-   `resultMapping` **[AAIM.ServiceCall](#aaimservicecall)?** Service method that is called to map the result of this service call.

**Examples**

```javascript
{
 service: <name of registered serivce>,
 name: <method name>,
 parameters: [
   <parameter value> or <data context reference>, ...
 ] or <service call configuration>,
 parameterMapping: [
   <service call configuration>, ...
 ],
 resultMapping: <service call configuration>
}
```

## AAIM.StateBehavior

A structured object configuring the behavior in a state.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `situation` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the situation that will be handed over to the 
       [SituationFactory](#situationfactory)
-   `parameters` **([Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[AAIM.Param](#aaimparam)> | [AAIM.ServiceCall](#aaimservicecall))?** The parameters to be handed over to the [SituationFactory](#situationfactory) 
       or a call to a service method to fetch those
-   `parameterMapping` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[AAIM.ServiceCall](#aaimservicecall)>?** Service methods that are called to map the given parameters one 
       by one mathed by index. That means, the first parameter handed to 
       the first mapping method and so on.

**Examples**

```javascript
{
 situation: <situation identifier>,
 parameters: [
   <parameter value> or <data context reference>, ...
 ] or <service call configuration>,
 parameterMapping: [
   <service call configuration>, ...
 ]
}
```

## AAIM.Param

A list of parameter values or data context references.
The notation of references to the data context uses the style of expressions in 
[template literals](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals#Expression_interpolation).

Type: Any

**Examples**

```javascript
'${foo.bar}' // will be resolved to the value of the "bar" property of the "foo" object in the data context.
```

## AAIM

A structured object representing an Abstract Application Interaction 
Model (AAIM).

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `initial` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the inital state
-   `states` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[AAIM.State](#aaimstate)>** A list of all the states in this AAIM

**Examples**

```javascript
{
 initial: <name of initial state>,
 states: [
   {
     name: <name of the state>,
     do: <behavior configuration>
     events: [
       { 
         on: <name of event>, 
         goto: <name of target state>,
         do: <behavior configuration>
       }, ...
     ]
   }, ...
 ]
}
```

## AAIMInterpreter

The AAIMInterpreter takes an AAIM object and interpretes the state machine it
represents. The execution of states and transitions triggered by events is 
delegated to an [AAIMBehavior](#aaimbehavior).

**Parameters**

-   `behavior` **[AAIMBehavior](#aaimbehavior)** The AAIMBehavior implementation the execution of the application states 
       is delegated to.

### running

Returns if the interpreter is currently running.

Returns **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true, if the interpreter is running, false otherwise

### running

Sets the interpreter to run or to pause. The interpreter can only be set
to running, if an AAIM is loaded. The interpreter upholds the current state 
when getting paused and restarted. To restart the AAIM in its initial state 
call [AAIMInterpreter#reset](#aaiminterpreterreset) after pausing the interpreter.

**Parameters**

-   `run` **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true to run the interpreter, false to pause

### aaim

Returns the currently loaded AAIM.

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** the currently loaded AAIM or undefined

### state

Returns the current state of the AAIM.

Returns **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** the current state or undefined

### load

Loads an AAIM.

**Parameters**

-   `aaim` **[AAIM](#aaim)** The javascript object representing the AAIM.

### reset

Resets a paused interpreter. After the reset the interpreter will be in the
same state as directly after loading an AAIM (a.k.a. the initial state).
Calls to this method will have no effect if the interpreter is currently
running.

### executeEvent

Executes an event on the current state of the interpreter by its name. An
event name not defined for the current state will have no effect.
Calls to this method will have no effect if the interpreter is currently 
paused.

**Parameters**

-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event so execute

## AAIM.State

A structured object representing a single state of an AAIM.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The unique name of the state
-   `do` **[AAIM.StateBehavior](#aaimstatebehavior)** An object containing the behavior configuration to be handed over to the 
       [AAIMBehavior](#aaimbehavior)
-   `events` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[AAIM.Event](#aaimevent)>** A list of events triggering transitions

## AAIM.Event

A structured object representing a transition triggered by an event.

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

-   `name` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the event (unique in its containing state)
-   `goto` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the target state
-   `do` **[AAIM.ServiceCall](#aaimservicecall)** An object containing the behavior configuration to be handed over to the 
       [AAIMBehavior](#aaimbehavior)

## AAIMService

AAIMService serves as a base class for the implementation of configurable 
services that can be used in [AAIM](#aaim) do-configurations.

### \_functions

Provided methods by name

### execute

Calls a function by its name applying the provided parameters.

**Parameters**

-   `method` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the method to call.
-   `params` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)** The parameters to call the function with.


-   Throws **[Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)** If no function with the requested name is provided by this service.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** A promise to the result of the function call

### provides

Checks if a function is provided by this service.

**Parameters**

-   `method` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the method to check.

Returns **[Boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** true if a method with the given name is provided by this service, false otherwise.

## SituationFactory

### create

**Parameters**

-   `situation` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `parameters` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Any>** 
-   `context` **[Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)** 

### refresh

**Parameters**

-   `situation` **[String](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `parameters` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Any>** 
-   `context` **[Map](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Map)** 