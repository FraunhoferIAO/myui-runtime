# MyUI Runtime Environment

The MyUI Runtime Environment implements the [concepts of the MyUI system](https://doi.org/10.1145/2305484.2305500) for 
model-based adaptive user interfaces. It relies on the concept of the Abstract Application Interaction Model (AAIM)
that is based on state machine diagrams as described in a 
[public deliverable](http://www.myui.eu/deliverables/MyUI_D2-2_final.pdf). 

The runtime environment does not contain any adaptive user interface elements or interaction patterns itself. Instead, 
its modular design allows to integrate components that have been created using the 
[Adaptive Web Components Framework](https://github.com/FraunhoferIAO/awc-core) or other client-side user interface 
frameworks.

## How to create your own MyUI application
The MyUI Runtime is pre-bundled in standalone distributable file located at `dist/myui-runtime.js`.
By simply loading this script, the public API is exposed in a global `myui` object.

 * Load MyUI runtime
```html
<script src="dist/myui-runtime.js"></script>
```

 * Define the [AAIM](./doc/API.md#aaim) for your application
```js
let aaim = {
  initial: <name of initial state>,
  states: [
    {
      name: <name of the state>,
      do: {
        situation: <situation identifier>,
        parameters: [
          <parameter value>, ...
        ]
      },
      events: [
        {
          on: <name of event>,
          goto: <name of target state>,
          do: {
            service: <name of registered serivce>,
            name: <method name>,
            parameters: [
              <parameter value>, ...
            ]
          }
        }, ...
      ]
    }, ...
  ]
}
```

 * Create your [`SituationFactory`](./doc/API.md#situationfactory) implementation
```js
class MySituationFactory extends myui.SituationFactory {
  create(situation, parameters, context) {/*...*/}
  refresh(situation, parameters, context) {/*...*/}
}
```

 * Create your [`AAIMService`](./doc/API.md#aaimservice) implementation
```js
class MyService extends myui.AAIMService {
  constructor() {
    super();

    // Add provided functions
    this._functions.set('myFunction', this.myFunction);
  }

  // Implementation of provided function
  myFunction(firstParam, lastParam) {/*...*/}
}
```

 * Create and configure the [`AAIMBehavior`](./doc/API.md#aaimbehavior)
```js
let behavior = new myui.AAIMBehavior(new MySituationFactory(), new MyService());

// Optionally register additional services
behavior.registerService('other', new OtherService());
```

 * Create the [`AAIMInterpreter`](./doc/API.md#aaiminterpreter) and load the AAIM
```js
let interpreter = new myui.AAIMInterpreter(behavior);
interpreter.load(aaim);
```

 * Start the interpreter when all application dependencies have been loaded
```js
window.onload = function() {
  interpreter.running = true;
};
```

For for more details see the [API documentation](./doc/API.md).

## License
The MyUI Runtime Environment is licensed under the [Clear BSD License](LICENSE).

## Funding Acknowledgement
The research leading to these results has received funding from the European Union's Seventh Framework Programme (FP7) 
under grant agreement no. 248606 ([MyUI](http://myui.eu/)) and no. 610510 ([Prosperity4All](http://www.prosperity4all.eu/)).

Visit the [GPII DeveloperSpace](https://ds.gpii.net) to find more useful resources.
