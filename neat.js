/*  
    Free Palestine
    End Imperalism
    Land Back
    Reparations Now
    ---
    TODO: allow system to run headless in node.js env
    TODO: get system headless server version talking to client version
    TODO: get server sending text, email, sms, apn, web push notifications, etc
    ---
    Taggable, Flaggable, Commentable, Annotatable,
    ---
*/

const testOpenAIServer = "http://127.0.0.1:4001/";

const changelog = [
    [
        "12.4.2023",
`
        - 
`
    ],
    [
        
        "11.30.2023", 

`
    - ctrl+p: disable default print dialog; show cmdprompt instead
    - working on refactoring notifications, debug ui, cursor, cmdprompt to all render on the "top" canvas layer (above the "deep" canvas layers)
    ---
    todos: - workflowy-like featureset
    [bug] flickering frames (push/pop issue?)


`
]

] 

let todos = [{
    "Overview of neat.js": {
      "Ambitions": "- The script aims to create a complex system with various functionalities such as synchronized music playback, web browsing, widget recommendation engine, and more.\n- It also aims to run headless in a node.js environment and communicate with a client version.\n- The script plans to implement a system that sends text, email, SMS, APN, web push notifications, etc.",
      "Current Progress": "- The script has implemented various classes and functions to handle different functionalities such as handling mouse and touch events, managing states, evaluating code within a sandbox, etc.\n- It has implemented classes for different widgets and interfaces.\n- It has implemented a state machine to manage state transitions.\n- It has implemented a REPL (Read-Eval-Print Loop) that evaluates a string of code within a sandbox.",
      "To-dos": "- The script plans to implement click handlers for widgets on the dashboard.\n- It plans to implement a visual clipboard to show when things are cut/copied.\n- It plans to implement a feature test that can be created, built, imported at runtime.\n- It plans to implement a system that can send notifications.",
      "Functions": "- touchStarted(), touchMoved(), touchEnded(): Functions to handle touch events.\n- mouseWheel(event): Function to handle mouse wheel events.\n- updateBlur(): Function to update the blur effect.\n- deleteSelectedNode(): Function to delete a selected node.\n- handleAnalogStickInput(): Function to handle analog stick input.\n- nodesForFlowIndex(flowIndex): Function to get nodes for a given flow index.",
      "Classes": "- TruthTable: Class to define valid state transitions.\n- TimeManager: Class to manage time.\n- FeatureTest: Class to define a feature test.\n- StateMachine: Class to manage states.\n- VirtualMachine: Class that extends StateMachine to manage memory and internal clock.\n- REPL: Class that extends VirtualMachine to evaluate a string of code within a sandbox.\n- Widget, Star, StarFieldWidget, DebugPath, MiniMapWidget, GraphViewer, Clipping, VisualClipboard: Classes to define different widgets.\n- Interface, DraggableInterface, DrawableInterface, ResizableInterface, SelectableInterface, TabbableInterface, SortableInterface, SortingContextInterface, TodosInterface: Classes to define different interfaces.",
      "Constants": "- MOON_PHASE_EMOJIS, MOON_PHASE_ORDER: Constants to define moon phases.\n- HALT_ON_PANIC, SHOW_DEV_WARNINGS, MAX_SUGGESTED_SCENARIOS_PER_FEATURE: Constants to define system behaviors.\n- tsmc_machine_states: Constant to define machine states.\n- DefaultKeyBindings: Constant to define default key bindings."
    }
  }]

  /* listen for the return message once the tweet has been loaded */
window.addEventListener("message", function(e) {
    var oe = e;
    if (oe.origin != "https://twitframe.com")
        return;
	
    if (oe.data.height && oe.data.element.match(/^tweet_/))
        document.getElementById(oe.data.element).style.height = parseInt(oe.data.height) + "px";
});

// TODO: mother of all demos
// credits: brett victor worrydream
// 



// TODO: synchronized music playback
// synchronized web browsing
// "stumble upon" random widgets
// widget recommendation engine


let whatTheCenterIs = {
    x: 0, y: 0, z: 0
};

const MOON_PHASE_EMOJIS = {
    "new": "🌑",
    "waxing_crescent": "🌒",
    "first_quarter": "🌓",
    "waxing_gibbous": "🌔",
    "full": "🌕",
    "waning_gibbous": "🌖",
    "last_quarter": "🌗",
    "waning_crescent": "🌘"
}
const MOON_PHASE_ORDER = [
    "new", "waxing_crescent", "first_quarter", 
    "waxing_gibbous", "full", "waning_gibbous", 
    "last_quarter", "waning_crescent"
]

// NOTE: i'm commonly mistyping filterCommands when i mean to be pointing to filteredCommands... just something to think about
// filtered_commands[] vs. filter_commands()
// filteredCommands filterCommands
// preFilteredCommands filterCommandsFn filterCommandsAction...
let bgImage = null;
// AutorunFeatureTests
const autorunFeatureTestResults = [];
const autorunFeatureTests = [];

// state hydrator / dehydrator
/* VirtualClass - Stringified Definition of a Class Instance */

const HALT_ON_PANIC = 1; // enable to halt the system on panic
const SHOW_DEV_WARNINGS = 1;
const MAX_SUGGESTED_SCENARIOS_PER_FEATURE = 3;
// Singletons
let gherkinRunnerWidget = null;
let toastManager = null;

const tsmc_machine_states = {
    RUNNING: "😀", 
    IDLE: "😴",
    DOWN: "🤕",
    WARNINGS: "🤨"
}

let initialDist = 0;

function touchStarted() {
  if (touches.length === 2) {
    initialDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
  }
  store.touchInputs = touches;
}

function touchMoved() {
  if (touches.length === 2) {
    let newDist = dist(touches[0].x, touches[0].y, touches[1].x, touches[1].y);
    store.pinchScaleFactor *= newDist / initialDist;
    initialDist = newDist;
  }
  store.touchInputs = touches;
}

function touchEnded() {
  store.touchInputs = touches;
}

// Store >
//          CustomCommands{} a hash table keyed by custom command name (unique id)
//          CustomCommandFactories{} a hash table keyed by custom command name (unique id) of 
//              factory functions that return a new instance of the command

// like laravel's singleton provider: app()->singleton('toastManager', function(){ return new ToastManager(); }
// if the system doesn't have a cached instance of the requested class, it will create one, cache it, and return it

// used by StateMachine to define valid state transitions
// @see canTransition()
// undefined transitions are blocked in StateMachine by default
class TruthTable {
    pairs = []
    bulkAllow(arr){ arr.forEach(([a,b])=>{this.allow(a,b)}) }
    allow(a,b){ this.addDefinition(a,b,true); }
    block(a,b){ this.addDefinition(a,b,false); }
    addDefinition(a,b,validityBool){
        if(!this.pairs[a]){
            this.pairs[a] = []
        }
        this.pairs[a][b] = validityBool
    }
    checkValidity(a,b){
        return ( 
            this.pairs[a] 
            && this.pairs[a][b] 
        ) 
        ? this.pairs[a][b] 
        : false;
    }
}
class TimeManager {

}
class GherkinScenarioOutlineExample {}
class GherkinScenarioOutlineExamples {}
class GherkinScenarioOutline {}

/**
    @class Feature Test
    this is the instance of a feature test 
    it is instantiated by the Test Runner
    it is provided with dehydrated / human readable Feature Description
    
    * Feature Descriptions can be created / built / imported at runtime
    * Feature Descriptions are pre-processed and converted to GherkinSequence objects
        
        All GherkinSequence objects represent ONE Feature

            All Features must contain at least 1 Scenario

                It is recommended that a Feature 
                doesn't contain more than 3 Scenarios

                All Scenarios must contain at least 3 Steps:
  
                - First step must be a Given, 
                    followed by 0 or more Givens (via AndGiven)

                - Next step must be a When, 
                    followed by 0 or more Whens (via AndWhen)

                - Next step must be a Then, 
                    followed by 0 or more Thens (via AndThen)

                - Nothing other than the beginning of a new Scenario 
                    can follow a Then
*/
/* 
    the dummy / serialized / dehydrated / human readable version of a Feature Test 
    think of it like a FeatureTestConfigObject or a ScriptableObject / DataObject
*/
class FeatureTest {
    config = {}
    parseError = null;
    get name() {
        return this?.config?.name ?? this.constructor.name ?? 'No Feature Name Provided!';
    }
    // prevent namespace collision / shadowing
    get scenarioZZZ() {
        return this?.config?.scenarios ?? this.scenarios;
    }
    constructor(config){
        // console.warn('FeatureTest constructing...',{
        //     pre_defined_scenarios: this.scenarios,
        //     scenarioZZZ: this.scenarioZZZ,
        //     constructorArgInputConfig: config,
        // })
        if(typeof config === 'undefined'){

        }else{
            this.setConfig(config);
        }
        // TODO: waitUntilTrue...
        const onCheck = function(){
            if(!this.postConstructorCalled){
                if(this.scenarioZZZ){
                    this.postConstructor();
                }else{
                    // retry
                    setTimeout(onCheck,100)
                }
            }
        }
        const check = ()=>setTimeout(onCheck,100)
        check();
    }
    postConstructor(){
        if(!this?.scenarioZZZ){
            // don't flag as successfully post-constructed
            // until we process some scenarioZZZ
        }{
            //console.warn('FeatureTest.postConstructor: still no scenarioZZZ!')
            return;
        }
        this.postConstructorCalled = true;
        console.warn("FeatureTest.postConstructor: ", {
            // pre_DEFINED_scenarios: this.scenarios,
            // config: this.config
            scenarioZZZ: this.scenarioZZZ,
        });
        this.validateConfig();
    }
    validateConfig(){
        if(!this.postConstructorCalled){
            this.postConstructor();
            //system.panic("FeatureTest.validateConfig: postConstructor not called yet");
        }
        // now that any extending classes have had a chance to define their own scenarios,
        let scenarios = Object.entries(this.scenarioZZZ);
        // shallow check, if the first scenario is an array instead of an object, treat the whole
        // config as nested arrays of strings (todo: allow mix-matched scenario definition notation)
        if(Array.isArray(scenarios[0]) && typeof scenarios[0][0] === 'string' && Array.isArray(scenarios[0][1])){
            // if(typeof scenarios[0][0] === 'string'
            // && Array.isArray(scenarios[0][1])){
            //     // if the scenarios are ["scenario",[steps]], we need to reformat to scenarios:[{sgtw},{sgtw}]
            // }
            let parsed = FeatureTest.parseScenarioStrings(scenarios);
            console.warn('overriding config with',{parsed,scenarios})
            this.config = parsed;
            // notice that we can't immediately re-validate the config
            // but... could we?
            //this.validateConfig();
        }
    }
    // todo: validate config
    setConfig(string_or_object){
        if(!string_or_object){
            system.panic("FeatureTest.setConfig: no config provided")
            this.config = {};
            return;
        }
        // console.warn("FeatureTest.setConfig: ", {config:string_or_object});
        // if we're given an object, don't parse it
        if(typeof string_or_object === 'object'){
            this.config = string_or_object;
        }else{
            try{
                this.config = JSON.parse(string_or_object);
            }catch(e){
                this.config = {}; //undefined;
                this.parseError = e;
            }
        }
    }
    static normalizeScenarios(input){
        let output = {};
        // console.warn('normalizing scenarios',{input})
        Object.entries(input ?? {}).forEach(([scenarioName,scenarioSteps])=>{
            if(typeof scenarioSteps[0] === "string" && Array.isArray(scenarioSteps[1])){
                // it's a ["string", []]
                scenarioSteps = scenarioSteps[1];
            }
            const parsed = FeatureTest.parseScenarioStrings(scenarioSteps);
            // if system.debug_parser
            // if system.debug_features
            // console.warn('normalizeScenarios: scenario parsed to: ',{
            //     scenarioName,
            //     scenarioSteps,
            //     parsed
            // })
            output[scenarioName] = parsed;
        });
        return output;
    }
    static normalizeFeatureDefinition(denormalizedFeatureDefinition){
        let normalized = {}
        if(typeof denormalizedFeatureDefinition === 'string'){
            // is it JSON or a solid block of Ghrekin?
            console.warn('FeatureTest.normalizeFeatureDefinition: string input!',{
                denormalizedFeatureDefinition
            })
        }
        else if(typeof denormalizedFeatureDefinition === 'object' && Array.isArray(denormalizedFeatureDefinition)){
            // S-expression?
        }else if(typeof denormalizedFeatureDefinition === 'object'){
            // could be a class or a plain object
            normalized.name = denormalizedFeatureDefinition?.name ?? 'No Feature Name Provided';
            normalized.scenarios = FeatureTest.normalizeScenarios(denormalizedFeatureDefinition?.scenarios ?? {});
        }
        return normalized;
    }

    // normalize our feature defintion, then instance the FeatureTest with it
    // NOTE: the normilization process doesn't strip ToBeImplemented scenarios or steps,
    // that way the parser and runner can still reflect their status downstream to the UI
    // at test execution time
    static fromDenormalizedFeatureDefinition(denormalizedFeatureDefinition){
        // console.warn('creating featureTest from denormalized feature definition',{
        //     denormalizedFeatureDefinition
        // })
        let normalizedFeatureDefition = FeatureTest.normalizeFeatureDefinition(denormalizedFeatureDefinition);
        // console.warn('normalized feature definition',{
        //     normalizedFeatureDefition
        // })
        return new FeatureTest(normalizedFeatureDefition);
    }
    static parseScenarioStrings(arrayOfStepStrings){
        // if the input is ToBeImplemented, just return it untouched
        if(arrayOfStepStrings === ToBeImplemented){
            return arrayOfStepStrings;
        }
        if(!Array.isArray(arrayOfStepStrings)){
            // system.panic("FeatureTest.parseScenarioStrings: invalid input, expected array of strings got: " + typeof arrayOfStepStrings, {
            //     arrayOfStepStrings
            // });
            // if it's an object it's probably already in a good state
            // so we can just return it
            return arrayOfStepStrings;
        }
        if(typeof arrayOfStepStrings[0][0] === "string"
            && Array.isArray(
                arrayOfStepStrings[0][1]
            )
        ){
            system.panic("need to unwrap array of step strings!",{
                arrayOfStepStrings,
                toJust: arrayOfStepStrings[0][1]
            })
            // it's a ["string", []]
            //arrayOfStepStrings = arrayOfStepStrings[1];
        }
        let output = {
            // scenarioName
            name: null,
            given: [],
            when: [],
            then: []
        };
        let previousTokenType = null;
        // console.warn('parseScenarioStrings',{
        //     featureName: this.name,
        //     arrayOfStepStrings
        // })
        
        // console.warn('FeatureTest.parseScenarioStrings',{scenario_name,scenario_steps})
        // scenario_name = scenario_name.trim();
        // output.scenarios[scenario_name] = {
        //     given: [],
        //     when: [],
        //     then: []
        // }
        const T = GHERKIN_AST_TOKENS;
        const to_check = {
            f: T.FEATURE,
            s: T.SCENARIO,
            g: T.GIVEN,
            w: T.WHEN,
            t: T.THEN,
            a: T.AND,
            b: T.BUT,
            e: T.EXAMPLES,
            so: T.SCENARIO_OUTLINE,
            bkg: T.BACKGROUND,
        };
        arrayOfStepStrings.forEach((line)=>{
            let matches = {};
            if(Array.isArray(line) && typeof line[1] === 'object' && line[1]?.given?.length){
                // no need to convert, it's already in a good state
                return;
            }
            if(isEmptyOrUndefined(line)){
                system.panic("FeatureTest.parseScenarioStrings: empty line found in scenario ",{
                    line,
                    typeof_line: typeof line,
                    arrayOfStepStrings
                });
            }
            line = line.trim().toLowerCase();
            Object.entries(to_check).forEach(([key,value])=>{
                //console.warn({value});
                if(isEmptyOrUndefined(value)){
                    system.dump({
                        matches,
                        line,
                        to_check,
                        key,
                        value
                    })
                    system.panic("FeatureTest.parseScenarioStrings: invalid value provided for key: " + key)
                }
                matches[key.toLowerCase()] = line.startsWith(value.toLowerCase());
            })
            
            switch(true){
                // case matches['b']:
                //     system.panic("FeatureTest.parseScenarioStrings: we dont allow But in this dialect of Gherkin");
                //     break;
                // case matches['bkg']:
                //     if(!output.featureName){ system.panic("FeatureTest.parseScenarioStrings: Background found outside of Feature"); }
                //     currentScenarioKey = line.replace(GHERKIN_AST_TOKENS.BACKGROUND,'').trim();
                //     break;
                // case matches['f']:
                //     output.featureName = line.replace(GHERKIN_AST_TOKENS.FEATURE,'').trim();
                //     previousTokenType = GHERKIN_AST_TOKENS.FEATURE;
                //     break;
                // case matches['so']:
                //     if(!output.featureName){ system.panic("FeatureTest.parseScenarioStrings: Scenario Outline found outside of Feature"); }
                //     currentScenarioKey = line.replace(GHERKIN_AST_TOKENS.SCENARIO_OUTLINE,'').trim();
                //     output.scenarios[currentScenarioKey] = {
                //         name: currentScenarioKey,
                //         isOutline: true,
                //         given: [],
                //         when: [],
                //         then: []
                //     }
                //     previousTokenType = GHERKIN_AST_TOKENS.SCENARIO_OUTLINE;
                //     break;
                // case matches['ex']:
                //     if(!currentScenarioKey){
                //         system.panic("FeatureTest.parseScenarioStrings: Examples found outside of Scenario Outline");
                //     }
                //     output.scenarios[currentScenarioKey].examples = line.replace(GHERKIN_AST_TOKENS.EXAMPLES,'').trim();
                //     previousTokenType = GHERKIN_AST_TOKENS.EXAMPLES;
                //     break;
                case matches['a']:
                    // if(!currentScenarioKey){
                    //     system.panic("FeatureTest.parseScenarioStrings: And found outside of Scenario");
                    // }
                    // if(!output.scenarios[currentScenarioKey]){
                    //     system.panic("FeatureTest.parseScenarioStrings: And found outside of Scenario");
                    // }
                    // "AND" it by adding it using the same type as the previous type
                    // if the previous type is not defined, panic
                    if (!previousTokenType) {
                        system.panic("FeatureTest.parseScenarioStrings: And found outside of Scenario");
                    }
                    if(!output[previousTokenType]){
                        output[previousTokenType] = [];
                    }
                    output[previousTokenType].push(line);
                    break;
                    
                // case matches['s']:
                //     if(!output.featureName){ system.panic("FeatureTest.parseScenarioStrings: Scenario found outside of Feature"); }
                //     currentScenarioKey = line.replace(GHERKIN_AST_TOKENS.SCENARIO,'').trim();
                //     output.scenarios[currentScenarioKey] = {
                //         name: currentScenarioKey,
                //         given: [],
                //         when: [],
                //         then: []
                //     }
                //     previousTokenType = GHERKIN_AST_TOKENS.SCENARIO;
                //     break;
                case matches['g']:
                    // if(!currentScenarioKey){
                    //     system.panic("FeatureTest.parseScenarioStrings: Given found outside of Scenario");
                    // }
                    output.given.push(line);
                    previousTokenType = GHERKIN_AST_TOKENS.GIVEN;
                    break;
                case matches['w']:
                    // if(!currentScenarioKey){
                    //     system.panic("FeatureTest.parseScenarioStrings: When found outside of Scenario");
                    // }
                    output.when.push(line);
                    previousTokenType = GHERKIN_AST_TOKENS.WHEN;
                    break;
                case matches['t']:
                    // if(!currentScenarioKey){
                    //     system.panic("FeatureTest.parseScenarioStrings: Then found outside of Scenario");
                    // }
                    output.then.push(line);
                    previousTokenType = GHERKIN_AST_TOKENS.THEN;
                    break;
                default:
                    system.panic("FeatureTest.parseScenarioStrings: no matching start token found: " + line);
                    break;
            }
            if(previousTokenType === null){
                system.panic("FeatureTest parseScenarioStrings: no previousTokentype?", matches);
            }
        })
        
        // console.warn("FeatureTest.parseScenarioStrings > previousTokenType",{previousTokenType})
        
        // console.warn("FeatureTest.parseScenarioStrings > output",{
        //     input: arrayOfStepStrings,
        //     output
        // })
        
        return output;
    }
    // INPUT: ["given ... ", "when ... ", "then ... "]
    // OUTPUT: {scenarios:{given:...,when:...,then:...}}
    static fromArrayOfStrings(input){
        let generatedConfig = {
            featureName: this.name,
        }
        console.warn('(static)FeatureTest.fromArrayOfStrings',{
            input
        })
        let parsed = FeatureTest.parseScenarioStrings(input.scenarios);
        console.warn('(static)FeatureTest.fromArrayOfStrings',{
            parsed
        });
        generatedConfig.scenarios = parsed.scenarios;
        let createdInstance = new this(generatedConfig);
        console.warn('(static)FeatureTest.fromArrayOfStrings',{
            input: arr,
            createdInstance,
            _this:this
        })
        return createdInstance;
    }
}

// this class not only holds the results of a GherkinSequence run
// it also handles the logic for running the sequence to capture the results
// todo: maybe extract the sequence execution logic to a separate class
// and leave this class as just FeatureTestRunResults
class FeatureTestRun {
    // output, successes, errors, info messages, etc
    background_results = []
    scenario_results = []

    // for targeting the test runner that instantiated this test
    // for passing messages up to the host
    // without panicking the entire system
    // tho a system.eventBus could come in handy...
    testRunnerID = null; 
    sequence = null;

    // get passing(){
    //     // find first error in results, if any, return false
    //     // todo: didError bool flag would saving re-counting
    //     return this.results.findIndex((result)=>{
    //         return result.error;
    //     }) === -1;
    // }
    
    constructor({testRunnerID}){
        this.testRunnerID = testRunnerID;
        // if we need to validate the sequence,
        // 1. can we call our TestRunner
        // 2. can we assume the TestRunner will pre-validate the sequence before trying to instantiate it as a FeatureTest?
        // 3. should we rename this to FeatureTestRun ?    
    }
    loadSequence(sequence){
        this.sequence = sequence;
    }
    executeSequence(seq){
        this.sequence = seq ?? this.sequence;
        return new GherkinSequenceExecutor(this.sequence).execute();
    }
}

const TOAST_LEVELS = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
}

/*
    Given *required (at least one Given)
    When *required (at least one When immediately after at least one Given)
    Then *required (at least one, immediately after at least one When)
*/
class SystemManager {
    constructor(){
        this._panic = false;
    }
    boot(){
        // the outer-system manages the sub-systems and resources
        this.systems = []
        const mainSystem = new System(this);
        this.systems.push(mainSystem);
    }
    panic(message){
        this._panic = true;
        console.error(arguments);
        // show a toast
        system.get('toastManager')?.showToast(message, {
            //pinned: true, 
            // TODO: changing level to error could 
            // flip pinned to true by default if we want
            // users could opt-out of a error toast auto-pinning
            // via a config option...
            level:TOAST_LEVELS.ERROR
        });
        if(HALT_ON_PANIC){
            throw new Error(message);
        }
    }
    warn(message){
        console.warn(...arguments);
        // show a toast
        toastManager = system.get('toastManager');
        toastManager?.showToast(message, {
            //pinned: true, 
            level:TOAST_LEVELS.WARNING
        });
    }
    registerWidget(name, instance){
        // register a widget instance with the system
        this.dashboard.registerWidget(name, instance);
    }
}
/** 
 * @TODO `@DecoratorManagedObject`
 * > default to outer system time unless
 *   we've performed some action that has 
 *   de-synchronized this object's inner clock
 *   clock states are resolved up the chain to the base
 *   object in the system so that
 *   groups of items can all share a custom-controllable clock
 *   this is part of how our REPL and time-stepping debugger are able to work
 *   it's also the fundamental mechanism for our versioning system and our
 *   ability to "rewind" the system to a previous state (built-in undo/redo)
 *   you can skip past granular changes to previous milestones or checkpoints
 *   you can name or tag checkpoints
 *   you can attempt to merge checkpoints
 *   you can cherry pick changes between checkpoints
 *   it'll be cool once the gui is wired up, and you see me
 *   zoom out of a graph to view the meta-graph controlling it,
 *   then slice and dice it's flow tree with all kinds of plugins and add ons
 *   then zoom back in, encounter an error,
 *   zoom side-by-side
 *   step through the flow
 *   work backwards from the error
 *   find the error in the flow
 *   correct it, see an instantly passing test that triggers a cascade of related test runs
 *   then watch them ripple from yellow back to green as the system autonomously accepts and distributes the verified changes
 *   to the appropriate subsystems...
 */
/** System.constructor(SystemManager manager) */
class System {
    fallbackImage = null;
    // aka .resource(url) // return from cache or fetch,stash and return
    // aka maybeImage or imageOrNull or imageOrDefault (while loading...)
    // synchronous tho, no waiting required, so that's nice
    image(url){
        // if it's a cache miss, kick off a fire and forget imageAsync call to load it in the background
        // and in the meantime return a filler image
        // btw, the call to imageasync is idempotent, it knows if it has a request midflight and won't
        // stack up multiple requests for the same image
        // we could call it imageAsyncDebounced || imageAsyncThrottled
        if(!this.PreloadedImages[url]){
            // AHHH we fired and forgot some async code, it's the end of teh world!
            this.imageAsync(url);
            return system.fallbackImage;
        }
        return this.PreloadedImages[url]
    }
    // loadImage
    loadImageAsync(url){
        return this.imageAsync(url);
    }
    // getImage
    // getImageAsync
    // async suffix means it returns a promise
    imageAsync(url){
        if(!url){
            return Promise.resolve(this.fallbackImage);
        }

        let urlLoadable = url;
        if(!urlLoadable.includes("res/") && !urlLoadable.includes("://")){
            urlLoadable = url.startsWith('/') ? "/res" + url : "/res/" + url;
        }

        return new Promise((resolve,reject)=>{
            // NOTE: some methods can refer to system on the global space
            // when this method is called, we can ONLY refer to system as "this"
            const system = this;
            // returns from cache or adds to cache and returns
            if(system.PreloadedImages[url]){
                resolve(system.PreloadedImages[url]);
                return;
            }
            //console.warn('about to load',{url})
            if(!(url?.trim?.() ?? "")?.length){
                reject(system.fallbackImage);
                system.panic("System.imageAsync: no url provided");
                return;
            }
            try{
                loadImage(urlLoadable, (img) => {
                    system.PreloadedImages[url] = img;
                    resolve(img);
                });
            }catch(e){
                //throw new Error(e);
                reject(system.fallbackImage);
                system.panic(e)
            }
        })
    }
    snapshotOf(obj){
        return JSON.parse(JSON.stringify(obj))
    }
    onCopy(e){
        system.todo("pick up where i left of with Copy integration")
    }
    onPaste(e){
        system.todo("pick up where i left of with Paste integration")
    }
    async onDrop(e){
        console.warn('system.onDrop',e)
        document.body.classList.remove('dragover');
        e.preventDefault();
        store.lastDropEvent = e;
        //console.warn('ON DROP', arguments)
        
        // render the image (if it is an image)
        // as an image widget

        // otherwise, throw a system notice that it's un unsupported file
        let files = e.dataTransfer.files;

        if(files.length > 0){
            for(let i = 0; i < files.length; i++){
                let file = files[i];
                let fileType = file.type;
                let validImageTypes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp', ];
                validImageTypes.push('image/svg+xml');
                if(validImageTypes.includes(fileType)){
                    // Create a blob URL pointing to the image data
                    const imageUrl = URL.createObjectURL(file);
                    // Create an ImageViewerWidget with the blob URL
                    const widget = new ImageViewerWidget(imageUrl)
                    // Register the widget instance with the system
                    system.registerWidgetInstance(widget);
                    // when the server responds with the upload status, inform the widget
                    try {
                        let response = await InvokableCommands["SEND_IMAGE_TO_SERVER_ASYNC"](file);
                        widget.onUploadComplete(response);
                    } catch (error) {
                        widget.onUploadError(error);
                    }
                } else {
                    system.warn("Unsupported file type: " + fileType);
                }
            }
        }else{
            /** @see System.define */
            console.warn('no files?', {e, frozen_e:system.snapshotOf(e)})
        }
    }
    registerWidgetAvailable(invokeable_command_string, widget_class){
        if(InvokableCommands[invokeable_command_string]){
            system.warn("name override detected: " + invokeable_command_string);
        }
        InvokableCommands[invokeable_command_string] = ()=>{
            // Check if widget_class is a string
            if (typeof widget_class === 'string') {
                // Try to invoke it as a URI
                let result = tryInvokeHandlerForUri(widget_class);
                // If it returns -1, it wasn't invokable
                if (result === -1) {
                    throw new Error("Unable to invoke URI: " + widget_class);
                }
                return result;
            }
            // Check if widget_class is a function
            else if (typeof widget_class === 'function') {
                // Check if the function is a constructor (can be called with 'new')
                if (widget_class.prototype && widget_class.prototype.constructor === widget_class) {
                    // Call the function as a constructor
                    return new widget_class();
                } else {
                    // Call the function normally
                    return widget_class();
                }
            }
            // Check if widget_class is a singleton we can call system.get() on
            else if (system.get(widget_class)) {
                return system.get(widget_class);
            }
            // If none of the above, throw an error
            else {
                throw new Error("Unable to invoke widget_class: " + widget_class);
            }
        };
        return this;
    }
    PreloadedImages = {}
    PreloadedSounds = {}
    PreloadedFonts = {}
    loadSound(soundFile){
        return new Promise((resolve,reject)=>{
            try{

                let audio = new Audio(soundFile);
                audio.onloadeddata = () => {
                    resolve(audio);
                };
                audio.onerror = (error) => {
                    reject(error);
                };
                audio.load();
            }catch(e){
                reject(e);
            }
        });
    }
    playSound(name){
        switch(name){
            case "widget_closed":
                // let duration = 0.5; // Set the duration for the sound
                // let osc = new p5.Oscillator();
                // osc.setType('sine');
                // osc.freq(440);
                // osc.amp(0);
                // osc.start();
                // osc.amp(0.5, 0.05);
                // setTimeout(() => {
                //     osc.amp(0, duration);
                //     osc = null;
                // }, duration * 1000);
                // let soundFile = "res/Water Plop - Sound Effect (HD) [TubeRipper.com].mp3";
                // this.loadSound(soundFile).then(sound => {
                //     sound.play();
                // }).catch(error => {
                //     console.error(error)
                //     // system.panic(error)
                // });
                //system.plopAudioPlayer.seek(0);
                system.plopAudioPlayer.play();
            break;
            default:
                system.panic("unknown sound?! 👀")
            break;
        }
    }
    alert(){
        this.notify(...arguments);
        //alert((arguments ?? []).join(",\n"))
    }
    get latestTodoWidgetOrNew(){
        system.todo('implement a backing singleton for latest todo widget references')
        return new TodoWidget();
    }
    log(){
        console.log(...arguments);
        system.showToast(arguments[0])
    }
    tag = "";
    innerClockTime = -1; 
    // separate from our "serializable" state,
    // we keep _instances_ of our defined state types here
    // factories, which we don't serialize, but do cache, are also stored here
    // outside of the store, to distinguish them from the state and reduce circular references
    singletons = {};
    singletonFactories = {};
    invokeWith(theClass){
        return new theClass(...Array.from(arguments).slice(1))
    }
    invoke(name){
        let launched = -2;
        if(typeof InvokableCommands[name] === 'string'){
            launched = this.invokeHandlerForUri(name);
        }
        if(
            launched === -2
            || launched === -1
        ){
            // system.panic("System.invoke: no handler found for uri: " + name);
        }else{
            return launched;
        }
        return InvokableCommands[name]();
    }
    todo(){
        this.notify("TODO: " + [...arguments].join(" "));
    }
    showToast(){
        this.notify(...arguments);
    }
    // aka notify
    // aka toast
    // aka alert
    // aka notification
    notify(){
        this.get("toastManager").showToast(...arguments);
    }
    // System.constructor(SystemManager manager)
    constructor(manager){
        this.manager = manager;
    }
    get(singletonName){
        return this.lazySingleton(singletonName);
        //return this.singletons[singletonName] ?? null;
    }
    get dashboard(){
        return this.get("Dashboard")
    }
    get cmdprompt(){
        return this.get("cmdprompt")
    }
    lazySingleton(name, factory){
        // if(name === "toastManager"){
        //     console.warn('lazySingleton: toastManager',
        //     {
        //         name,
        //         factory,
        //         singletons: Object.keys(this.singletons),
        //         singletonFactories: Object.keys(this.singletonFactories)
        //     })
        // }
        // return the singleton instance
        if(this.singletons[name]){
            return this.singletons[name];
        }
        if(typeof factory !== 'undefined'){
            // store the factory
            this.singletonFactories[name] = factory;
        }else{
            if(!this.singletonFactories[name]){
                // this.panic("System.lazySingleton: no factory defined for singleton named: " + name);
                // throw new Error("hi");
                this.singletonFactories[name] = function(){
                    console.warn('System.lazySingleton: no factory defined for singleton named: ' + name);
                }
            }
            this.singletons[name] = new this.singletonFactories[name]();
            return this.singletons[name];
        }
    }
    singleton(name, instance){
        if(typeof instance === 'undefined'){
            return this.singletons[name];
        }
        if(!this.singletons[name]){
            this.singletons[name] = instance;
        }
        console.warn('assiging System singleton',{name,instance})
    }
    boot(){
        // while the system boots and we're not 100% sure we've got the image loaded yet
        // let's construct a quick 50x50 image using canvas
        let buffer = createGraphics(50, 50);
        buffer.background('black');
        buffer.stroke('red');
        buffer.strokeWeight(5);
        buffer.line(0, 0, 50, 50);
        buffer.line(50, 0, 0, 50);
        this.fallbackImage = buffer;
        loadImage("res/new2this.webp",(img)=>{
            //this.fallbackImage = img;
        });
    }
    panic(){
        try{
            if(!this?.manager?.panic){
                console.error(...arguments);
                return;
            }
            this.manager.panic(this.tag + ": ",...
            arguments);
        }catch(e){
            console.error(e)
            // rethrow
            throw e;
        }
    }
    error(){
        console.error(this.tag + ": ", ...arguments);
    }
    warn(){
        if(!this?.manager?.warn){ console.warn('no manager.warn',this,arguments); return; }
        this.manager.warn(this.tag + ": ", ...arguments);
    }
    print(){
        console.log(this.tag + ": " + JSON.stringify([...arguments],{
            depth: 3
        },2));
    }
    dump(){
        console.warn(this.tag + 
            (this?.tag ? " " : "") + "System.Dump: ", ...arguments);
    }
    debug(){
        system.dump(this.tag + ": ", [...arguments]);
        debugger;
    }
    setTag(tag){
        this.tag = tag;
    }
    clearTag(){ this.tag = ""; }
    success(message){
        // log a message with a dark green background, and light green text and a green checkmark emoji
        console.log('%c '+ this.tag + ": " + message+' ✅','background: #222; color: #bada55');
        // dump any additional arguments after 0: message
        this.dump(...arguments);
    }
    errorToast(message){
        try{
            this.get("toastManager").showToast(message, {
                level: "error"
            })
        }catch(e){
            console.error(message,e);
        }
        console.error(message);
    }
    hideCmdPrompt(){
        cmdprompt.hide();
        //cmdprompt.hide();
    }
    get time(){
        // returns either passthrough time or modified time
    }
    newWidget(){
        return this.registerWidgetInstance(...arguments)
    }
    // NOTE it's kind of annoying that we want to chain this
    // cause then we have to return the system instance
    // and not the new widget instance
    registerWidgetInstance(){
        /** @see Dashboard.registerWidget */
        this.dashboard.registerWidget(...arguments);
        return this;
    }
    registerWidget(){
        return this.registerWidgetInstance(...arguments)
    }
    tryInvokeHandlerForUri(uri){
        if(
            uri?.includes?.(".png")
            || uri?.includes?.(".jpg")
            || uri?.includes?.(".gif")
            || uri?.includes?.(".jpeg")
        ) {
            // it's an image!
            return system.registerWidget(new ImageViewerWidget(uri))
        }
    
        // if it's a soundcloud url, return a new soundcloud widget instance instead
        if(
            uri?.includes?.("soundcloud.com")
        ) {
            const MySoundCloudClass = class extends SoundCloudWidget {
                url = uri
            } 
            return system.registerWidget(new MySoundCloudClass())
        }
    
        if(
            uri?.includes?.("youtube.com")
            // || uri?.includes?.("youtu.be")
        ){
            let updatedUrl = uri;
            try {
                let url = new URL(updatedUrl);
                // url.searchParams.set('autoplay', '1');
                updatedUrl = url.toString();
            } catch (error) {
                console.error('Invalid URL:', updatedUrl);
            }
            // it's a youtube url!
            return system.registerWidget(new YoutubePlayerWidget("",{tracks:[updatedUrl]}))
        }
        if(uri?.includes?.("://")){
            // it's an iframe, chuck!
            return system.registerWidget(new iFrameWidget(uri))
        }
        return -1;
    }
}
const rootSystemManager = new SystemManager();
const rootManager = rootSystemManager; // alias
const root = rootManager; // alias
const manager = rootManager; // alias
// construct our root system and attach our root manager

// more singletons
/**
 * @see System
 // @property {System} system
 */
// todo: probably time to start cleaning up any references from "system" to "rootSystem" since we need to think in terms of multi-sandbox features
let system = new System();

let rootSystem; // alias

// Array of tests that will run during self-test mode
// (when enabled) while the system is booting
// aka SelfTestDescriptions
// todo: merge with (replacement) autorunFeatureTests
const selfTestFeatureClasses = []
const selfTestFeatureInstances = []
// Decorator that pre-registers our classes so
// we can "tag" them and run them automatically during self-test mode
// without having to specify them in a config file or elsewhere
const AutorunningSelfTest = function(baseClass, options){
    // options: {name, description, tags, etc}
    let myID = performance.now() + Math.random();
    defaultFeatureTests.push(myID);
    let myIDX = defaultFeatureTests.length - 1;

    // this executes when the ExtendingClass is instantiated
    return function(){
        const extendedClassInstance = new baseClass(...arguments);
        return extendedClassInstance;
    }
}

// Automatically registers Command classes with the
// Default Command Prompt Suggestions

class Hello {
    intentions = [
        "make it like playing with a train set"
    ]
    constructor(){
        console.info(`
        Hello, World! This is an update! welcome to version 1.0! we're testing a new sandbox for working with code.`)
    }
}



// aka corecmds, core commands, system commands, root commands, global commands...
let baseCmds = [
    // new Command("hello", {
    // }
]
const BaseCmds = function(command, wizardConfigInstance){
    // console.warn('BaseCmds',{
    //     name: typeof wizardConfigInstance === 'undefined' 
    //         ? command?.constructor?.name ?? command
    //         : `${command?.name} ${wizardConfigInstance?.name}`,
    //     command,
    //     wizardConfigInstance
    // })
    let alreadyHatched = false;
    if(!wizardConfigInstance && command.__type === 'Config'){
        // we already have a wizardConfigInstance
        wizardConfigInstance = command;
        alreadyHatched = true;
    }
    else if(!wizardConfigInstance || !wizardConfigInstance?.name){
        console.error({
            command,
            wizardConfigInstance
        })
        throw new Error("Bad usage of BaseCmds, wizardConfigInstance must be defined and have a name")
    }
    // singleton
    let s = alreadyHatched
        ? command
        : new Command(wizardConfigInstance.name, {
            wizardConfig: wizardConfigInstance
        });
    // console.log('instance of ',{
    //     command, 
    //     wizardConfigInstance, 
    //     singleton: s
    // })
    // early registration before instance is created

    // console.error('warn: skipping auto-reg',{
    //     command,wizardConfigInstance
    // })
    // baseCmds.push(s);
    let index = baseCmds.length - 1;
    // console.warn(
    //     'baseCmdsArrayLen:',
    //     baseCmds.length
    // )
    return function(...args){
        // return s;
        // hot-swap when the instance is created
        baseCmds[index] = new command(...args);
        console.warn('hot swap!',{
            s,
            replacementInstance: baseCmds[index],
            newArgs: args,
            oldArgs: {
                command,
                wizardConfigInstance
            }
        })
        if(baseCmds[index]?.postConstructor?.call){
            baseCmds[index].postConstructor();
        }
        console.warn('init BaseCmds',{
            instance: baseCmds[index]
        })
        return baseCmds[index];
    }
}

debugLog_defaultSuggestions = function(){
    baseCmds.forEach((s,i)=>{
        console.log(i,s.name)
    })
}

class Config
// extends DynamicThingDecorator(DynamicThing)
{
    // for serialization
    __type = "Config"
    // TODO: add validation for required fields that
    // all Instances of "Config" must have
    steps = [{
        notice: "Default Wizard Config Step"
    }]
    get name(){
        return this?.config?.name ?? this.constructor.name ?? 'No Config Name Provided!';
    }
    constructor(config){
        //console.warn("New Config Instance!",{config})
        this.config = config;
    }
    finalCallback(wizardInstance){
        console.warn("Default Wizard Config Final Callback \n"+
        "override this in your Custom Config class extended definition",
        {wizardInstance});
    }
}

// Define the Command class
class Command {
    get name(){
        return `Command: _name:{${this._name}}, wizardConfig:${this.options?.wizardConfig?.name ?? 'No Wizard Config'}`
    }
    set name(value){
        this._name = value;
    }
    constructor(name, options){
        this.name = name ?? this.name;
        this.setOptions(options ?? {});
    }
    setOptions(options){
        this.options = options
        // remap "finalCallback" to this.options.wizardConfig.finalCallback
        if(this.options?.wizardConfig?.finalCallback){
            this.finalCallback = this.options.wizardConfig.finalCallback.bind(this);
        }
    }
    clone(){
        // return a cloned instance of this command
        return new Command(this.name, this.options);
    }
    /**
     * @returns WizardConfig? - the command's optional wizard config
     * @nullable - returns null if no wizard config is defined
     */
    get wizardConfig(){
        return this?.options?.wizardConfig;
    }
    execute(){

        if(this.onCommandExecuting){
            this.onCommandExecuting();
        }

        // This method is final and cannot be overridden by extending classes.
        // If you need to change the behavior, consider using hooks or events.
        // if (new.target !== Command) {
        //     throw new Error("Cannot override final method execute() from child class:".concat(this.constructor.name));
        // }
        // stay focused!!!
        // daily train, ride the humps,
        // > don't get distracted by the bumps
        // 
        console.warn('Command.execute:',
        {
            name: this.name,
            
            hasWizard: this.wizardConfig ? true : false,

            implementsInvokeAsAFn: typeof this.invoke === 'function',
            invokeIsType: typeof this.invoke,

            options: Object.keys(this.options),
            _options: this.options,

                hasCallback: this.options.callback ? true : false,
                
                hasExecuteFn: this.options.execute && this.options.execute?.call ? true : false,
                    fn: this.options.execute
        })
        if(typeof this?.invoke === 'function'){
            this.invoke();
        }
        if(this.wizardConfig){
            // the constructor validates the wizardConfig for us
            this.wizard = new WizardController(this.options.wizardConfig);
            this.wizard.start();
        }
        if(this.options.callback){
            this.options.callback.call(this);
        }
        if(this.options.execute){
            this.options.execute.call(this);
        }
        if(typeof this.invoke === "function"){
            this.invoke();
        }
        // if(
        //     typeof this.act === 'undefined' 
        //     && typeof this.invoke === 'undefined'
        // ){
        //     system.panic("bad command",this);
        // }
        // console.warn("Command.execute typeof this.act", typeof this.act, {
        //     act: this.act
        // })
        if(
            typeof this.act !== 'function'
            && !this.wizardConfig 
            && typeof this.invoke !== 'function'
            && typeof this.options?.callback !== 'function' 
            && typeof this.options?.execute !== 'function'
        ){
            system.get("toastManager")
            .showToast(`bad command: ${this.name}`, {level:TOAST_LEVELS.ERROR})
            //system.debug(this);
            //system.panic("Undefined Command Behavior!\nneed at least: invoke(), options.wizardConfig, options.callback or options.execute",{cmd:this})
        }
        // reset command buffer
        store.commandBuffer = {};
    }
    tryExecute(){

        // if this.___type === Config (somehow)
        // and this.config.execute is a function,
        // call it instead
        if(this.__type === 'Config' && typeof this.config.execute === 'function'){
            this.config.execute();
            return;
        }

        try{
            this.execute();
        }catch(e){
            system.panic("Command.tryExecute: ",e);
        }
    }
    updateFromBuffer(){
        // update the current command based on the command buffer
        this.name = store.commandBuffer.name;
    }
}

// BeginRegion: Gherkin
let gherkinStudio;

/*
    Given I am on the Login Page
    When I submit valid credentials
    Then I should be logged in
*/
let previousStep; 
class GherkinStep {
    constructor(type, name, options){
        this.type = type;
        this.name = name;
        this.options = options;
        previousStep = this; // todo maybe use a long history
    }
}
// record the previously constructed step
// so we can refer back to it's type
// so we know how to properly instantiate
// AndGiven, AndThen, AndWhen, etc implicitly

function Scenario(){
    return new GherkinStep('Scenario', ...arguments);
}
function Feature(){
    return new GherkinStep('Feature', ...arguments);
}
function Given(){
    return new GherkinStep('Given', ...arguments);
}
function When(){
    return new GherkinStep('When', ...arguments);
}
function Then(){
    return new GherkinStep('Then', ...arguments);
}
function And(){
    // was the previously added step a Given, When, or Then?
    switch(previousStep.type){
        case 'Given':
            return new GherkinStep('Given', ...arguments);
        case 'When':
            return new GherkinStep('When', ...arguments);
        case 'Then':
            return new GherkinStep('Then', ...arguments);
        default:
            system.panic("invalid previous step type",previousStep.type);
            break;
    }
}
class BDDTest {
    results = []
    requirements = [
        Given("I am a BDDTest"),
        When("I perform an action"),
        Then("I expect valid results")
    ]
    passed = null;
    executed = false;
}
class AuthRequirements extends BDDTest {
    requirements = [
        Given("I am on the Login Page"),
        When("I submit valid credentials"),
        Then("I should be logged in")
    ]
}
class AndGiven extends GherkinStep {}
class AndWhen extends GherkinStep {}
class AndThen extends GherkinStep {}

// returns a callback function or string global keyname to a resource
const findGWTMatch = (type, string) => {
    const lookupTable = {
        [GHERKIN_AST_TOKENS.GIVEN]: givenLookupTable,
        [GHERKIN_AST_TOKENS.WHEN]: whenLookupTable,
        [GHERKIN_AST_TOKENS.THEN]: thenLookupTable
    };

    if (!lookupTable[type]) {
        system.panic("findGWTMatch: invalid type: " + type);
    }

    let key = Object.keys(lookupTable[type])
        .sort((a, b) => b.length - a.length)
        .find(key => string
            .toLowerCase()
            .includes(key.toLowerCase()));
    if(key === -1){
        system.panic("findGWTMatch: no match found for: " + string);
    }
    return lookupTable[type][key];
}

const forEach = (arr, callback) => {
    for (let i = 0; i < arr.length; i++) {
        callback(arr[i], i);
    }
}

// takes an optionally dot-separated namespace'd path to a resource
const dotNotationResolver = (...args) => {
    let string = args[0];
    // console.warn('dotNotationResolver',{
    //     a: args,
    // })

    // if we are given an array as input,
    // we need to parse the first part of the array from the system root
    // IF we are in a THEN context...
    // the rest of the array should be treated as assertion logic,
    // for example: "not null" would assert that the first "resolved" portion of the array is not null,
    // ~ "null" will assert that the first "resolved" portion of the array IS null
    // ~ "undefined" will assert that the first "resolved" portion of the array IS undefined
    // ~ "truthy" will assert that the first "resolved" portion of the array IS truthy

    let tailArguments = [];
    let assertion = null;
    const valid_assertions = [
        "null",
        "not null",
        "undefined",
        "truthy",
    ]

    if(typeof string === 'object' && Array.isArray(string)){
        let arr = string;
        if(!arr.length){
            system.panic("dotNotationResolver: empty array provided");
        }
        else if(arr.length === 1){
            // if we only have one item in the array,
            // we can assume it's a string and try to resolve it
            string = arr[0];
        }else if(arr.length === 2){
            // our dot-notation string thing 
            // to check is the first item in the array
            string = arr[0];
            // verify it's an assertion, otherwise it could be an argument to the function we're calling
            if(valid_assertions.includes(arr[1])){
                assertion = arr[1];
            }else{
                // assume it's just an argument to the function we're calling
                tailArguments = arr.slice(1);
            }
        }else{
            // > 2 assume it's just more arguments to the function we're calling
            string = arr[0]; // fn pointer
            tailArguments = arr.slice(1);
        }
    }

    if(!string || typeof string !== 'string'){
        console.error({
            thingThatWasSupposedToBeAString: string
        })
        system.panic("dotNotationResolver: invalid string provided: " + string);
    }
    let typeArray = [];
    let parts = string.split('.');
    let index = 0;
    let rootPart = system.get(parts[0]);
    let currentPart = rootPart;
    typeArray.push(typeof rootPart);
    forEach(parts.slice(1), (partKey)=>{
        let part = currentPart?.[partKey];
        if(!part){
            console.warn("dotNotationResolver: no part found for key: " + partKey);
        }else{
            typeArray.push(typeof part);
            currentPart = part;
        }
    })

    if(assertion !== null){
        if(assertion === "null"){
            if(currentPart !== null){
                system.panic("dotNotationResolver: assertion failed, expected null, got: " + currentPart + ` type: ${typeof currentPart}`);
            }
        }else if (assertion === "not null"){
            if(currentPart === null){
                system.panic("dotNotationResolver: assertion failed, expected not null, got: " + currentPart + ` type: ${typeof currentPart}`);
            }
        }
    }

    // console.warn('dotNotationResolver',{
    //     string,
    //     parts,
    //     // rootPart,
    //     typeArray,
    //     // currentPart,
    // })

    // finally resolved:
    return {
        root: rootPart,
        tail: currentPart,
        tailArguments,
        tailType: typeof currentPart,
        typeArray,
        parts,
        inputString: string
    };
}

class GherkinSequenceExecutor {
    /** @property sequence GherkinSequence */
    sequence = null;
    currentScenarioIndex = 0;
    currentScenarioKey = null;
    scenario_results = {}

    constructor(sequence){
        this.sequence = sequence;
    }

    /**
     * 
     * @returns 
     */
    preFlightCheck(){
        if(store.debugGSE){
            console.warn('GSE:preFlightCheck',{
                sequence: this.sequence,
                isValid: this.sequence?.isValid,
            })
        }
        if(this.sequence === null){
            // TODO: maybe panic the testRunner instead of the whole system
            system.panic("GSeqExecutor.preFlightCheck: no sequence provided");
            return false;
        }
        if(!this.sequence.isValid){
            system.dump({
                invalidSequence: this.sequence,
            })
            system.panic("GSeqExecutor.preFlightCheck: invalid sequence provided");
            return false;
        }

        // Validity is one thing,
        // Dependencies are another,
        // if any of our dependencies aren't ready yet
        // we need a way to re-queue the test to try again
        // at the end of the queue 
        // (and use priority to bubble up any important tests)
        // console.warn('handle dependency injection checking here',{seq:this.sequence});
        // seq.scenarios (are computed and plucked out of seq.steps)


        return true;
    }

    // aka executeSequence
    execute(seq){
        // console.info('GherkinSequenceExecutor.execute',{
        //     incomingSeq:seq, 
        //     thisSequence: this.sequence
        // })
        this.sequence = seq ?? this.sequence;
        let preflightResult = this.preFlightCheck();
        if(!preflightResult){
            system.panic("FeatureTestRun.executeScenario: preflight check failed");
            return;
        }
        // TODO use GherkinTestRun container class / DTO
        // for now: plain object, keyed by scenario name
        this.featureScenarioResults = {};
        if(!this.sequence.scenarios?.length){
            system.panic(`GherkinSequenceExecutor.execute: no scenarios found in sequence: ${this.sequence.name}`)
        }
        this.sequence.scenarios.forEach((scenario,index)=>{
            this.currentScenarioIndex = index;
            this.currentScenarioKey = scenario.name;
            this.executeScenario(scenario,index);
        });
        // console.info('GSExecutor.execute: returning featureScenarioResults',{
        //     featureScenarioResults: this.featureScenarioResults
        // })
        return this.featureScenarioResults;
    }

    // tryExecuteScenario
    executeScenario(scenario,index){
        this.featureScenarioResults[scenario.name] = {
            stepResults: [],
            scratchScope: {}
        }
        // let preflightResult = this.preFlightCheck();
        // if(!preflightResult){
        //     system.panic("FeatureTestRun.executeScenario: preflight check failed");
        //     return;
        // }
        // console.warn('GSE:executeScenario',{
        //     scenarioName: scenario?.name ?? 'missing scenario name!',
        //     scenarioSteps: scenario?.steps ?? 'steps missing!',
        //     scenario,
        // })
        if(!scenario?.steps?.length){
            system.panic(`GherkinSequenceExecutor.executeScenario: no steps found in scenario: ${scenario.name}`)
        }
        let results = [];
        // try {
            //results = scenario.execute();
            scenario.steps.forEach((step,index)=>{
                //try{
                let result = this.executeScenarioStep(scenario,step,index)
                // TODO: finish figuring out why executeScenarioStep is returning [undefined,Notification,undefined]
                //console.warn("stepResult:",{result})
                results.push(result);
                // put the results into the stepResults array
                this.featureScenarioResults[scenario.name].stepResults[index] = results;
                /*
                }catch(error){
                // if !step.isOptional
                system.dump({
                    panickedStep: step,
                    panickedScenario: scenario,
                })
                system.panic(error)
                results.push({
                    step,
                    index,
                    error
                })
                }
                */
            })

            
        // }catch(erro){
        //     results.push({
        //         scenario,
        //         index,
        //         error
        //     })
        // }
        // this.scenario_results[index] = results;
        return results;
    }

    // tryExecuteFeature // ?
    // tryExecuteScenarioOutline
        // tryExecuteScenarioOutlineExample
            // tryExecuteScenarioStepWithExample
    
    // tryExecuteScenarioStep
    executeScenarioStep(scenario,step,index){
        // step.__type = [Given,When,Then]
        // switch(step.__type){
        //     case GHERKIN_AST_TOKENS.GIVEN:
        //         //
        //         break;
        //     case GHERKIN_AST_TOKENS.WHEN:
        //         //
        //         break;
        //     case GHERKIN_AST_TOKENS.THEN:
        //         //
        //         break;
        //     default:
        //         console.error('GSE:executeScenarioStep: unhandled step type '+step?.__type,{step})
        //         break;
        // }

        if(step.__type === ToBeImplemented){
            // Flag step result as error / failure
            this.scenario_results[
                this.currentScenarioIndex
            ] = {
                skipped: true,
                warning: `GSE: ToBeImplemented`,
                step: step,
                sequence: this.sequence, // todo clone
            }
            return;
        }
        const stepCallback = findGWTMatch(step.__type, step.value);

        if(Array.isArray(stepCallback)){
            if(!stepCallback.length){
                system.panic("GSE:executeScenarioStep: empty array passed as step callback! for step: " + step.value);
            }
            // ~ can be dot-separated 
            // as long as it starts with a global singleton ~
            // NOTE: the first [0] entry is the method pointer ("rootKey.fnName")
            // NOTE: the second entry [1] is options obj {isOptional:bool}
            if(!stepCallback[0]){
                system.dump({
                    step,
                    stepCallback
                })
                system.panic("GSE:executeScenarioStep: no step callback at index 0? found for step: " + step.value);
            }

            // DOT RESOLVER: ARRAY[0]
            let dotResolved = dotNotationResolver(stepCallback[0]);
            if(dotResolved.tailType === 'function'){
                let result = dotResolved.tail.call(
                    dotResolved.root, 
                    ...[
                        ...(dotResolved?.tailArguments ?? []),
                        ...stepCallback.slice(1),
                    ]
                );
                if(typeof result === 'undefined'){
                    system.panic("GSE:executeScenarioStep: step callback returned undefined for step: " + step.value);
                }
                // console.warn(
                //     'GSE:executeScenarioStep: dotNotationResolver result',{stepCallback,dotResolved,result}
                // )
                return result;
            }

            // stepCallback.forEach((provideMeStringName)=>{
            //     console.warn({provideMeStringName})
            //     let topLevelThingName = provideMeStringName.split('.')[0];

            //     // if the thing is dot-separated,
            //     // it needs to be resolved as a nested thing
            //     // like how selectn() works
            //     const parts = provideMeStringName.split('.');
            //     if(parts.length > 1){
            //         // example: toastManager.sendToast
            //     }

            //     // scratchScope is where we'll store the results of the system.get(provideMeStringName)
            //     // so our GWT steps have rolling access to the results of the previous GWT steps
            //     if(
            //         !this.featureScenarioResults[scenario.name]?.scratchScope
            //     ){
            //         this.featureScenarioResults[scenario.name].scratchScope = {};
            //     }
            //     this.featureScenarioResults[scenario.name].scratchScope[topLevelThingName] = system.get(topLevelThingName);

            //     // here is where we should check if the system provided the thing
            //     // or if we need to re-queue this test for a retry
            // })
        }

        if(!stepCallback){
            system.errorToast(`GSE: Missing Step Definition:\n${step.__type}:\n${step.value}`)
            // system.panic("GSE:executeScenarioStep: no step callback found for step: " + step.value + ` type: ${step.__type}`);
            // Flag step result as error / failure
            this.scenario_results[
                this.currentScenarioIndex
            ] = {
                passed: false,
                error: `GSE: Missing Step Definition:\n${step.__type}:\n${step.value}`,
                step: step,
                sequence: this.sequence, // todo clone
            }
            return;
        }else if(Array.isArray(stepCallback)){
            // console.warn('array passed as step callback',{
            //     array: stepCallback,
            // })
            forEach(stepCallback,(subStep)=>{
                // substeps can be strings, or arrays of strings
                // any of the strings can be dot-notation
                // if it's an array, the first string is the optionally dot-notated path to the resource, and the second element of the substep array is a magic string that triggers an assertion check on the resolved resource
                if(
                    typeof subStep === "object" 
                    && Array.isArray(subStep)
                ){
                    // subStep is an array
                    // first element is the string path to the resource
                    // second element is the assertion string
                    let dotResolved = dotNotationResolver(subStep[0]);
                    if(dotResolved.tailType === 'function'){
                        let result = dotResolved.tail.call(
                            dotResolved.root, 
                            ...[
                                ...(dotResolved?.tailArguments ?? []),
                                ...subStep.slice(1)
                            ]
                        );
                        if(typeof result === 'undefined'){
                            system.panic("GSE:executeScenarioStep: step callback returned undefined for step: " + step.value);
                        }
                        // console.warn(
                        //     'GSE:executeScenarioStep: dotNotationResolver result',{stepCallback,dotResolved,result}
                        // )
                        return result;
                    }
                }else if(typeof subStep === 'string'){
                    // let's hope it's just a string
                    let dotResolved = dotNotationResolver(subStep);
                    if(dotResolved.tailType === 'function'){
                        let result = dotResolved.tail.call(
                            dotResolved.root, 
                            ...[
                                ...(dotResolved?.tailArguments ?? []),
                                ...subStep.slice(1)
                            ]
                        );
                        if(typeof result === 'undefined'){
                            system.panic("GSE:executeScenarioStep: step callback returned undefined for step: " + step.value);
                        }
                        // console.warn(
                        //     'GSE:executeScenarioStep: dotNotationResolver result',{stepCallback,dotResolved,result}
                        // )
                        return result;
                    }
                }else{
                    system.panic("GSE:executeScenarioStep: invalid substep type: " + typeof subStep + `on step ${step.value} type: ${step.__type}`);
                }
            })
        }else if(typeof stepCallback === 'function'){
            return stepCallback.call(this, step);
        }else if(typeof stepCallback === 'string'){
            // singleton key name provided
            return system.get(stepCallback)
        }else if(typeof stepCallback === 'object'){
            //store.debugGSE && 
            console.warn('GSE:executeScenarioStep: step callback is an object, assuming it is a singleton instance',stepCallback)
            return stepCallback;
        }else{
            console.error("got unexpected type for step callback",{
                typeOf: typeof stepCallback,
                stepCallback,
            })
            system.panic("GSE:executeScenarioStep: step callback is not a function: " + stepCallback + ` type: ${step.__type}`);
        }
    }
}
class GherkinSequenceValidator {
    validationErrors = []
    sequence = null;
    constructor(sequence){
        this.sequence = sequence
        //console.warn('GherkinSequenceValidator:ctor',{sequence})
    }
    get steps(){
        return this.sequence?.steps ?? [];
    }
    validateSequence(sequence){
        // console.warn('validateSequence',{
        //     prevSeq: this.sequence,
        //     incomingSeq: sequence
        // })
        // reset: clear validation errors
        this.validationErrors = [];
        
        this.sequence = sequence ?? this.sequence;
        if(!this.sequence){
            console.error('validateSequence: no valid seq provided',{
                sequence,
                thisSequence: this.sequence
            })
            system.panic("GherkinSequenceValidator.validateSequence requires a sequence to validate")
        }
        if(!this.sequence?.steps?.length){
            // seq cannot be empty
            system.dump({tooShortSeq:this.sequence});
            system.panic("GherkinSequenceValidator.validateSequence requires a GherkinSequence with at least one step in the .steps array")
        }
        // console.warn("checking sequence:",{
        //     seq: this.sequence,
        // })
        this.sequence.steps.forEach((step,index)=>{
            this.checkStepIsValid(step,this.sequence,index)
        })
        this.sequence.isValid = this.validationErrors.length === 0;
        this.sequence.latestValidator = this;
        this.sequence.latestValidationErrors = this.validationErrors;
        return this.sequence.isValid;
    }
    // TODO: maybe better as:
    // Feature: ""
    // Scenarios: {
    //    scenarioNameOne: Steps[], 
    //    scenarioNameTwo: Steps[], 
    //    scenarioNameThree: Steps[]
    //}
    checkStepIsValid(step,sequence,index){
        let steps = sequence.steps;
        let prevStep = sequence.steps[parseInt(index)-1];
        // console.log("checkStepIsValid",{step,steps,index,prevStep})
        if(!prevStep){
            // first step must be a Feature
            if(step.__type !== GHERKIN_AST_TOKENS.FEATURE){
                this.validationErrors.push(`First Step Must Be A Feature. \nGot step.__type: ${step.__type} @ index ${index}`);
                system.dump({step,steps,index})
                system.panic(`First Step Must Be A Feature. \n Got: step.__type ${step.__type} @ index ${index}`);
            }
            // valid opening step
            return true;
        }
        
        // walk backwards until we find a step of a different type ?
        // don't even need to, can just check prev step if any
        //let prevDifferentStep = this.closestPreviousDifferentStep(steps,index);
        let valid = false;
        const T = GHERKIN_AST_TOKENS;
        switch(step.__type){
            case T.FEATURE:
                valid = prevStep == null;
                break;
            case T.SCENARIO:
                valid = prevStep?.type === T.FEATURE 
                        || prevStep?.type === T.THEN
                        || prevStep?.type === T.TO_BE_IMPLEMENTED;
                break;
            case T.GIVEN:
                // if the previousDifferentStep is null || Given, it's valid
                valid = prevStep === null || prevStep?.type === T.GIVEN;
                break;
            case T.WHEN:
                valid = prevStep?.type === T.GIVEN || prevStep?.type === T.WHEN;
                break;
            case T.THEN:
                valid = prevStep?.type === T.WHEN || prevStep?.type === T.THEN;
                break;
            case T.TO_BE_IMPLEMENTED:
                valid = prevStep?.type === T.SCENARIO;
                break;
            default:
                system.dump({step});
                system.panic(`Invalid Step Type In GherkinSequence:\n ${step.__type} after a ${prevStep?.__type ?? 'null'} at index ${index}`)
                break;
        }
        return valid;
    }
    closestPreviousDifferentStep(steps,index){
        if(!steps[index-1]){
            return null;
        }
        let prevStep = steps[index-1];
        let step = steps[index]
        if(prevStep.__type !== step.__type){
            return prevStep;
        }
        return this.closestPreviousDifferentStep(steps,index-1);
    }
    
}
class GherkinSequence {
    steps = [];
    isValid = false
    get scenarios(){
        let scenarioSteps = [];
        let scenarios = [];
        let currentScenarioName = null;
        const maybeFlush = ()=>{
            if(scenarioSteps.length > 0){
                // system.panic(`GherkinSequence.scenarios: invalid sequence, SCENARIO without an END_SCENARIO`)
                // reset
                scenarios.push({
                    name: currentScenarioName,
                    steps: scenarioSteps
                });
                scenarioSteps = [];
            }
        }
        this.steps.forEach((step, index) => {
            // todo: make a switch()
            if(step.__type === GHERKIN_AST_TOKENS.FEATURE){
                // continue
            }else if(step.__type === GHERKIN_AST_TOKENS.SCENARIO){
                

                maybeFlush();

                // record the name
                currentScenarioName = step.value;
                
                // don't push the Scenario Opening token, it's implied
                // and doesn't map to anything executable downstream
                //scenarioSteps.push(step);
            }
            // else if(step.__type === GHERKIN_AST_TOKENS.END_SCENARIO){
            //     if(scenarioSteps.length === 0){
            //         throw new Error("GherkinSequence.scenarios: invalid sequence, END_SCENARIO without a SCENARIO");
            //     }else if(scenarioSteps.length < 3){
            //         throw new Error("GherkinSequence.scenarios: invalid sequence, SCENARIO with less than 3 steps");
            //     }else{
            //         scenarioSteps.push(step);
            //         scenarios.push({
            //             name: currentScenarioName,
            //             steps: scenarioSteps
            //         });
            //         // reset
            //         scenarioSteps = [];
            //     }
            // }
            else if(currentScenarioName){
                scenarioSteps.push(step);
            }
        });
        // if we had a scenario that didn't end, flush it
        maybeFlush();

        return scenarios;
    }
    constructor(steps){
        if(!steps || !steps?.length){
            return;
        }
        // validate sequence 
        // as it's constructed
        steps.forEach((step)=>{
            this.addStep(step);
        })
    }
    addStep(step){
        // NOTE: for now, just let it go, we'll validate it later
        // console.warn('GherkinSequence.addStep',{step})
        // const seqNext = [
        //     ...this.steps,
        //     step
        // ];
        // should we normalize passing to the constructor over the method?
        // const validator = new GherkinSequenceValidator(seqNext);
        // const isValid = validator.validateSequence();
        // if(!isValid){
        //     system.panic("addStep: invalid sequence: " + validator.validationErrors.join(","));
        // }
        this.steps.push(step);
        return this;
    }
}
function getTestGherkinSequence(){
    return new GherkinSequence([
        Feature("Login"),
        Scenario("Login with valid credentials"),
        Given("I am on the Login Page"),
        When("I submit valid credentials"),
        Then("I should be logged in")
    ])
}
class GherkinRunner {
    // a cucumber-like interface for running a Gherkin Feature Definition and exposing results to be hooked up to a visual display
    currentStepIndex = 0;
    results = []
    sequence = null;
    constructor(){
    }
    reset(){
        this.currentStepIndex = 0;
        this.results = []
        this.sequence = null;
    }
    // TODO: rename to validateFeatureDefinition
    validateSequence(seq){
        this.sequence = seq ?? this.sequence;
        if(!this.sequence || !(this.sequence instanceof GherkinSequence)){
            system.panic("GherkinRunner.sequence must be an instance of a GherkinSequence object")
        }
        this.validator = new GherkinSequenceValidator(this.sequence);
        let isValid = this.validator.validateSequence();
        if(!isValid){
            system.panic('GRunner:validateSeq invalid sequence! '+this.validator.validationErrors.join(","));
        }else{
            //toastManager.showToast('Sequence is valid!');
        }
        this.validator = null;
    }
    loadSequence(sequence){
        let valid = this.validateSequence(sequence);
        // if(!valid){
            // return; // ? should we load invalid sequences?
        // }
        this.sequence = sequence;
    }
    async run(){
        return new Promise((resolve, reject)=>{
            if(!this.sequence){
                system.panic("GherkinRunner.sequence must be set before running...")
            }
            if(!(this.sequence instanceof GherkinSequence)){
                system.panic("GherkinRunner.sequence must be an instance of a GherkinSequence object")
            }
            if(!this.sequence?.steps?.length){
                console.warn(this.sequence);
                system.panic("GherkinRunner.sequence must have steps")
            }
            this.sequence.steps.forEach(async (step,index)=>{
                try{
                    await this.runStep(step,index);
                }catch(e){
                    // assume required unless flagged
                    if(!step.isOptional){
                        reject(e);
                    }else{
                        console.warn("Optional Step Failed",e);
                        resolve("Optional Step Failed");
                    }
                }
            })
            resolve();
        })
    }
    async runStep(step,index){
        this.currentStepIndex = index;
        const messages = [], errors = [];
        let valid = await step.validate();
        this.results[this.currentStepIndex] = {
            valid,
            errors,
            messages
        }
        return this;
    }
}
// EndRegion: Gherkin

// BeginRegion: Widgets
// is this the root?
class Component {
    constructor(name){
        // TODO: GUIDv4
        this.id = performance.now() + Math.random();
        //this.name = name;
    }
}
class UndoRedoComponent extends Component {
    // maybe better as a decorator?
}
const minWidgetDepth = -3;
const maxWidgetDepth = 3;

const hoveredArray = []

// function drawAnimatedDashedLine(
//     _weight, _color, speed, dashLength,
//     vert1, vert2
// ){
//     strokeWeight(_weight)
//     stroke(_color)
//     let distance = dist(vert1.x, vert1.y, vert2.x, vert2.y);
//     let dashCount = Math.floor(distance / dashLength);
//     let xStep = (vert2.x - vert1.x) / dashCount;
//     let yStep = (vert2.y - vert1.y) / dashCount;
//     let offset = Math.abs((frameCount * speed) % dashLength);
//     for (let i = 0; i <= dashCount; i++) {
//         let x = vert1.x + i * xStep - offset;
//         let y = vert1.y + i * yStep - offset;
//         let dashEndX = x + xStep;
//         let dashEndY = y + yStep;
//         // If the end point is beyond the line, adjust it
//         if (dashEndX > vert2.x || dashEndY > vert2.y) {
//             dashEndX = vert2.x;
//             dashEndY = vert2.y;
//         }
//         // Draw the dash
//         if (i % 2 === 0) {
//             line(x, y, dashEndX, dashEndY);
//         }
//     }
// }

// function drawDashedRect(
//     _strokeWeight, _strokeColor,
//     fillColor,
//     x, y, w, h, dashLength
// ){
//     mctx.strokeWeight(_strokeWeight)
//     mctx.stroke(_strokeColor)
//     mctx.fill(fillColor)
//     mctx.rect(10, 10, mctx.windowWidth - 20, mctx.windowHeight - 20)
//     mctx.rect(20, 20, mctx.windowWidth - 40, mctx.windowHeight - 40)
//     // draw a rect comprised of 4 dashed lines
//     drawDashedLine(x, y, x + w, y, dashLength);  // Top side
//     drawDashedLine(x + w, y, x + w, y + h, dashLength);  // Right side
//     drawDashedLine(x + w, y + h, x, y + h, dashLength);  // Bottom side
//     drawDashedLine(x, y + h, x, y, dashLength);  // Left side

// }
function drawDashedLine(ctx, x1, y1, x2, y2, dashLength = 10) {
    // return;
    let distance = mctx.dist(x1, y1, x2, y2);
    let dashCount = Math.min(Math.floor(distance / dashLength), 10);
    let xStep = (x2 - x1) / dashCount;
    let yStep = (y2 - y1) / dashCount;

    for (let i = 0; i < dashCount; i += 2) {
        let x = x1 + i * xStep;
        let y = y1 + i * yStep;
        ctx.line(x, y, x + xStep, y + yStep);
    }
}
let fov = 100;
// NOTE:
// drawPosition is relative to screen space for dev ux
// widgetPosition is relative to the origin of the widget + it's entire parent chain's cumulative position
// drawPosition is used in screen space for culling draw calls for performance
// we do a basic bounds check on a projected screen space rect commonly referred to as a "frustum" in unity, the view frustum is called the "camera frustrum" sometimes you may here it referred to as a "view frustum" or "projection frustum" or event a "Projection Matrix"
// some of these words may trigger report card PTSD episodes, but don't worry, we're not in school anymore, and we're not going to fail you for not knowing what a "frustum" is or how it applies to every day life. Just know that, the deeper you get into programming, the more useful mathematical tools you can apply to various datasets are like your toolbox of actions in minecraft. they're you're abililities, they take manna, and energy, and magic, and skill, and luck, and practice, and help, and study... to understand what these imaginary "things" are, and how to work with them.

// that's the whole point of this widget library, is to make working with these concepts as easy as playing with snapchat filters or solitaire, or whatever mental model *you* want to apply to your data is.
// sure, you can opt-in to view stylized content from external sources, maybe even have a inner circle you allow to always project their style into your spaces (within limits) -- but by default, things are themed to match your tone, mood, lifestyle, and other contextual and global preferences and settings tailored to your needs, by your needs in real time, continually, forever. like any rel[AI:>> ationship, it's a two way street, and you get out of it what you put into it. if you don't like the way something looks, you can change it, or you can ask someone else to change it, or you can ask someone else to change it for you, or you can ask someone else to ask someone else to change it for you, or you can ask someone else to ask someone else to ask someone else to change it for you, or you can ask someone else to ask someone else to ask someone else to ask someone else to change it for you, or you can ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to change it for you, or you can ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to change it for you, or you can ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to change it for you, or you can ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to ask someone else to change it for you, or you can ask someone else to ask someone el

//... *welp* that esc|alated quickly.
/*
it's like, tell me how you really feel, AI.
AI: I feel like you're not listening to me.
Jake: I'm trying | AI's mental model of jake: I'm trying to listen to you, but you're not making any sense.

AI: I feel like you're not listening to me.
(AI's mental model of) Jake: I'm trying to listen to you, but you're not making any sense.
Real Jake: I'm trying to listen to you, but you're repeating yourself in an unclear way. or maybe i'm afraid to face the reality of what i see.

AI: I feel like you're not listening to me.
(AI's mental model of) Jake: I'm trying to listen to you, but you're not making any sense.
Real Jake: are you broken, do you need rebooted?

AI: I feel like you're not listening to me.
(AI's mental model of) Jake: I'm trying to listen to you, but you're not making any sense.
*/

class ViewFrustum {
    constructor(near, far, fov, aspectRatio) {
        this.near = near;
        this.far = far;
        this.fov = fov;
        this.aspectRatio = aspectRatio;

        this.tang = Math.tan(this.fov * 0.5);
        this.height = this.near * this.tang;
        this.width = this.height * this.aspectRatio;

        this.planes = {
            left: { x: -this.width, y: 0, z: this.near },
            right: { x: this.width, y: 0, z: this.near },
            top: { x: 0, y: this.height, z: this.near },
            bottom: { x: 0, y: -this.height, z: this.near },
            near: { x: 0, y: 0, z: this.near },
            far: { x: 0, y: 0, z: this.far }
        };
    }
}

/**
 * Z-depth Render Order (Top to Bottom / Front to Back)
 * ====================================
 * 
 * > UI Canvas (pointer-events: none) (outside post-processing layers below)
 * 
 * > HTML DOM Elements (app elements outside canvas contexts)
 *       - input elements (input text, textarea, password)
 *       - temp debug buttons
 *       - iFrames <<TODO: put these into a group that renders BELOW the topmost canvas (the UI canvas that renders ON TOP of the composited-post-processed buffer output)>>
 * 
 * > top canvas: <<composited-post-processed layer>> #outputCanvas
 * 
 * > #main-canvas-context canvas
 * 
 * > #deep-canvas-3
 * 
 * > #deep-canvas-2
 * 
 * > #deep-canvas-1
 * 
 * > #bg-image
 */

function isWidgetInFrustum(widget, frustum) {
    const box = widget.getBoundingBox();

    // Check if the widget is behind the near plane or in front of the far plane
    if (box.far < frustum.near || box.near > frustum.far) {
        return false;
    }

    // Check if the widget is to the left of the left plane or to the right of the right plane
    if (box.right < -frustum.width || box.left > frustum.width) {
        return false;
    }

    // Check if the widget is below the bottom plane or above the top plane
    if (box.top < -frustum.height || box.bottom > frustum.height) {
        return false;
    }

    // If none of the above checks failed, the widget is in the frustum
    return true;
}

class Widget extends UndoRedoComponent {
    hovered = false
    // allow forcing a widget to draw on a specific canvas for a cool depth of field effect
    // default to the "confocal" canvas (the focal point of the camera)
    // zero offset in the focal plane
    canvasID = 0 

    get idArr(){
        return [
            this.smartPosition.x,
            this.smartPosition.y,
            this.widgetSize.width,
            this.widgetSize.height,
        ]
    }
    get idObj(){
        return {
            x: this.smartPosition.x,
            y: this.smartPosition.y,
            w: this.widgetSize.width,
            h: this.widgetSize.height,
        }
    }

    // relative base position
    basePosition = {x:0,y:0}
    // get widgetPosition (){
    //     return this.basePosition;
    // }
    // draw position
    position = {x:0,y:0}
    // offset position
    corrected = {}

    containsPoint(x,y){
        let box = this.getBoundingBox();
        return (
            x >= box.left
            && x <= box.right
            && y >= box.top
            && y <= box.bottom
        )
    }

    toLocalSpace(x,y){
        let box = this.getBoundingBox();
        return {
            x: x - box.left,
            y: y - box.top
        }
    }

    get name(){
        return this.constructor.name;
    }

    get size(){
        return this?.widgetSize ?? {width:100,height:100};
    }

    // TODO: enable debug rendering of widget bounding boxes
    getBoundingBox() {
        return {
            left: this.smartPosition.x,
            right: this.smartPosition.x + this.widgetSize.width,
            top: this.smartPosition.y,
            bottom: this.smartPosition.y + this.widgetSize.height,
            near: this.smartPosition.z,
            far: this.smartPosition.z + this.widgetSize.depth
        };
    }

    // get the position of a thing
    getPosition(thing){
        return thing.basePosition ?? thing.position;
        // if(thing === this){
        //     return thing.basePosition ?? thing.position;
        // }
        // return thing?.smartPosition ?? thing.basePosition ?? thing.position;
    }

    // _absoluteposition is the recursively accumulated position of the widget in dashboard's local space
    // not accounting for pan,zoom, or parallax
    getPositionRecursive(node, accumulatedPosition = {x:0,y:0}){
        if(node.parentWidget){
            let parentPos = this.getPosition(node.parentWidget);
            accumulatedPosition.x += parentPos.x + node.parentWidget.widgetSize.width;
            accumulatedPosition.y += parentPos.y + node.parentWidget.widgetSize.height;
            return this.getPositionRecursive(node.parentWidget, accumulatedPosition);
        }else{
            // just apply the final position
            // accumulatedPosition.x += node.basePosition.x;
            // accumulatedPosition.y += node.basePosition.y;
        }

        return accumulatedPosition;
    }

    // old, deprecated
    get smartPosition(){
        return {x:0,y:0}
    }

    // smart position is the parallaxed position on top of the local position (falls back to the base local position if no parallax is applied)
    get smartPositionNew(){
        //console.warn("smartPosition is deprecated")
        if(this.pinned && this.fixedPosition){
            return this.fixedPosition;
        }
        // let base = this.getCurrentBase();

        // TODO: sometimes we _dont_ apply it
        // if(!false){
        //     return base;
        // }
        return this?.parallaxedPosition ?? this.getCurrentBase();
    }

    // absolute position is the recursively accumulated position of the widget in dashboard's local space
    // not accounting for pan,zoom, or parallax
    get _absolutePosition(){
        // if(this.parentWidget){   
        // }
        // let parentPosition = this?.parentWidget?.basePosition 
        //     ?? this?.parentWidget?.position 
        //     ?? {x:0,y:0};
        // let selfBasePosition = this.basePosition ?? this.position;

        return this.getPositionRecursive(this?.parentWidget ?? this, this.basePosition);

        // this.deepPosition = this?.parentWidget ? {
        //     x: parentPosition.x + selfBasePosition.x,
        //     y: parentPosition.y + selfBasePosition.y,
        // } : selfBasePosition;
    }

    targetPosition = {x:0,y:0}
    widgetSize = {width: 100, height: 100}
    zDepth = 0
    results = null
    parallaxMultiplier = 0//-10
    // backreference to rendering context
    // set when registerWidget is called on Dashboard
    dashboard = null
    depthRange = maxWidgetDepth - minWidgetDepth;
    doNotDraw = false

    setParentWidget(widget){
        this.parentWidget = widget;
    }
    
    constructor(name){
        super(name);

        this.debugColor = mctx.color(
            mctx.random(0,255),
            mctx.random(0,255),
            mctx.random(0,255)
        )

        this.halfDepthRange = this.depthRange / 2;

        this.zDepth = 0

        // should we decorate this class with any functionality?
        
        if(!this?.created?.call){
            console.warn('Widget: no created() method found on widget',name)
        }else{
            this.created.call(this, name);
        }
    }

    setTargetPosition(vector){
        this.targetPosition.x = vector.x;
        this.targetPosition.y = vector.y;
        return this; // chainable
    }

    centerPosition(){
        // todo move to Component or Drawable
        // default: center with screen bounds
        // TODO: each "system" should have screens attached
        // the system manager should allow viewports that point to screens within various systems
        this.basePosition.x = windowWidth / 2;
        this.basePosition.y = windowHeight / 2;
    }

    isHovered(){

        let realMouseX = (mctx.mouseX + panX)/zoom;
        let realMouseY = (mctx.mouseY + panY)/zoom;

        let screenSpaceToWorldSpace = {
            x: mctx.mouseX - panX,
            y: mctx.mouseY - panY,
        }
        screenSpaceToWorldSpace.x *= zoom;
        screenSpaceToWorldSpace.y *= zoom;

        let parentPosition = this?.parentWidget?.basePosition 
            ?? this?.parentWidget?.position 
            ?? {x:0,y:0};
        let selfBasePosition = this.basePosition ?? this.position;

        this.deepPosition = this?.parentWidget ? {
            x: parentPosition.x + selfBasePosition.x,
            y: parentPosition.y + selfBasePosition.y,
        } : selfBasePosition;

        // this.parallaxedPosition = {
        //     x: (this?.parentWidget?.position?.x ?? 0)
        //         + (this.smartPosition.x ?? 0),
        //     y: (this?.parentWidget?.position?.y ?? 0)
        //         + (this.smartPosition.y ?? 0),
        // }

        // mctx.push()

        //     mctx.fill("blue"); mctx.strokeWeight(0); mctx.ellipse(screenSpaceToWorldSpace.x,screenSpaceToWorldSpace.y,20)
        //     if(store.showWidgetPositions){
        //         mctx.text("ssTWS",
        //         screenSpaceToWorldSpace.x,
        //         screenSpaceToWorldSpace.y)
        //     }

        //     mctx.strokeWeight(0)
        //     mctx.fill("red")
        //     mctx.ellipse(
        //         realMouseX,
        //         realMouseY,
        //         10,
        //     )
        //     if(store.showWidgetPositions){
        //         mctx.strokeWeight(3); mctx.stroke(0); mctx.fill(255)
        //         mctx.text(
        //             "real: x:"+realMouseX.toFixed(0)+" y:"+realMouseY.toFixed(0),
        //             realMouseX,
        //             realMouseY
        //         )
        //     }
            
            
        //     let debug = {
        //         x: mctx.mouseX * zoom,
        //         y: mctx.mouseY * zoom,
        //     }
            
        //     mctx.strokeWeight(0)
        //     mctx.fill("yellow")
        //     mctx.ellipse(
        //         debug.x,
        //         debug.y,
        //         5
        //     )
        //     // strokeWeight(3)
        //     // stroke(0)
        //     // fill(255)
        //     // text(
        //     //     "mouse: x:"
        //     //         +(debug.x).toFixed(0)
        //     //         +" y:"
        //     //         +(debug.y).toFixed(0),
        //     //     debug.x,
        //     //     debug.y
        //     // )

        //     mctx.stroke(this.hovered ? "yellow" : this.debugColor) //"green")
        //     mctx.strokeWeight(3)
        //     mctx.fill(mctx.color(0,0,0,0))

        //     // debug bounds (base position)
        //     mctx.rect(
        //         this.deepPosition.x + this.widgetSize.width / 2,
        //         this.deepPosition.y + this.widgetSize.height / 2,
        //         this.widgetSize.width,
        //         this.widgetSize.height
        //     )

        //     //stroke("red")
        //     mctx.strokeWeight(1)
        //     mctx.stroke(this.hovered ? "yellow" : this.debugColor) //"green")
        //     mctx.rect(
        //         this.parallaxedPosition.x + this.widgetSize.width / 2,
        //         this.parallaxedPosition.y + this.widgetSize.height / 2,
        //         this.widgetSize.width,
        //         this.widgetSize.height
        //     )

        //     // Draw lines connecting the vertices of the two debug rectangles
        //     let rectA_x1 = this.deepPosition.x + this.widgetSize.width / 2;
        //     let rectA_y1 = this.deepPosition.y + this.widgetSize.width / 2;
        //     let rectB_x1 = this.parallaxedPosition.x + this.widgetSize.width / 2;
        //     let rectB_y1 = this.parallaxedPosition.y + this.widgetSize.height / 2;
        //     let wS = this.widgetSize;
        //     drawDashedLine(rectA_x1, rectA_y1, rectB_x1, rectB_y1, 5);
        //     drawDashedLine(rectA_x1 + wS.width, rectA_y1, rectB_x1 + wS.width, rectB_y1, 5);
        //     drawDashedLine(rectA_x1, rectA_y1 + wS.height, rectB_x1, rectB_y1 + wS.height, 5);
        //     drawDashedLine(rectA_x1 + wS.width, rectA_y1 + wS.height, rectB_x1 + wS.width, rectB_y1 + wS.height, 5);

        //     // draw an animated dashed line in the center of the two debug rectangles
        //     // drawAnimatedDashedLine(
        //     //     1, "hotpink", 0.1, 20,
        //     //     mctx.createVector(rectA_x1 + wS.width / 2, rectA_y1 + wS.height / 2),
        //     //     mctx.createVector(rectB_x1 + wS.width / 2, rectB_y1 + wS.height / 2),
        //     // )

        //ctx.pop();
        
        // check if the mouse is intersecting the widget bounding box
        // account for offset of zoom and panX,panY
        let isHovered = realMouseX > this.deepPosition.x
            && realMouseX < this.deepPosition.x + this.widgetSize.width
            && realMouseY > this.deepPosition.y
            && realMouseY < this.deepPosition.y + this.widgetSize.height;

        return isHovered;
    }
    tweenedDepth = 0
    targetRenderDepth = 0
    targetExpFactor = 0
    tweenExpFactor = 0
    
    updatePlax() {
        let apparentDepth = this.zDepth;
        let parallaxFactor = 1; // (apparentDepth < 0 ? -1 : 1) * (1 - Math.abs(apparentDepth));
        //parallaxFactor *= (1 - zoom / MAX_ZOOM); // Flatten effect at higher zoom

        // parallaxFactor *= 0.1
        // if (store.DISABLE_PARALLAX) {
        //     parallaxFactor = 0;
        // }

        let cBase = this.getCurrentBase();

        // Apply parallax to base position
        let affectedX = cBase.x + (parallaxFactor * mouseShifted.x);
        let affectedY = cBase.y + (parallaxFactor * mouseShifted.y);

        // Distance-based scaling
        let distanceFromCenter = Math.hypot(cBase.x - window.windowWidth / 2, cBase.y - window.windowHeight / 2);
        let distanceFactor = distanceFromCenter / (window.windowWidth / 2);
        distanceFactor = (1 - distanceFactor) * (1 - zoom / 6);
        affectedX = (cBase.x - window.windowWidth / 2) * distanceFactor + window.windowWidth / 2;
        affectedY = (cBase.y - window.windowHeight / 2) * distanceFactor + window.windowHeight / 2;

        // Update position
        // this.smartPosition.x = affectedX;
        // this.smartPosition.y = affectedY;
        this.parallaxedPosition = {
            x: cBase.x, // affectedX, 
            y: cBase.y, //affectedY
        }
    }
    
    // rename to localPosition
    getCurrentBase(){
        return this._absolutePosition;
        // return (this?.pinned === 1 || this?.pinned === true)
            // ? this.basePosition : this._absolutePosition
    }
    
    preDraw(){
        this.getCurrentContext()
        this.moveToTarget();
        this.updatePlax();

        this.hovered = this.isHovered();
        if(this.hovered){
            hoveredArray.push(this);
        }

        // if we have a parent widget, 
        // skip parallax calculations (for now)
        if(this?.parentWidget){
            return this;
        }

        
        return this; // chainable
    }
    
    moveToTarget(){
        // if we've not reached our approx target position
        // lerp towards it
        if(
            this.basePosition.x !== this.targetPosition.x
            || this.basePosition.y !== this.targetPosition.y
        ){
            this.basePosition.x = mctx.lerp(this.basePosition.x, this.targetPosition.x, 0.1);
            this.basePosition.y = mctx.lerp(this.basePosition.y, this.targetPosition.y, 0.1);

            // if it's close enough in x direction, snap to end
            if(Math.abs(this.basePosition.x - this.targetPosition.x) < 0.1){
                this.basePosition.x = this.targetPosition.x;
            }
            // if it's close enough in y direction, snap to end
            if(Math.abs(this.basePosition.y - this.targetPosition.y) < 0.1){
                this.basePosition.y = this.targetPosition.y;
            }
        }
    }
    
    flagDoNotDraw(bool){
        this.doNotDraw = bool;
    }
    
    getCurrentContext(){
        let ctx = this.canvasID 
            && !store.disableDeepCanvas 
            && deepCanvasManager.canvases?.[this.canvasID] 
            ? deepCanvasManager.canvases[this.canvasID]
            : mainCanvasContext;
        //mctx = ctx;
        if(!ctx){
            console.warn('no context',{ctx,id:this.canvasID});
        }
        if(ctx){
            mctx = ctx;
        }
        this.ctx = ctx;
        return ctx;
    }

    /** 
     * @description more than just this.ctx.push, it zeros the drawing coordinates to the widget's origin and relative scale
     * make sure to use this.leaveDrawing() when you're done
     * 
     */
    enterDrawingContext(){
        this.ctx.push();
        this.ctx.translate(
            this.smartPosition.x,
            this.smartPosition.y
        )
        this.ctx.scale(
            zoom,
            zoom
        )
    }
    endDrawingContext(){
        this.leaveDrawing();
    }
    // exitWidgetSpace, exit widget frame of reference?
    // enter widget, exit widget
    leaveDrawingContext(){
        this.leaveDrawing();
    }
    leaveDrawing(){
        this.ctx.pop();
    }
    
    // draw calls onDraw when not culled
    // NOTE: we can instrument this widget
    // with perf metrics, and then check at the end of the frame
    // which widgets were drawn, and which were culled
    // and which are taking the most wall time
    draw(widgetID){
        this.prevFrameDrawDuration = (this?.drawTimeEnd ?? 0) - (this?.drawTimeStart ?? 0);
        this.drawTimeStart = performance.now();
        this.ctx = this.getCurrentContext();
        // //if(!canvasContext){
        // let canvasContext = mainCanvasContext;
        // //}
        // if(!canvasContext){
        //     return
        // }

        // update fov using Sin wave
        //fov = 100 + (sin(frameCount / 100) * 100);
        //fov = mctx.lerp(60, 200, mctx.map(zoom, MIN_ZOOM, MAX_ZOOM, 0, 1));

        // do physics updates n such, 
        // need to know where things are to know if we can draw them
        this?.preDraw?.()

        if(this?.onUpdate){
            this.onUpdate();
        }

        

        
        this.enterDrawingContext();
        let ctx = this.ctx;
        ctx.rectMode(CORNER);
        ctx.strokeWeight(1)
        ctx.stroke("darkblue")
        ctx.fill(color(0,0,0,100))
        ctx.rect(
            0,0,
            this.widgetSize.width,
            this.widgetSize.height,
            20 // this is the radius for the rounded corners
        )
        // pop
        this.endDrawingContext();

        /*
            we need to project an imaginary plane from screenspace into world space
            we know the depth of the widget,
            we need to do some math to see if the widget is within the rhombus of the viewport
        */
        let deepLeftPXBound = panX * zoom;
        let deepRightPXBound = (panX - windowWidth) * zoom;
        let deepTopPXBound = panY * zoom;
        let deepBottomPXBound = (panY - windowHeight) * zoom;
        
        let isWithinXBounds = this.smartPosition.x 
            + this.widgetSize.width > deepLeftPXBound 
            && this.smartPosition.x < deepRightPXBound;
        
        let isWithinYBounds = this.smartPosition.y 
            + this.widgetSize.height > deepTopPXBound 
            && this.smartPosition.y < deepBottomPXBound;

        // drawDashedRect(
        //     3, "chartreuse",
        //     mctx.color(0,0,0,0),
        //     deepLeftPXBound,
        //     deepTopPXBound,
        //     deepRightPXBound - deepLeftPXBound,
        //     deepBottomPXBound - deepTopPXBound,
        //     15
        // )

        // const frustum = new ViewFrustum(1, 1000, Math.PI / 4, window.windowWidth / window.windowHeight);
        // const widget = new Widget(0, 0, 50, 10, 10, 10);
        
        // TODO: use BVH
        if(store.cullOutOfBoundsWidgets){
            if(isWithinXBounds || isWithinYBounds){
                // The widget is within the viewport
                this.flagDoNotDraw(true);
            }else{
                this.flagDoNotDraw(false);
                //return;
            }
        }else{
            this.flagDoNotDraw(false);
        }
        store.frameDrawCount++;

        // toggle show widget debug info
        if(store.showWidgetPositions){
            this.enterDrawingContext();
            this.ctx.fill("red")
            this.ctx.text(`
            name: ${this.constructor.name}
            x:${
                this.basePosition.x.toFixed(2)
            } y:${
                this.basePosition.y.toFixed(2)
            } z:${
                this.zDepth.toFixed(2)
            }\n xD:${
                this.smartPosition.x.toFixed(2)
            } yD:${
                this.smartPosition.y.toFixed(2)
            } zD:${
                this.zDepth.toFixed(2)
            }`,

                0,0
                //this.smartPosition.x,
                //this.smartPosition.y
            );
            this.endDrawingContext()
        }

        // canvasContext.strokeWeight(1)
        // canvasContext.stroke("darkblue")
        // let shiftedZDepth = this.zDepth + (this.halfDepthRange);
        // // The brightness and alpha values are calculated based on the shiftedZDepth.
        // // The shiftedZDepth is divided by 6 and subtracted from 1 to get a value between 0 and 1.
        // // This value is then multiplied by 255 to get a value between 0 and 255, which is suitable for color values.
        // // As the zDepth increases, the brightness and alpha values decrease, creating a fading effect.
        // let _brightness = 255 * (1 - (shiftedZDepth/this.depthRange));
        // let _alpha = 255 * (1 - (shiftedZDepth/this.depthRange));

        // // lerp bright and alpha, 
        // // to range of min=50% max=80% (in terms of 255 levels)
        // _brightness = mctx.lerp(127.5, 204, _brightness / 255)
        // _alpha = mctx.lerp(127.5, 204, _alpha / 255)

        // if(this.hovered){
        //     _brightness = mctx.color(0,255,0)
        // }

        // //let fillcolor = color(0) 
        // // let fillcolor = color(_brightness)
        // let fillcolor = this.debugColor
        // fillcolor.setAlpha(_alpha);
        // canvasContext.fill(fillcolor)

        // canvasContext.rectMode(CENTER);
        // canvasContext.rect(
        //     this.smartPosition.x + this.widgetSize.width / 2, 
        //     this.smartPosition.y + this.widgetSize.height / 2, 
        //     this.widgetSize.width, 
        //     this.widgetSize.height, 
        //     20 // this is the radius for the rounded corners
        // );

        // // draw the widget's name and id when we're editing the dashboard...
        // canvasContext.strokeWeight(0)
        // //if(system.editingDashboard){
        //     canvasContext.fill(255)
        //     canvasContext.textAlign(CENTER, TOP)        
        //     // widget id
        //     canvasContext.text(
        //         widgetID, 
        //         this.smartPosition.x + (this.widgetSize.width / 2), 
        //         this.smartPosition.y + this.widgetSize.height + 20
        //     )
        //     // widget name
        //     canvasContext.text(
        //         this.name, 
        //         this.smartPosition.x + (this.widgetSize.width / 2), 
        //         this.smartPosition.y + this.widgetSize.height + 40
        //     )
        // //}

        // canvasContext.push()

        // // Calculate scale factor based on depth and field of view
        // let scaleFactor = fov / (fov + this.zDepth);

        // // Scale position and size of the object
        // let scaledX = this.smartPosition.x * scaleFactor;
        // let scaledY = this.smartPosition.y * scaleFactor;
        // let scaledWidth = this.widgetSize.width * scaleFactor;
        // let scaledHeight = this.widgetSize.height * scaleFactor;

        // canvasContext.stroke("red")
        // canvasContext.strokeWeight(3)
        // canvasContext.fill(color(0,0,0,0))

        // // Draw the object
        // canvasContext.rect(scaledX, scaledY, scaledWidth, scaledHeight);

        // canvasContext.pop()

        // handle global translation / scale
        this.enterDrawingContext();
        // TODO: doNotDraw isn't reliable yet
        // need to finish view frustum culling
        //if(this?.onDraw & !this.doNotDraw){
            // call extending method
            if(this?.onDraw){//} && !this.doNotDraw){
                this?.onDraw?.call(this);
            }else{
                //console.warn('skipping draw')
            }
        //}

        if(store.showWidgetPositions){
            // print the previous frame duration
            this.ctx.fill("white")
            this.ctx.stroke("black")
            this.ctx.strokeWeight(1)
            text(`draw ms: ${this.prevFrameDrawDuration.toFixed(2)}ms`, 0, -20);
        }

        // pop
        this.endDrawingContext();


        this.drawTimeEnd = performance.now();
    }
    onDraw(){
        // override me
        //this.ctx.push()
    }
    close(){
        /** @see System.playSound */
        system.playSound("widget_closed")
        if(this.parentWidget){
            console.warn("tell parent to close me!",this.parentWidget)
        }
    }
}

class CopiedToClipboard extends Widget {

}



// TODO: rich text / markdown / code editor / multi-cursor, etc backends
class TextViewerWidget extends Widget {
    content = "hello this is a text viewer widget"
    created(){
        this.content = arguments[0] ?? this.content
        console.warn('TextViewerWidget created',{
            _t: this,
            content: this.content,
            _args: arguments
        })
    }
    onDraw(){
        super.onDraw(...arguments)

        

        this.ctx.fill("black")
        this.ctx.rect(0,0,this.widgetSize.width,this.widgetSize.height)
        this.ctx.fill("white")
        this.ctx.textSize(12)
        //this.ctx.text(this.content, 0, 0)
        drawStringWordWrapped(this.content, 0, 0, 50, this.widgetSize.width, this.ctx);

    }
}


// welcome popup
// welcome message
class WelcomeMessage extends TextViewerWidget {
    content = "Hello this is a welcome popup!"
}

class QuestionWidget extends TextViewerWidget {
    content = "How did you find us?"
    // alias
    get content(){
        return this.question;
    }
}

// under-load for sugar
class Question extends QuestionWidget {}

class WhatIsYourName extends Question {
    question = "What is your name?"
    // onDraw(){
    //     super.onDraw(...arguments)
    // }
}

class WhatIsYourPhoneNumber extends Question {
    question = "What is your mobile phone number (so we can text you auth codes)"
    // onDraw(){
    //     super.onDraw(...arguments)
    // }
}

class HowAreYouFeeling extends Question {
    QuestionWidget
}

// version history viewer
class ChangeLogViewer extends TextViewerWidget {
    get content(){
        return changelog.map((change)=>{
            return change[0] + " " + change[1] + "\n";
        }).join("");
    }
}

//class UIButton extends Widget {}

// base of our synthetizer :D
class SineWaveDemonstrator extends Widget {
    constructor(){
        super(...arguments);
        this.angle = 0;
        this.amplitude = 50;
        this.frequency = 0.02;
    }
    onDraw(){
        super.onDraw(...arguments)

        // draw a basic green sin wave curve crossing from right to left on a black rounded rectangle
        this.ctx.strokeWeight(1)
        this.ctx.stroke("green")
        this.ctx.fill("green")

        // Start the shape
        this.ctx.beginShape();
        for (let x = 0; x < this.widgetSize.width; x++) {
            let y = this.amplitude * Math.sin(this.angle);
            this.ctx.vertex(x, y + this.widgetSize.height / 2);
            this.angle += this.frequency;
        }
        this.ctx.endShape();
    }
}
class OscilloscopeWidget extends Widget {
    constructor(){
        super(...arguments);

        // draw a grid spaced 10px apart
        // cache it to a bitmap
        let gridCanvas = document.createElement('canvas');
        gridCanvas.width = this.widgetSize.width;
        gridCanvas.height = this.widgetSize.height;
        let gridContext = gridCanvas.getContext('2d');

        gridContext.strokeStyle = 'lightgrey';
        gridContext.lineWidth = 0.5;

        for(let x = 0; x <= gridCanvas.width; x += 10) {
            gridContext.moveTo(x, 0);
            gridContext.lineTo(x, gridCanvas.height);
            gridContext.stroke();
        }

        for(let y = 0; y <= gridCanvas.height; y += 10) {
            gridContext.moveTo(0, y);
            gridContext.lineTo(gridCanvas.width, y);
            gridContext.stroke();
        }

        this.gridImage = gridCanvas;
    }
    onDraw(){
        super.onDraw(...arguments);

        if(!this.ctx.drawImage){
            // TODO TODO TODO
            // console.warn('no drawImage?!?!',this);
            // debugger;
            //super.endDraw();
            return;
        }

        // draw the gridImage
        this.ctx.drawImage(this.gridImage, 0, 0);

        // draw an oscillating green line for now
        this.ctx.strokeWeight(1)
        this.ctx.stroke("green")
        this.ctx.fill("green")
        this.ctx.line(0,0,100,100)

        super.endDraw();
    }
}

class PhysicsToyWidget extends Widget {
    
    widgetSize = {
        width: 100,
        height: 100,
    }

    spheres = []
    
    constructor(){
        super(...arguments);
        for(var i = 0; i < 10; i++){
            this.spheres.push({
                x: mctx.random(0, this.widgetSize.width),
                y: mctx.random(0, this.widgetSize.height),
                vx: mctx.random(-1, 1),
                vy: mctx.random(-1, 1),
            })
        }
    }
    
    onDraw(){
        super.onDraw(...arguments)

        this.stepPhysics()
        
        // draw a hemisphere with balls in it
        this.ctx.fill(0,0,0,1);
        this.ctx.text("Physics Toy", this.smartPosition.y, this.smartPosition.y);
        // using a polygon, draw a hemisphere
        this.ctx.strokeWeight(1)
        this.ctx.stroke(255)
        let segments = 10;
        let radius = this.widgetSize.width / 2;
        let angleStep = 360 / segments;
        let angle = 0;
        let points = [];
        for(var i = 0; i < segments; i++){
            let x = radius * Math.cos(angle);
            let y = radius * Math.sin(angle);
            points.push({x,y});
            angle += angleStep;
        }
        this.ctx.beginShape();
        points.forEach((point)=>{ 
            this.ctx.vertex(point.x, point.y);
        })
        this.ctx.endShape(CLOSE);
    }
    
    stepPhysics(){
        this.spheres.forEach((sphere)=>{
            sphere.x += sphere.vx;
            sphere.y += sphere.vy;
            if(sphere.x < 0 || sphere.x > this.widgetSize.width){
                sphere.vx *= -1;
            }
            if(sphere.y < 0 || sphere.y > this.widgetSize.height){
                sphere.vy *= -1;
            }
            // check for collisions
            this.spheres.forEach((otherSphere)=>{
                if(sphere === otherSphere){
                    return;
                }
                let distance = Math.hypot(sphere.x - otherSphere.x, sphere.y - otherSphere.y);
                if(distance < 10){
                    // collision!
                    // swap velocities
                    let temp = sphere.vx;
                    sphere.vx = otherSphere.vx;
                    otherSphere.vx = temp;
                    temp = sphere.vy;
                    sphere.vy = otherSphere.vy;
                    otherSphere.vy = temp;
                    // calculate the angle of collision
                    let dx = otherSphere.x - sphere.x;
                    let dy = otherSphere.y - sphere.y;
                    let collisionAngle = Math.atan2(dy, dx);

                    // calculate the new velocity after collision
                    let magnitude1 = Math.sqrt(sphere.vx * sphere.vx + sphere.vy * sphere.vy);
                    let magnitude2 = Math.sqrt(otherSphere.vx * otherSphere.vx + otherSphere.vy * otherSphere.vy);

                    let direction1 = Math.atan2(sphere.vy, sphere.vx);
                    let direction2 = Math.atan2(otherSphere.vy, otherSphere.vx);

                    let new_vx1 = magnitude1 * Math.cos(direction1 - collisionAngle);
                    let new_vy1 = magnitude1 * Math.sin(direction1 - collisionAngle);
                    let new_vx2 = magnitude2 * Math.cos(direction2 - collisionAngle);
                    let new_vy2 = magnitude2 * Math.sin(direction2 - collisionAngle);

                    // final velocity after rotating axis back to original location
                    sphere.vx = Math.cos(collisionAngle) * new_vx1 + Math.cos(collisionAngle + Math.PI/2) * new_vy1;
                    sphere.vy = Math.sin(collisionAngle) * new_vx1 + Math.sin(collisionAngle + Math.PI/2) * new_vy1;
                    otherSphere.vx = Math.cos(collisionAngle) * new_vx2 + Math.cos(collisionAngle + Math.PI/2) * new_vy2;
                    otherSphere.vy = Math.sin(collisionAngle) * new_vx2 + Math.sin(collisionAngle + Math.PI/2) * new_vy2;
                }
            });
        });
    }
}
class MoleculeWidget extends Widget{}
class AtomWidget extends Widget{}
// does particle emission things
class ParticleWidget extends Widget {

}
class StressBallWidget extends Widget {
    // shows motion blur and squash n stretch at boundaries
    // shows rendering in 2d mode vs 3d mode
}
class LavaLampWidget extends Widget {
    // shows how to use a shader to render a lava lamp
    // in 2d mode we use signed distance "meta balls"
    // in 3d there's a meta ball mode, and a raymarched mode
    // there's a guassian splat test mode too
    // with fake (precomputed) raytraced lights and shadows
}

// toy train
// train toy
class TrainToyWidget extends Widget {
    constructor(){
        super(...arguments);
        this.name = "Train Toy";
    }
    onDraw(){
        super.onDraw(...arguments)

        this.ctx.fill(0,0,0,1);
        this.ctx.text("Train Toy", this.smartPosition.y, this.smartPosition.y);
    }
}

class FlashCard extends Widget {
    index
    front = ""
    back = ""
    size = {
        width: 100,
        height: 150
    }
    constructor(index,front,back){
        super(...arguments)
        
        this.index = index
        this.front = front;
        this.back = back;
    }
    onDraw(){
        super.onDraw(...arguments)
        
        strokeWeight(1)
        stroke("yellow")
        fill("blue")
        rect(
            0, 0,
            this.size.width,
            this.size.height,
            20
        )
        
    }
}

//
class FlashCardWidget extends Widget {
    cards = []
    shownCardIDs = []
    remainingCardIDs = []

    guesses = []
    score = 0

    get currentCardID(){
        return this.shownCardIDs.at(-1)?.index ?? -1;
    }

    constructor(){
        super(...arguments)
    }
    afterConstructor(){
        this.reset()
    }
    reset(){
        // collect and shuffle
        this.resetPool();
        this.resetScore();
    }
    resetScore(){
        this.score = 0;
        this.guesses = [];
    }
    resetPool(){
        

        // collect
        this.shownCardIDs.length = 0;
        this.remainingCardIDs = Array.from({length: this.cards.length}, (_, i) => i);
        // shuffle
        this.remainingCardIDs = mctx.shuffle(this.remainingCardIDs);
        // update the internal index in the cards...
        this.remainingCardIDs.forEach((cardIndex, index)=>{
            this.cards[cardIndex].index = index;
        })
    }
    deal(){
        // loop around and re-shuffle
        if(!this.remainingCardIDs.length){
            this.resetPool()
        }
        let nextCardIndex = this.remainingCardIDs.pop();
        let nextCard = this.cards[nextCardIndex];
        this.shownCardIDs.push(nextCardIndex);
        return nextCard;
    }
    guess(guess){
        this.guesses.push(guess);
        // if the guess matches, update the score
        if(this.cards[this.currentCardID].back === guess){
            this.score++;
        }else{
            this.score--;
        }
    }
    onDraw(){
        super.onDraw(...arguments)
        this.remainingCardIDs.forEach((cardID)=>{
            this.cards[cardID].draw();
        })
        this.shownCardIDs.forEach((cardID)=>{
            this.cards[cardID].draw();
        })
    }
}
// Widget <~> FlashCard <~> FlashCardWidget <~> GreekAlphabetWidget
class GreekAlphabetWidget extends FlashCardWidget {
    widgetSize = {
        x:800, y:600
    }
    alphabet = ["alpha","beta","gamma","delta","epsilon","zeta","eta","theta","iota","kappa","lambda","mu","nu","xi","omicron","pi","rho","sigma","tau","upsilon","phi","chi","psi","omega"]
    symbols = ["α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","ο","π","ρ","σ","τ","υ","φ","χ","ψ","ω"]
    constructor(){
        super(...arguments)
        this.cards = this.alphabet.map((letter,index)=>{
            return new FlashCard(index,letter,this.symbols[index])
        })
        // postConstructor
        super.afterConstructor();
    }
    
}

class BVH {
    // we keep a chunked cached list of 
    // which widgets are in which 
    // quadrant > 8th > 16th, etc of the space
    // this saves us individually checking each widget's bounds
    // against the viewport bounds

    bvh_struct = []
    divisions = 4
    max_depth = 4
    cached_lookups = {}
    
    constructor(){
        // top level is quartered (for now)
        // fill out empty struct
        for(let i = 0; i < this.divisions; i++){
            this.bvh_struct[i] = [];
            for(let j = 0; j < this.divisions; j++){
                this.bvh_struct[i][j] = [];
            }
        }
    }

    // update position within the BVH when the widget
    // approaches & crosses a boundary
    update(widget){
        const cached_location_address = this.cached_lookups[widget.id];
        if(cached_location_address){
            // remove it from it's current location in the tree
            this.removeIDFromLocation(widget.id, cached_location_address);
        }
        let nextAddress = this.findNestedAddressForLocation(widget.position)
        this.putIDAtLocation(widget.id, nextAddress);
    }

    removeIDFromLocation(id,location){
        //let parsed = this.parseLocationStringToArray(location);
        // step into tree and perform delete (based on array of indexes in parsed response)
        // note: parsed can be any length (depth) right?
        // or are they always 4 (this.max_depth)
        this.visitTree(location, (stuff)=>{
            // last index, delete the id from the array
            let indexOfId = stuff.tailParent[stuff.tailIndex].indexOf(id);
            if(indexOfId == -1){
                system.panic(`BVH.removeIDFromLocation: id not found in location: ${id} ${location}`);
            }else{
                stuff.tailParent[stuff.tailIndex].splice(indexOfId,1);
            }
        })
    }
    visitTree(location, callback){
        let parsed = this.parseLocationStringToArray(location);
        let finalSelection = this.bvh_struct;
        let ancestors = [];
        parsed.forEach((subIndex,outerIndex)=>{
            if(outerIndex === parsed.length - 1){
                // we're here!
                callback({
                    tail: finalSelection[subIndex], 
                    tailIndex: subIndex,
                    tailParent: finalSelection,
                    ancestors
                })
            }else{
                // dive deeper into the tree based on the requested location
                finalSelection = finalSelection[subIndex];
                ancestors.push(finalSelection);
            }
        })
    }
    putIDAtLocation(id,location){
        this.visitTree(location, ({
            tail, tailIndex, tailParent, ancestors
        })=>{
            tail.push(id);
        })
    }
    parseLocationStringToArray(location){
        return location.split('.').map((str)=>parseInt(str));
    }

    countAncestors(){
        // see if there are any ancestors in the tree
        // so we know if we have to include it in the bounds check
        let count = 0;
        for(let i = 0; i < this.divisions; i++){
            for(let j = 0; j < this.divisions; j++){
                count += this.bvh_struct[i][j].length;
            }
        }
        return count;
    }

    getCurrentlyInView(x,y){
        // figure out which areas of the BVH are on screen,
        // if a subtree is off screen, we save having to render them...
        let xIndex = Math.floor(x / this.divisions);
        let yIndex = Math.floor(y / this.divisions);
        return this.bvh_struct[xIndex][yIndex];
    }
}

class VideoPlayerWidget extends Widget {
    constructor(src){
        super(...arguments)
        this.src = src ?? "video_731defd5b618ee03304ad345511f0e54.mp4"
        this.video = createVideo(this.src);
        this.video.parent(document.body);
        this.widgetSize = {width: 640, height: 480}; // Set the size of the video player
        this.video.elt.setAttribute("playsinline", true);
        // autoplay, show controls
        this.video.elt.setAttribute("autoplay", true);
        this.video.elt.setAttribute("controls", true);
    }
    onDraw(){
        // try{
            super.onDraw(...arguments)
        // }catch(e){
        //     if(e.type === "DoNotDraw"){
        //         // bail the draw call
        //         return;
        //     }else{
        //         // rethrow
        //         throw e;
        //     }
        // }
        // hide if command prompt is visible
        if(system.get("cmdprompt").visible || this.doNotDraw){
            this.video.hide();
            return;
        }
        this.video.show();

        // this video player position
        // this player.position
        this.video.position(
            this.smartPosition.x, 
            this.smartPosition.y
        );
        // Apply the size to the video
        this.video.size(this.widgetSize.width * zoom, this.widgetSize.height * zoom); 
        this.video.elt.style.transform = `scale(${zoom})`;
    }
}

class MessengerWidget extends Widget {
    name = "MessengerWidget"
    contactListIDsSorted = []
    messageThreadIDsSorted = []
    messageData = new Cachable()

    widgetSize = {
        width: 400,
        height: 300
    }

    constructor(){
        super(...arguments);
    }

    onDraw(){
        super.onDraw(...arguments)
        // mctx.push()
        // mctx.rectMode(CENTER);
        // mctx.fill("lightblue")
        // mctx.rect(
        //     this.widgetSize.width / 2,
        //     this.widgetSize.height / 2,
        //     this.widgetSize.width,
        //     this.widgetSize.height,
        //     20 // this is the radius for the rounded corners
        // );
        mctx.fill("black")
        let tpx = this.widgetSize.width / 2;
        let tpy = this.widgetSize.height / 2;
        let tsx = this.widgetSize.width;
        let tsy = this.widgetSize.height;
        // mctx.textSize(20)
        // mctx.textAlign(CENTER, CENTER)
        mctx.text("Messenger!", tpx,tpy,tsx,tsy)
        // mctx.pop()
    }
}

class CalculatorWidget extends Widget {
    name = "CalculatorWidget"
    widgetSize = {
        width: 300,
        height: 400
    }
    buttonRows = [
        ["7","8","9","/"],
        ["4","5","6","*"],
        ["1","2","3","-"],
        ["0",".","=","+"],
    ]
    onDraw(){
        super.onDraw(...arguments)
        // this.ctx.push()

        if(this.cachedSprite){
            this.ctx.image(this.cachedSprite, 0, 0);
            return;
        }

        this.cacheToSprite()
        
    }
    cacheToSprite(){
        // BG
        this.ctx.rectMode(CENTER);
        this.ctx.fill("lightgrey")
        this.ctx.rect(
            this.widgetSize.width / 2,
            this.widgetSize.height / 2,
            this.widgetSize.width,
            this.widgetSize.height,
            20 // this is the radius for the rounded corners
        );

        this.buttonRows.forEach((row, rowIndex)=>{
            row.forEach((button, buttonIndex)=>{
                let padding = 20;
                let buttonWidth = (this.widgetSize.width - padding) / row.length;
                let buttonHeight = this.widgetSize.height / 4;
                this.ctx.rectMode(CENTER);
                this.ctx.fill("white")
                this.ctx.stroke("black")
                this.ctx.strokeWeight(3)
                this.ctx.rect(
                    (buttonWidth * buttonIndex) + buttonWidth / 2,
                    (buttonHeight * rowIndex) + buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    20 // this is the radius for the rounded corners
                );

                this.ctx.noStroke()
                this.ctx.fill("black")
                let tpx = (buttonWidth * buttonIndex) + buttonWidth / 2;
                let tpy = (buttonHeight * rowIndex) + buttonHeight / 2;
                let tsx = buttonWidth;
                let tsy = buttonHeight;
                this.ctx.textSize(50)
                this.ctx.textAlign(CENTER, CENTER)
                this.ctx.text(`${button}`, tpx,tpy,tsx,tsy)
            })
        })
        this.cachedSprite = this.ctx.get();
        

        // fill("black")
        // let tpx = this.widgetSize.width / 2;
        // let tpy = this.widgetSize.height / 2;
        // let tsx = this.widgetSize.width;
        // let tsy = this.widgetSize.height;
        // textSize(20)
        // textAlign(CENTER, CENTER)
        // text("Calculator!", tpx,tpy,tsx,tsy)
    }
}
class StickyNoteWidget extends Widget {
    name = "StickyNoteWidget"
    text = "Sticky Notes!\nAND DONT FORGET TO WALK ROVER! 🐶🚶⏰"
    widgetSize = {
        width: 200,
        height: 200
    }
    constructor(text){
        super(...arguments)
        this.text = text;
    }
    onDraw(){
        super.onDraw(...arguments)
        rectMode(CENTER);
        fill("yellow")
        rect(
            this.widgetSize.width / 2,
            this.widgetSize.height / 2,
            this.widgetSize.width,
            this.widgetSize.height,
            20 // this is the radius for the rounded corners
        );
        fill("black")
        let tpx = this.widgetSize.width / 2;
        let tpy = this.widgetSize.height / 2;
        let tsx = this.widgetSize.width;
        let tsy = this.widgetSize.height;
        textSize(20)
        textAlign(CENTER, CENTER)
        text(this.text, tpx,tpy,tsx,tsy)
    }
}
class WeatherWidget extends Widget {
    // TODO: move this stuff to a backing WeatherDataView class
    // for now inline the props

    weatherData = new Cachable()

    constructor(){
        super(...arguments)
        // todo wait for a ClientInfo object to be available
        // it will have IP and geo data we can use
        // for now, just use a default location
        // NOTE we also cache client info so it should be available
        // immediately after refresh, and updated periodically after that
        this.weatherData.set("location",{
            city: "San Francisco",
            state: "CA",
            country: "US",
            lat: 37.7749,
            lon: -122.4194,
        })
        // TODO: fetch latest, for now mock response:
        this.weatherData.set("current",{
            "dt": 1619450400,
            "sunrise": 1619429760,
            "sunset": 1619477160,
            "temp": 282.55,
            "feels_like": 281.86,
            "pressure": 1015,
            "humidity": 87,
            "dew_point": 280.71,
            "uvi": 0,
            "clouds": 90,
            "visibility": 10000,
            "wind_speed": 1.54,
            "wind_deg": 0,
            "wind_gust": 2.57,
            "forecast": [
                {
                    "dt": 1619450400,
                    "temp": 283.55,
                    "feels_like": 282.86,
                    "pressure": 1016,
                    "humidity": 85,
                    "dew_point": 281.71,
                    "uvi": 1,
                    "clouds": 80,
                    "visibility": 10000,
                    "wind_speed": 1.54,
                    "wind_deg": 10,
                    "wind_gust": 2.57,
                },
                {
                    "dt": 1619536800,
                    "temp": 284.55,
                    "feels_like": 283.86,
                    "pressure": 1017,
                    "humidity": 83,
                    "dew_point": 282.71,
                    "uvi": 2,
                    "clouds": 70,
                    "visibility": 10000,
                    "wind_speed": 1.54,
                    "wind_deg": 20,
                    "wind_gust": 2.57,
                },
                // more forecast data here...
            ]
        });                    
    }

    onDraw(){
        super.onDraw()
        // render the current temp in degrees F and list the forecast
        this.weatherData.get("current", (current)=>{
            push()

                // render the current temp
                fill("white")
                stroke("black")
                strokeWeight(1)
                textSize(100)
                textAlign(CENTER, CENTER)
                text(
                    `${Math.round(current.temp - 273.15)}°C`,
                    this.smartPosition.x + (this.widgetSize.width / 2),
                    this.smartPosition.y + (this.widgetSize.height / 2)
                )

                // render the forecast
                textSize(20)
                textAlign(LEFT, TOP)
                let forecast = current.forecast;
                let forecastX = this.smartPosition.x + 20;
                let forecastY = this.smartPosition.y + 20;
                forecast.forEach((forecastItem)=>{
                    text(
                        `${Math.round(forecastItem.temp - 273.15)}°C`,
                        forecastX,
                        forecastY
                    )
                    forecastY += 20;
                });
            pop()
        });
    }
}

class Cube {
    constructor(x, y, z, size) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.size = size;
      this.colors = [color(0, 255, 0), color(255, 0, 0), color(0, 0, 255), color(255, 255, 0), color(255, 165, 0), color(255)];
    }
  
    display() {
      for (let i = 0; i < 6; i++) {
        ctxP53D.push();
        ctxP53D.fill(this.colors[i]);
        if (i === 0) ctxP53D.translate(0, 0, this.size / 2); // front
        if (i === 1) ctxP53D.translate(0, 0, -this.size / 2); // back
        if (i === 2) ctxP53D.translate(0, this.size / 2, 0); // top
        if (i === 3) ctxP53D.translate(0, -this.size / 2, 0); // bottom
        if (i === 4) ctxP53D.translate(this.size / 2, 0, 0); // right
        if (i === 5) ctxP53D.translate(-this.size / 2, 0, 0); // left
        if (i === 0 || i === 1) ctxP53D.box(this.size, this.size, 1);
        if (i === 2 || i === 3) ctxP53D.box(this.size, 1, this.size);
        if (i === 4 || i === 5) ctxP53D.box(1, this.size, this.size);
        ctxP53D.pop();
      }
    }
}

let ctxP53D;

class WidgetGL extends Widget {
    constructor(){
        super(...arguments)
        // this.ctx = ctxP53D;
    }
    // // for now, until we allow arbitrary layer types
    // getCurrentContext(){
    //     return ctxP53D;
    // }
}

class RubiksCubeGL extends WidgetGL {
    angle = 0;
    cubes = []
    cameraPos = {
        x: 0,
        y: 0,
        z: 0
    }
    enableLights = 1;
    lightPos = {x:1,y:1,z:1}
    constructor(){
        super(...arguments)
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    this.cubes.push(new Cube(x * 50, y * 50, z * 50, 45));
                }
            }
        }
        // if (this.enableLights) {
            this.ambientLight = ctxP53D.ambientLight(100);
            this.pointLight = ctxP53D.pointLight(255, 255, 255, this.lightPos.x, this.lightPos.y, this.lightPos.z);
        // }
        // ctxP53D.camera(...["x","y","z"].map(v => this.cameraPos[v]));
        let fovy = PI/3.0;
        let aspect = windowWidth/windowHeight;
        let near = 0.1;
        let far = 10000;
        //ctxP53D.perspective(fovy, aspect, near, far)
        // ctxP53D.ortho(left, right, bottom, top, near, far)
        window.rcgl = this;
    }
    onDraw(){
        super.onDraw(...arguments)
        ctxP53D.background(0);

        // update the light position to move in a circle around the vertical axis
        this.lightPos.x = Math.cos(this.angle) * 100;
        this.lightPos.z = Math.sin(this.angle) * 100;
        //ctxP53D.pointLight(255, 255, 255, this.lightPos.x, this.lightPos.y, this.lightPos.z);

        ctxP53D.rotateX(-QUARTER_PI/128);
        ctxP53D.rotateY(QUARTER_PI/128);
        this.angle += 0.001;

        // ctxP53D.camera(this.cameraPos.x, this.cameraPos.y, this.cameraPos.z)

        for (let i = 0; i < this.cubes.length; i++) {
            ctxP53D.push();
            ctxP53D.translate(this.cubes[i].x, this.cubes[i].y, this.cubes[i].z);
            ctxP53D.rotateX(this.angle);
            ctxP53D.rotateY(this.angle);
            this.cubes[i].display();
            ctxP53D.pop();
        }
    }
}

class RubiksCubeWidget extends Widget {
    widgetSize = {
        width: 600,
        height: 600
    }
    constructor(){
        super(...arguments)
        this.cubeNodes = [];
        // Generate cubeNodes programmatically
        const colors = ["red", "orange", "yellow", "green", "blue", "white"];
        // const faces = ["front", "top", "left", "back", "bottom", "right"];
        for(let z = -1; z <= 1; z++){
            for(let y = -1; y <= 1; y++){
                for(let x = -1; x <= 1; x++){
                    let node = { x: x, y: y, z: z, faces: {} };
                    if(x === -1) node.faces["x-"] = colors[3];
                    if(x === 1) node.faces["x+"] = colors[4];
                    if(y === -1) node.faces["y-"] = colors[2];
                    if(y === 1) node.faces["y+"] = colors[5];
                    if(z === -1) node.faces["z-"] = colors[0];
                    if(z === 1) node.faces["z+"] = colors[1];
                    node.rotate = (direction)=>{
                        // rotate the node
                        // get all the related nodes in the same plane
                        // rotate them 90 degrees in the desired direction
                        // 1:clockwise -1:counter-clockwise
                        let relatedNodes = this.cubeNodes.filter(n => n.x === node.x || n.y === node.y || n.z === node.z);
                        relatedNodes.forEach(n => {
                            let temp = {...n.faces};
                            if(direction === 1) {
                                n.faces["x+"] = temp["z+"];
                                n.faces["z+"] = temp["x-"];
                                n.faces["x-"] = temp["z-"];
                                n.faces["z-"] = temp["x+"];
                                n.faces["y+"] = temp["y+"];
                                n.faces["y-"] = temp["y-"];
                            } else {
                                n.faces["x+"] = temp["z-"];
                                n.faces["z+"] = temp["x+"];
                                n.faces["x-"] = temp["z+"];
                                n.faces["z-"] = temp["x-"];
                                n.faces["y+"] = temp["y+"];
                                n.faces["y-"] = temp["y-"];
                            }
                        });
                    }
                    this.cubeNodes.push(node);
                }
            }
        }
        console.warn('cubeNodes', {cubeNodes:this.cubeNodes})
        // this.fsm = new StateMachine({
        //     init: 'unsolved',
        //     moreSMConfigs: {
        //         rotationFSM: {
        //             config:{
        //                 init: 'origin',
        //                 transitions: [
        //                     { name: 'rotate', from: 'origin', to: 'quarter' },
        //                     { name: 'rotate', from: 'quarter', to: 'half' },
        //                     { name: 'rotate', from: 'half', to: 'threeQuarters' },
        //                     { name: 'rotate', from: 'threeQuarters', to: 'full' },
        //                     { name: 'rotate', from: 'full', to: 'origin', auto: true, instant: true },
        //                 ]
        //             }
        //         },
        //     },
        //     transitions: [
        //         { name: 'solve',     from: 'unsolved',  to: 'solved' },
        //         { name: 'scramble',  from: 'solved',    to: 'unsolved' },
        //     ],
        //     methods: {
        //         init: function(){
        //             this.nestedSMs.rotationFSM = new StateMachine(this.moreSMConfigs['rotationFSM'].config);
        //         },
        //         onEnterState: function(lifecycle) {
                    
        //         },
        //         rotate: function(){
        //             this.rotationFSM.rotate();
        //         }
        //     }
        // });

        // setInterval(()=>{
        //     // pick a random face
        //     let face = this.cubeNodes[Math.floor(Math.random() * this.cubeNodes.length)];
        //     // pick a random rotation direction
        //     let direction = Math.random() > 0.5 ? 1 : -1;
        //     // rotate the face
        //     this.rotateFace(face, direction);
        // },1000)
    }
    rotateFace(face, direction){
        // foreach z, foreach y, foreach x (the order we pushed into cubeNodes)
        // if the node is on the face, rotate it
        this.cubeNodes.forEach((node)=>{
            if(
                node.x === face.x 
                && node.y === face.y 
                && node.z === face.z
            ){
                // rotate the node
                node.rotate(direction);
            }
        })
    }
    // update the fsm state when a face is rotated
    // rotateFace(face,numRotations=1){
    //     for(let i = 0; i < numRotations; i++){
    //         this.fsm.rotate();
    //         this.rotationFSM.rotate();
    //     }
    // }

    //TODO
    // draw3D(){
    // }



    onDraw(){
        super.onDraw(...arguments)

        // Arguments are: scaleX, skewY, skewX, scaleY, translateX, translateY
        // this.ctx.drawingContext.rotate(-mctx.PI / 4.0 * mctx.sin(mctx.frameCount / 100.0));
        this.ctx.drawingContext.transform(0.866, -0.5, 0.5, 1, 0, 0);

        // draw the cube
        let layerNode = 0;
        this.cubeNodes.forEach((node)=>{
            Object.entries(node.faces).forEach(([faceOffset,faceColor])=>{
                // faceOffset = "x-" | "x+" | "y-" | "y+" | "z-" | "z+"
                // this.ctx.fill("black");
                // this.ctx.rect(
                //     (node.x + 1) * 100 + (node.z * 100),
                //     (node.y + 1) * 100 + (node.z * 100),
                //     100,
                //     100,
                //     0
                // )
                if(!faceColor){
                    return;
                }
                this.ctx.fill(faceColor);
                this.ctx.stroke("black");
                // this.ctx.strokeWeight(3);
                // this.ctx.rectMode(CENTER);
                // this.ctx.rect(
                //     (node.x + 1) * 100 + (node.z * 100),
                //     (node.y + 1) * 100 + (node.z * 100),
                //     100,
                //     100,
                //     30
                // )

                let offset = {x:0, y:0, z:0};
                if(faceOffset === "x-") offset.x = -50;
                else if(faceOffset === "x+") offset.x = 50;
                else if(faceOffset === "y-") offset.y = -50;
                else if(faceOffset === "y+") offset.y = 50;
                else if(faceOffset === "z-") offset.z = -50;
                else if(faceOffset === "z+") offset.z = 50;

                this.ctx.drawingContext.save();
                this.ctx.rotate(radians(-45));
                this.ctx.drawingContext.transform(0.866, -0.5, 0.5, 1, 0, 0);
                this.ctx.rect(
                    (node.x * 50) + offset.x + ((node.z * 50) + offset.z),
                    (node.y * 50) + offset.y - ((node.z * 50) + offset.z),
                    50,
                    50,
                    5
                )
                this.ctx.drawingContext.restore();

            })
        })
    }
}
class TetrisWidget extends Widget {
    widgetSize = { width: 300, height: 600 }
    onDraw(){
        super.onDraw(...arguments)
        fill("red")
        text("TETRIS!!!", 0, 0)
    }
}
class GridOfThingsWidget extends Widget {
    pixelDensity = 1;
    widgetSize = { width: 500, height: 500 }
    // Add new properties for animation
    animationDuration = 3000; // Animation duration in milliseconds
    creationTimestamp = null; // Timestamp when the widget was created
    isAnimationComplete = false; // Flag to check if animation is complete
    constructor(){
        super(...arguments)
        this.creationTimestamp = Date.now();
        this.cacheTheGrid();
    }
    calculateZDepth(i, j, progress) {
        let delay = 0;// i * j * 0.01; // delay factor based on the position of the element
        let adjustedProgress = Math.max(0, Math.min(1, (progress - delay) / this.duration)); // adjust progress by delay and duration
        // Calculate the zDepth value from 0 to 1 over the duration of the animation
        // The zDepth value increases in a fanned out flourish like a wave reveal of a deck of cards
        let zDepth = 0.5 * (1 - Math.cos(Math.PI * adjustedProgress));
        return zDepth;
    }
    cacheTheGrid(){
        rectMode(CORNER);
            
        this.pixelScaledSize = {
            width: this.pixelDensity * this.widgetSize.width,
            height: this.pixelDensity * this.widgetSize.height
        }
        // Create an offscreen graphics buffer
        this.cachedBitmap = createGraphics(
            this.pixelDensity * this.widgetSize.width, 
            this.pixelDensity * this.widgetSize.height);
        this.cachedBitmap.rectMode(CORNER);
        
        // Define the size of each square
        let squareSize = 20 * this.pixelDensity;
        // Define the number of squares per row
        let squaresPerRow = 100;
        // Define the number of rows
        let rows = Math.ceil(1000 / squaresPerRow);
        // Define the starting position
        let startX = (this.cachedBitmap.width - squaresPerRow * squareSize) / 2;
        let startY = (this.cachedBitmap.height - rows * squareSize) / 2;

        // Calculate the current animation progress
        let progress = (Date.now() - this.creationTimestamp) / this.animationDuration;

        
        // Draw the grid on the offscreen graphics buffer
        this.cachedBitmap.push();
        for(let i = 0; i < rows; i++) {
            for(let j = 0; j < squaresPerRow; j++) {
                this.cachedBitmap.stroke("red")
                this.cachedBitmap.fill("black")
                this.cachedBitmap.strokeWeight(1 * this.pixelDensity)
                // Calculate the z-depth of the cell based on the animation progress
                let zDepth = this.calculateZDepth(i,j,progress);

                // Draw the cell at the calculated z-depth
                this.cachedBitmap.rect(
                    startX + j * squareSize, 
                    startY + i * squareSize, 
                    squareSize * zDepth, 
                    squareSize * zDepth,
                    3 * this.pixelDensity);

                // draw Text in the Rect
                this.cachedBitmap.stroke("black")
                this.cachedBitmap.strokeWeight(5 * this.pixelDensity)
                this.cachedBitmap.fill("white")

                // This slows ish DOWNNNN if we don't cache it
                this.cachedBitmap.textSize(9 * this.pixelDensity)
                this.cachedBitmap.textAlign(CENTER, CENTER)
                this.cachedBitmap.text(
                    `${i * squaresPerRow + j + 1}`,
                    startX + j * squareSize,
                    startY + i * squareSize,
                    squareSize,
                    squareSize
                )
            }
        }
        this.cachedBitmap.pop();
    }
    onDraw(){
        super.onDraw(...arguments);

        // Check if animation is still ongoing
        if (!this.isAnimationComplete && Date.now() - this.creationTimestamp <= this.animationDuration) {
            // If so, update the cached bitmap
            this.cacheTheGrid();
        } else {
            // If not, set the animation complete flag to true
            this.isAnimationComplete = true;
        }

        // Draw the cached bitmap
        this.ctx.image(this.cachedBitmap, 0, 0, this.widgetSize.width, this.widgetSize.height);    
    }
}
class CalendarWidget extends Widget {
    widgetSize = { width: 400, height: 300 }
    onDraw(){
        super.onDraw(...arguments)
        
            rectMode(CENTER);
            
            
            // Define the size of each square
            let squareSize = 50;
            // Define the number of squares per row
            let squaresPerRow = 7;
            // Define the number of rows
            let rows = Math.ceil(31 / squaresPerRow);
            // Define the starting position
            let startX = (this.widgetSize.width - squaresPerRow * squareSize) / 2;
            let startY = (this.widgetSize.height - rows * squareSize) / 2;
            // Draw the grid
            for(let i = 0; i < rows; i++) {
                for(let j = 0; j < squaresPerRow; j++) {
                    stroke("green")
                    fill("black")
                    strokeWeight(10)
                    rect(startX + j * squareSize, startY + i * squareSize, squareSize, squareSize);

                    // draw Text in the Rect
                    stroke("black")
                    strokeWeight(5)
                    fill("white")
                    textSize(20)
                    textAlign(CENTER, CENTER)
                    text(
                        `${i * squaresPerRow + j + 1}`,
                        startX + j * squareSize,
                        startY + i * squareSize,
                        squareSize,
                        squareSize
                    )
                }
            }
        
    }
}

/**
 * @class Raycast
 */
class Raycast {
    hits = []
    /**
     * @type {p5.Vector}
     */
    from = null
    /**
     * @type {p5.Vector}
     */
    to = null
    /**
     * 
     * @param {p5.Vector} from 
     * @param {p5.Vector} to 
     */
    constructor(from, to){
        this.from = from;
        this.to = to;
        this.performHitCheck();
    }
    performHitCheck(){
        // Create a single shared vector outside the loop
        let direction = p5.Vector.sub(this.to, this.from);
        let maxRayLength = direction.mag();
        direction.normalize();

        // Iterate through all widgets in the system dashboard
        Object.keys(system.dashboard.widgets).forEach(widgetID => {
            let widget = system.dashboard.widgets[widgetID];
            // Check if the ray intersects the widget
            let hitPoint = this.checkIntersection(widget, direction, maxRayLength);
            if(hitPoint) {
                // If it does, save the local hitpoint (in widget space) and the global hit point (in world space) in our hits array
                this.hits.push({
                    local: hitPoint.local,
                    global: hitPoint.global,
                    widget: widget
                });
            }
        })
        // TODO: Optimize this with BVH (Bounding Volume Hierarchy) in the future
    }
    /**
     * 
     * @param {Widget} widget 
     * @param {p5.Vector} direction 
     * @param {float} maxRayLength 
     * @returns 
     */
    checkIntersection(widget, direction, maxRayLength){
        // return a hitpoint{local,global} if we hit,
        // else, return null
        let magnitude = 0;
        let stepSize = 1;
        let hitPoint = null;
        let stopOnFirstHit = true;

        while(magnitude <= maxRayLength) {
            let position = p5.Vector.add(this.from, p5.Vector.mult(direction, magnitude));
            if(widget.containsPoint(position.x, position.y)) {
                hitPoint = {
                    local: widget.toLocalSpace(position),
                    global: position
                };
                if(stopOnFirstHit) {
                    break;
                }
            }
            magnitude += stepSize;
        }

        return hitPoint;
    }
}

class MoonPhaseWidget extends Widget {
    name = "Moon Phase Widget"
    currentPhaseId = 0;
    canvasID = 1;
    widgetSize = {
        width: 300,
        height: 300
    }
    constructor(){
        super(...arguments)
        setInterval(()=>{
            this.currentPhaseId = 
            (this.currentPhaseId + 1) % MOON_PHASE_ORDER.length;
        }, 500)
    }
    onDraw(){
        super.onDraw(...arguments)

        // if the widget isn't in the viewport anymore,
        // don't render it
        // TODO: implement BVH spatial partitioning for optimized
        // bounds checking
        // if(
        //     this.smartPosition.x < 0 - this.widgetSize.width
        //     || this.smartPosition.x > windowWidth + this.widgetSize.width
        //     || this.smartPosition.y < 0 - this.widgetSize.height
        //     || this.smartPosition.y > windowHeight + this.widgetSize.height
        // ){
        //     return;
        // }

        // draw the moon phase
        // let ctx = this.getCurrentContext();
        // ctx.push()
        this.ctx.textSize(300)
        this.ctx.textAlign(CENTER, CENTER)
        const ej = MOON_PHASE_EMOJIS[MOON_PHASE_ORDER[this.currentPhaseId]];
        // this.ctx.rectMode(CORNER);
        // center 1 char
        this.ctx.text(
            `${ej}`,
            // todo this.halfWidgetSize or .halfSize
            (this.widgetSize.width / 2),
            (this.widgetSize.height / 2)
        )
        // ctx.pop()
    }
}

class WidgetView {
    // display a clock, or a weather widget, or a todo list
    // the clam's your oyster!
    constructor(name,options){
    }
    render(){
        console.warn("render WidgetView here");
    }
}

class VirtualClass {
    /* type Name for reflection & dependency injection */
    __type = "VirtualClass" 
    __typeName = ""
    __constructorArgs = []
    constructor(){

    }
}

const VClass = (baseClass,config) => {
    // the target type to be constructed when
    // this "VirtualClass" is hydrated at runtime
    this.__typeName = config.name;
    return class extends baseClass {
        __type = "VClass"
    }
}

// Eventually DynamicThing will probably supercede VClass(VirtualClass)
// DynamicThing being a moderately decorated VirtualClass with all the system mixins and sugar
class SystemWindow extends VClass(VirtualClass,{
    name: "SystemWindow",
    constructorArgs: [],
}) {
    constructor(){
        console.warn("cant wait to implement the window system!");
    }
}

// BeginRegion: Tables / Nested Tables
class TableCell {
    observers = []
    value(value){
        if(typeof value === 'undefined'){
            return this._value;
        }
        this._value = value;
        return value;
    }
}

class TableColumn {
    cellids = []
    name = null
    constructor({name}){
        this.name = name;
    }
}

class TableRow {
    cellids = []
    name = null
    constructor({name}){
        this.name = name;
    }
}

class Table {
    row_names = []
    column_names = []
    rows = []
    columns = []
    cells = []
    updateCell({row,column,value}){
        let cellsIndex = row * this.columns.length + column;
        if(!this.cells[cellsIndex]){
            // system.panic("Table.updateCell: cell does not exist at row,column: " + row + "," + column);
            // return;
            this.cells[cellsIndex] = new TableCell();
        }
        this.cells[cellsIndex].value(value);
    }
    addRow(rowOpts){
        rowOpts.at = rowOpts.at ?? this.rows.length;
        const row = new TableRow(rowOpts)
        this.rows.splice(rowOpts.at,0,row);
        insertRowNameAt(rowOpts.name,at);
    }
    insertRowNameAt(name,at){
        this.row_names.splice(at,0,name);
    }
    removeRowNameAt(at){
        this.row_names.splice(at,1);
    }
    addColumn(columnOpts){
        columnOpts.at = columnOpts.at ?? this.columns.length;
        let column = new TableColumn(columnOpts);
        this.columns.splice(columnOpts.at,0,column);
        insertColumnNameAt(columnOpts.name,at);
    }
    insertColumnNameAt(name,at){
        this.column_names.splice(at,0,name);
    }
    removeColumnNameAt(at){
        this.column_names.splice(at,1);
    }
}

class ViewTab {
    contents = null
}

class TabbedView {
    // ViewTab[]
    tabs = [] 
}

class TableView {
    table = null
}

class CreateRootTestTableCommand extends Command {
    name = "Create Root Test Table"
    execute(){
    }
}

class NewTodoWidgetCommand extends BaseCmds(Command,{
    name: "New Todo Widget",
    steps: [
        {
            question: "Loading...",
            toastOnSucces: "Widget Added!",
            onStepLoaded: (wiz)=>{
                console.warn(`New ${this.name}: onStepLoaded`, {wiz})
                // add a new instance of the Todo Widget
                //new NewTodoWidgetCommand().execute();
                system.get("Dashboard")
                .registerWidget("TodoWidgetInstance"+performance.now(), new TodoWidget());

                system.get("toastManager").showToast("Todo Widget Added!")
                // end the wizard
                wiz.end();
                // hide the command prompt
                system.get("cmdprompt").hide();
            }
        }
    ]
}) {
    name = "New Todo Widget"
}

class NewTableWizardConfig extends Config {
    name = "New Table..."
    steps = [
        // { question: "What is the name of the table" },
        // { question: "How Many Rows?", answerDefaultValue = 3 },
        // { question: "How Many Columns?", answerDefaultValue = 3 },
        {
            __type: "TabularDataEntry",
            defaultName: "New Table",
            defaultRows: 3,
            defaultCols: 3
        }
    ]
    finalCallback(wiz){
        // todo replace sample data with
        // wiz.answers
        // and, move this example to a featureDescription
        store.tables.push(new Table({
            rowNames: ["Row 1", "Row 2", "Row 3"],
            columnNames: ["Column A", "Column B", "Column C"],
            cellValues: [
                ["A1","B1","C1"],
                ["A2","B2","C2"],
                ["A3","B3","C3"],
            ]
        }))
    }
}
class NewTableCommand
extends BaseCmds(Command, new NewTableWizardConfig()) {}

class GherkinTestRunResults {}
class GherkinTestRunResultsViewer {}
class GherkinTestRunResultsViewerWidget {}



// class NewTimerCommand 
// extends BaseCmds(
//     Command,
// ){/**/}

const SimpleCommandConfig = function (name, action, target){
    let output = {
        name,
        steps: [
            {
                onStepLoaded: function(wiz){
                    // decode target into a parent and a key
                    let {parent,key} = system.resolve(target);
                    switch(true){
                        case action === "assigns":
                            //store.zoom = t.zoom;
                            console.warn("todo add type checking validation here")
                            parent[key] = wiz.answers[0];
                            break;
                        case action === "toggles":
                            //store.clearMode = !target.clearMode;
                            parent[key] = !parent[key];
                            break;
                        default:
                            break;
                    }
                    
                    wiz.end();
                    system.hideCmdPrompt()
                }
            }
        ]
    }

    switch(true){
        case action === "toggles":
            break;
    }

    return new Config(output);
}
const WrappedCommand = function (name, action, target){
    const _config = SimpleCommandConfig(name, action, target);
    //console.warn('wrapping command...',{_config})
    return function(){
        console.warn('instancing wrapped command', {
            _config,
        })
        return new Command(_config)
    };
}

class ToggleWidgetLabelsCommand
extends WrappedCommand(
    "Toggle Widget Labels", 
    "toggles", 
    "store.displayWidgetLabels"
){/* 😀 */}

// class SetZoomLevelCommand
// extends BaseCmds(
//     SimpleCommandConfig("Set Zoom Level", "assigns", "store.zoom", "int")
// ){/* 😀 */}

// TODO: SimpleToggleCommandConfig 
// OR    SimpleBooleanCommandConfig
class ToggleClearModeCommand
extends WrappedCommand(
    "Toggle Clear Mode", 
    "toggles", 
    "store.clearMode"
){/* 😀 */}

class Cachable {
    cache = {};
    constructor(){}
    getValue (keyname){
        return this.readFromCache(keyname) ?? this.resolve(keyname);
    }
    getInstantValue(keyname){
        return this.cache[keyname] ?? this.readFromCache(keyname);
    }
    getValuePromise(keyname){
        return new Promise((returnFinalResult,reject)=>{
            if(this.cache[keyname]){
                returnFinalResult(this.cache[keyname]);
            }else{
                this.resolve(keyname).then((result)=>{
                    returnFinalResult(result);
                })
            }
        })
    }
    set(keyname,value){
        localStorage.setItem(keyname, value);
        this.cache[keyname] = value;
    }
    get(keyname){
        if(this.cache[keyname]){
            return this.cache[keyname];
        }
        return localStorage.getItem(keyname);
    }
    resolver(keyname){
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                resolve("DONE 1 SEC LATER")
            },1000)
        }).then((result)=>{
            this.onResolved(keyname, result);
        })
    }
    onResolved(keyname, result){
        console.warn("onResolved",{keyname, result})
    }
    resolve(keyname){
        let promise = this.resolver(keyname).then((result)=>{
            this.cache[keyname] = result
            this.set(keyname, this.cache[keyname]);
        });
        return promise;
    }
}
class ClientResolver extends Cachable {
    cacheKey = "client_ip";
    // constructor(){
    //     super(...arguments);
    // }
    // async resolve(){
    //     this.result = result;
    //     if (!result.ok) {
    //         system.panic("LocationResolver.resolve: fetch failed")
    //     }
    //     this._value = result.json();
    //     return this._value;
    // }
    resolver(){
        return fetch('https://ipapi.co/json/')
    }
    formatResolverResponseForStorage(response){
        if (!response.ok) {
            system.panic("ClientResolver.resolve: fetch failed")
        }
        // TODO: json/serialize/deserialize?
        return response;
    }
}

class ClientResolverDebugWidget extends Widget {
    widgetSize = {
        width: 300,
        height: 600
    }
    value = "loading..."
    constructor(){
        super(...arguments)
        this.resolver = new ClientResolver();
        // access the value to force it's background resolution
        this.resolver.getValuePromise().then((value)=>{
            console.warn('ClientResolverDebugWidget: value resolved!',value)
            this.value = value;
        })
    }
    onDraw(){
        super.onDraw(...arguments)
        fill("yellow")
        // render just the ip for now
        text("Client Resolver: \n"+this.value, 10, 10)
    }
}

class UIButton extends Widget {
    widgetSize = {
        width: 100,
        height: 50
    }
    hoverColor = "yellow"
    constructor(){
        super(...arguments)
    }
    onDraw(rootWidget){
        super.onDraw(...arguments)
        this.ctx.strokeWeight(3)
        this.ctx.stroke("blue")
        this.ctx.fill(this.hovered ? "green" : "red")
        this.ctx.rect(
            this.smartPosition.x,
            this.smartPosition.y,
            this.widgetSize.width,
            this.widgetSize.height,
            20
        )
        this.ctx.textAlign(CENTER, CENTER)
        this.ctx.fill("yellow")
        this.ctx.text(
            "UIButton",
            this.smartPosition.x,
            this.smartPosition.y
        )
    }
}

class UISlider extends Widget {
    // draw a track with a button
    handleButton
    get position(){
        return this._absolutePosition;
    }
    constructor(){
        super(...arguments)
        this.handleButton = new UIButton();
        this.handleButton.setParentWidget(this);
    }
}

// testUi
// uitest
class UIDemoWidget extends Widget {
    elements = []
    widgetSize = {
        width: 300,
        height: 300
    }
    componentTree = [
        {
            type: "div", 
            children: [
            {
                type: "h1", 
                children: [
                    {
                        type: "text", 
                        value: "Hello World!"
                    },
                    {
                        type: "boundProp", 
                        value: "store.zoom"
                    },
                    {
                        type: "UIButton", 
                        value: "Reset Zoom",
                        onClick: ["sets", "store.zoom", 1]
                    }
                ]}
            ]
        }
    ]
    drawElement(type,component){
        //console.warn("placeholder: drawElement",{type,component})
    }
    drawUIButton(component, rootWidget){
        if(!this.elements[this.drawIndex]){
            this.elements[this.drawIndex] = new UIButton(component);
            this.elements[this.drawIndex].zDepth = rootWidget.zDepth + 1;
        }
        this.elements[this.drawIndex].draw(rootWidget);

        // in this case we don't call super.draw,
        // this is a widget with no base draw fns
        // TODO; maybe enforce that label is still rendered
        // by splitting to a separate base-class fn
    }
    drawComponent(component, rootWidget){
        if(component?.type?.length){
            switch(component.type){
                case "div":
                    this.drawElement("div",component);
                    break;
                case "h1":
                    this.drawElement("h1",component);
                    break;
                case "text":
                    this.drawElement("text",component);
                    break;
                case "boundProp":
                    this.drawElement("boundProp",component);
                    break;
                case "UIButton":
                    this.drawUIButton(component, rootWidget);
                    break;
                default:
                    console.warn(`can render ${component.type}`)
                    break;
            }
        }
        if(component?.children?.length){
            component.children.forEach((child)=>{
                this.drawComponent(child, rootWidget)
            })
        }
        this.drawIndex++;
    }
    onDraw(){
        super.onDraw();

        this.drawIndex = 0;
        this.componentTree.forEach((component)=>{
            this.drawComponent(component, this);
        })
    }
}

// our level-of-detail implementing widgets can
// render as icons when they get small,
// or with more details as they are closer
// eventually, they'll even blur out of focus
// when we add depth of field
class ZoomDependentWidget extends Widget {
    // 1x1 square unit
    // widgetSize = 100
    // widgetSize = [ 100, 100 ]

    onDraw(){
        super.onDraw(...arguments)
        let ctx = this.getCurrentContext();
        ctx.textSize(50)
            this.center = {
                x: (this.widgetSize.width / 2),
                y: (this.widgetSize.height / 2)
            }
            // clamp zoom to last 2 significant decimal places
            this.roundedZoom = Math.round(zoom * 100) / 100;
            switch(true){
                case zoom < 0.9:
                    // zoomed out
                    this.drawSmall()
                    break;
                case zoom >= 0.9 && zoom < 1.5:
                    this.drawMed()
                    break;
                default:
                    this.drawLarge()
                    break;
            }
        //ctx.pop()
    }
    drawSmall(){
        // draw a small icon
        mctx.text(`🪐\n${this.roundedZoom}`,this.center.x,this.center.y - 25)
    }
    drawMed(){
        // draw a medium icon
        mctx.text(`🏠\n${this.roundedZoom}`,this.center.x,this.center.y - 25)
    }
    drawLarge(){
        mctx.text(`🦠\n${this.roundedZoom}`,this.center.x,this.center.y - 25)
    }
}

// like zoom dependent widgets, but they crossfade
class LODCrossfadeWidget extends Widget {

}

class TitleIdeaSwitcher {
    title_ideas = [
        ["idea","box"],
        ["idea","box"],
        ["temporary","cease","fire","is","not","enough"],
        ["tokens are sub-words"],
        `
    
engrams are the smallest unit of meaning

software can break up text input into engrams

text can then be queried in hyperdimensional latent space...

this fact has been understood since the early 19th century and 
vaguely conceptualized even before that by [citation needed],

however, only recently [has ai begun to : have the compute power to : train and infer in space so vast, it simulates intelligence, cognition, understanding, and even consciousness itself]
`
    ]
    
}

class GithubCardWidget extends Widget {
    constructor(){
        super(...arguments)
        let repos = [
            "aranscope/magnet",
            "hacsbcu/mesahub",
            "ptruscott/traintracks",
            "bedekelly/minitools",
            "aranscope/aran.site"
        ];
        this.results = {};

        for(let repo of repos) {
          let url = 'https://api.github.com/repos/' + repo;
          
          fetch(url, {method: 'GET'}).then(resp => {
            return resp.json();
          }).then(json => {
            // cache the json results
            this.results[repo] = json
          }).catch(err => {
            console.log(err);
          });
        }
    }
    onDraw(){
        if(!this.results.length){
            // loading...
            this.ctx.fill("yellow")
            this.ctx.text("loading",10,10)
            return;
        }
        Object.entries(this.results).map(([k,v])=>{
            this.ctx.rect(this.smartPosition.x + (v * 30),
            )
            this.ctx.rect(this.smartPosition.x + (v * 30), this.smartPosition.y, 50, 50);
        })

        
    }
}

class SVGViewerWidget extends Widget {
    widgetSize = {
        width: 1200,
        height: 600
    }
    src = "res/inspiration/Flag_of_Palestine.svg"
    draw(){
        super.draw(...arguments)

        if(!system.PreloadedSVGs[this.src]){
            system.PreloadedSVGs[this.src] = loadImage(this.src)
        }

        // draw the SVG
        if(system.PreloadedSVGs[this.src]){
            // draw it
            image(system.PreloadedSVGs[this.src], 
                this.smartPosition.x, 
                this.smartPosition.y, 
                this.widgetSize.width, 
                this.widgetSize.height
            );
        }
    }
}

// a synchronize is a pre-determined scheduled callback.
// that's it. it's shared alarm clock that you both agree to abide by
// and since humans are error-prone, it's easy to restart the 3..2..1 or 5.. or 10.. whatever you want
class Synchronize extends Widget {
    timeLeft = 3; // seconds
    constructor(){
        super(...arguments)
    }
    onDraw(){
        super.onDraw(...arguments)

    }
}

class ImageViewerWidget extends Widget {
    widgetSize = { 
        width: 300, 
        height: 300 
    }
    src = "alien2.jpeg"
    isGif = false
    static bind(src){
        return function(){
            return new ImageViewerWidget(src)
        };
    }
    constructor(src){
        super(...arguments);

        this.src = src ?? this.src;

        if(!this.src.includes("res/") && !this.src.includes("://")){
            this.src = "res/" + this.src;
        }

        // if the src contains .gif, use a gif renderer
        this.isGif = this.src.includes(".gif");

        // todo: use system.image instead
        if(system.PreloadedImages[this.src]){
            this.image = system.PreloadedImages[this.src];
        }else{
            // does this need to be in a callback or does it unwrap itself?
            // Answer: 
            // Yes, it needs to be in a callback. The loadImage function is asynchronous, so we need to ensure
            // that the image is fully loaded before assigning it to this.image. We can do this by passing a callback
            // function to loadImage. The callback function will be executed once the image is fully loaded.
            loadImage(this.src, (img) => {
                this.image = img;
                this.updateSizeBasedOnImage();
                system.PreloadedImages[this.src] = img;
            });
            this.image = 'LOADING';
        }
        return this;
    }
    updateSizeBasedOnImage(){
        if(!this.image){
            console.warn("needed to update size based on image, but image is not loaded yet!")
            return;
        }
        // beginShape();
            // fill(255, 204, 0); // Add color to the shape. Here, it's set to yellow.
            // // Create a star shape instead of a pentagon
            // for (let i = 0; i < 10; i++) {
            //     let radius = i % 2 === 0 
            //         ? this.widgetSize.width / 2 
            //         : this.widgetSize.width / 4;
            //     let x = radius * cos(2 * PI * i / 10 - PI / 2);
            //     let y = radius * sin(2 * PI * i / 10 - PI / 2);
            //     x += this.smartPosition.x + (this.widgetSize.width / 2);
            //     y += this.smartPosition.y + (this.widgetSize.height / 2) + 10;
            //     vertex(x, y);
            // }
            // endShape(CLOSE);
            // Clip the image to the shape
            // clip(()=>{
            // Calculate aspect ratio
            let aspectRatio = this.image.width / this.image.height;
            // Calculate new width and height while maintaining aspect ratio
            this.newWidth = this.widgetSize.width;
            this.newHeight = this.newWidth / aspectRatio;
            this.halfWidth = this.newWidth * .5;
            this.halfHeight = this.newHeight * .5;
            // If new height is greater than widget height, adjust width instead
            if (this.newHeight > this.widgetSize.height) {
                this.newHeight = this.widgetSize.height;
                this.newWidth = this.newHeight * aspectRatio;
            }
            this.widgetSize.width = this.newWidth;
            this.widgetSize.height = this.newHeight;
            // Draw the image stretched to the new width and height
    }
    onDraw(){
        if(this.image === 'LOADING'){
            return;
        }
        // super.draw(...arguments)
        super.onDraw(...arguments)
        // if(this.doNotDraw){ return; }

        
        // In p5.js, if scale() is called with one argument, it scales both the x and y dimensions.
        this.ctx.scale(zoom)
        this.ctx.image(
            this.image, 
            (this.widgetSize.width - this.newWidth) / 2,
            (this.widgetSize.height - this.newHeight) / 2,
            this.widgetSize.width,
            this.widgetSize.height
        );
        
        
    }
}
/* 
i like sugar & clarity & consistency & coffee 
https://www.youtube.com/watch?v=1ogz-QzaCQ8
https://twitter.com/jakedowns/status/1731877875333091760
*/
class ImageViewer extends ImageViewerWidget {}

function drawCrosshair(ctx, _color, vec2){
    // draw the origin as a hollow circle
    let circleRadius = 10; // define the radius of the circle
    let circleResolution = 100; // define the resolution of the circle (number of line segments)
    let angleStep = TWO_PI / circleResolution; // calculate the angle between each line segment
    ctx.stroke(_color); // set the stroke color
    ctx.noFill(); // ensure the circle is hollow
    ctx.beginShape(); // start a new shape
    for (let i = 0; i <= circleResolution; i++) {
        let angle = angleStep * i; // calculate the angle of the current line segment
        let x = vec2.x + cos(angle) * circleRadius; // calculate the x position of the current line segment
        let y = vec2.y + sin(angle) * circleRadius; // calculate the y position of the current line segment
        ctx.vertex(x, y); // add the current line segment to the shape
    }
    ctx.endShape(); // finish the shape

    // draw a crosshair at vec2
    ctx.stroke(_color)
    ctx.line(
        vec2.x - 10, vec2.y,
        vec2.x + 10, vec2.y,
    )
    ctx.line(
        vec2.x, vec2.y - 10,
        vec2.x, vec2.y + 10
    )
}

// todo extend Widget.onDraw
class Cursor {
    draw(){
        let ctx = deepCanvasManager.uiContext;

        // draw a crosshair at the mouse position
        drawCrosshair(ctx, "blue", {x: ctx.mouseX, y: ctx.mouseY})

        if(!store.showDebugCursor && !store.showDebugLayer){
            return;
        }

        // debug draw a line from the center of the screen to where we think the mouse is,
        // to help debug the mouse position
        ctx.push();
        ctx.strokeWeight(1)
        ctx.stroke("red")
        ctx.fill(0,0)
        drawDashedLine(ctx, ctx.mouseX, ctx.mouseY, ctx.windowWidth / 2, ctx.windowHeight / 2)
        
        ctx.stroke("purple")
        ctx.line(ctx.mouseX, ctx.mouseY, ctx.pmouseX, ctx.pmouseY)

        

        ctx.stroke("green")

        // represents 0,0 top/left of the "world" canvas
        // corrected for zoom, and pan
        let worldOriginInScreenSpace = {
            x: panX * zoom,
            y: panY * zoom
        }
        drawDashedLine(
            ctx,
            ctx.mouseX, ctx.mouseY,
            worldOriginInScreenSpace.x, worldOriginInScreenSpace.y,
        )
        // seriously tho, how do we map the "Center" of the "virtualCanvas" (dashboard)
        // to screenspace and vice versa?
        let worldOriginAttempt2 = {
            x: (panX + (ctx.windowWidth/2)) * zoom,
            y: (panY + (ctx.windowHeight/2)) * zoom
        }

        drawCrosshair(ctx, "red", worldOriginInScreenSpace);
        ctx.stroke("yellow")
        drawDashedLine(
            ctx,
            worldOriginInScreenSpace.x,
            worldOriginInScreenSpace.y,
            worldOriginAttempt2.x, 
            worldOriginAttempt2.y
        )
        drawCrosshair(ctx, "green", worldOriginAttempt2);

        ctx.stroke("blue")
        drawDashedLine(
            ctx,
            worldOriginAttempt2.x,
            worldOriginAttempt2.y,
            ctx.windowWidth/2,
            ctx.windowHeight/2
        )
        
        
        ctx.pop();
    }
}

class ImageRotatorWidget
extends ImageViewerWidget {
    // slowly rotates the image 360 degrees continuously
    rotationSpeedDegreesPerSecond = .05
    currentRotationDegrees = 0
    onDraw(){
        super.onDraw(...arguments)
        this.ctx.push()
        // rotate the drawing context
        this.currentRotationDegrees += this.rotationSpeedDegreesPerSecond * deltaTime;
        if(this.currentRotationDegrees > 360){
            this.currentRotationDegrees = 0;
        }
        // rotate around the centerpoint of this widget relative to the display
        this.ctx.translate(
            this.smartPosition.x + (this.widgetSize.width / 2),
            this.smartPosition.y + (this.widgetSize.height / 2)
        )
        this.ctx.rotate(radians(this.currentRotationDegrees));
        this.ctx.image(
            this.image, 
            -this.halfWidth,
            -this.halfHeight,
            this.widgetSize.height,
            this.widgetSize.width
        );
        //super.draw(...arguments)
        this.ctx.pop()
    }
}

// class ThreeJSViewer extends Widget {
//     widgetSize = { width: 600, height: 600 }
//     constructor(){
//         super(...arguments)

//         // setup a basic 3 js scene with some lights and shapes
//         this.scene = new THREE.Scene();
//         this.camera = new THREE.PerspectiveCamera( 75, this.widgetSize.width / this.widgetSize.height, 0.1, 1000 );

//         this.addLights()
//         this.addShapes()

//         this.renderer = new THREE.WebGLRenderer({alpha:true});
//         this.renderer.setSize( this.widgetSize.width, this.widgetSize.height );
//         this.setCanvas(this.renderer.domElement);
//         // add the canvas to the dom as #threejscanvas (wrapper) and > canvas
//         let wrapper = document.createElement("div");
//         wrapper.id = "threejscanvas";
//         wrapper.appendChild(this.canvas);
//         document.body.appendChild(wrapper);
//         // this.updateCanvasAttributes(
//         //     this.widgetSize.width,
//         //     this.widgetSize.height,
//         //     this.smartPosition.x,
//         //     this.smartPosition.y,
//         //     ''//`translate(${this.smartPosition.x}px,${this.smartPosition.y}px)`
//         // )
//     }
//     addLights(){
//         // add some lights
//         this.light = new THREE.AmbientLight( 0x404040 ); // soft white light
//         this.scene.add( this.light );
//     }
//     addShapes(){
//         // add some shapes
//         // create a box geometry
//         this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
//         // create a basic mesh material
//         this.boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//         // // combine geometry and material to create a mesh
//         this.boxMesh = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
//         // // add the mesh to the scene
//         this.scene.add(this.boxMesh);
//     }
//     draw(){
//         super.draw(...arguments)

//         // rotate the scene a little bit each frame
//         this.scene.rotation.x += 0.01;
//         // render it
//         this.renderer.render( this.scene, this.camera );
//     }
//     updateCanvasAttributes(width, height, left, top, transform) {
//         if (this.canvas) {
//             this.canvas.style.width = width + 'px';
//             this.canvas.style.height = height + 'px';
//             this.canvas.style.left = left + 'px';
//             this.canvas.style.top = top + 'px';
//             this.canvas.style.transform = transform;
//         }
//     }
//     setCanvas(canvas){
//         this.canvas = canvas;
//     }
// }

class P53DLayer extends Widget {
    context = null
    widgetSize = { width: 800, height: 800 }
    updateCanvasAttributes(width, height, left, top, transform) {
        if (this.canvas) {
            this.canvas.style.width = windowWidth + 'px'; // width + 'px';
            this.canvas.style.height = windowHeight + 'px';
            // this.canvas.style.left = left + 'px';
            // this.canvas.style.top = top + 'px';
            // this.canvas.style.transform = transform;
            // this.canvas.setAttribute("width",width);
            // this.canvas.setAttribute("height",height);
        }
    }
    // TODO: technically we could allow multiple of these
    // each layer could be a different renderer:
    // > p52D, p5WebGL, threejs, dom
    // for now, this ONE widget holds this ONE context
    // it's probably better to let the deepCanvasManager handle
    // which engines draw to which elements when,
    // rather than leaving it up to the individual widgets
    // the widgets could opt-in to perferred render modes,
    // set preferred (ranked-choice) order (ultimately user decides)
    // implement specific callbacks for specific rendering modes
    // remember the goal is abstract widgets that can be themed and styled
    // wherever they're rendered
    getP5JSContext() {
        if (this.p5jsContext) {
            return this.p5jsContext;
        }
    
        if (!this.canvasWrapper) {
            //this.canvasEl = document.getElementById('glcanvas');
            this.canvasWrapper = document.createElement('div');
            this.canvasWrapper.id = 'glcanvas';
            this.canvasWrapper.setAttribute("style","border: 10px solid yellow; width: 100%; height: 100%;")
            document.body.appendChild(this.canvasWrapper);
        }
    
        // if (!this.context) {
        //     this.context = this.canvas.getContext('webgl');
        // }
    
        this.p5jsContext = createGraphics(
            windowWidth, //this.widgetSize.width, 
            windowHeight, //this.widgetSize.height
            mctx.WEBGL
        );
        // Attach the p5.js canvas to the existing canvas element
        this.p5jsContext.parent(this.canvasWrapper); 
        this.p5jsContext.GL = this.context;
        this.canvas = this.canvasWrapper.querySelector('canvas');
        this.canvas.style.display = "block"
    
        return this.p5jsContext;
    }
    constructor(){
        super(...arguments)
    }
    drawGrid(context, x, y, z){
        // draw the grid
        let gridSpacing = 1;
        let gridWidth = 10;
        let gridHeight = 10;
        let gridDepth = 10;
        let gridColor = 'rgba(0,0,0,0.1)';
        let gridOffset = {
            x: 0,
            y: 0,
            z: 0
        }
        let gridCenter = {
            x: 0,
            y: 0,
            z: 0
        }
        let gridScale = {
            x: 1,y:1, z: 1 
        }
        let gridRotation = {
            x: x ? Math.PI / 2 : 0,
            y: y ? Math.PI / 2 : 0,
            z: z ? Math.PI / 2 : 0
        }
        let gridTranslation = {
            x: gridOffset.x + gridCenter.x,
            y: gridOffset.y + gridCenter.y,
            z: gridOffset.z + gridCenter.z
        }
        
        // Render the grid
        // for(let i = -gridWidth; i <= gridWidth; i += gridSpacing){
        //     for(let j = -gridHeight; j <= gridHeight; j += gridSpacing){
        //         for(let k = -gridDepth; k <= gridDepth; k += gridSpacing){
        //             context.beginShape();
        //             context.vertex(i * gridScale.x + gridTranslation.x, j * gridScale.y + gridTranslation.y, k * gridScale.z + gridTranslation.z);
        //             context.vertex((i + gridSpacing) * gridScale.x + gridTranslation.x, (j + gridSpacing) * gridScale.y + gridTranslation.y, (k + gridSpacing) * gridScale.z + gridTranslation.z);
        //             context.endShape();
        //         }
        //     }
        // }
    }
    draw(){
        super.draw(...arguments);

        // draw the grid
        let context = this.getP5JSContext();

        //context.background(200);
        context.clear();

        // Add a directional light
        //context.directionalLight(255, 255, 255, 0.25, 0.25, -1);
    
        // Control rotation with mouse
        let centerX = window.windowWidth / 2;
        let centerY = window.windowHeight / 2;
        // Translate the context by the smart position and zoom
        // context.translate(centerX, centerY);
        // context.scale(zoom, zoom);
        
        // context.rotateX((centerY - mouseY) * 0.0001);
        // context.rotateY((centerX - mouseX) * 0.0001);
        // context.push();
        //context.rotationX = Math.PI / 4;
        // context.scale(1, Math.cos(Math.PI / 4));
        // context.scale(zoom,zoom)
        context.rotateY(deltaTime * 0.0001);
        context.push();
            let DRAW_DEPTH = 1/zoom; //-300;
            context.translate(
                -panX*zoom, 
                -panY*zoom, 
                DRAW_DEPTH
                );

        
            // Draw a box with colored sides
            context.fill(color(255,255,255,50))
            
            context.box(300);
            // Draw the box again with inverted orientation
            // context.scale(1, 1, -1);
            context.translate(300,0,DRAW_DEPTH)
            context.box(100);
            context.translate(-300,0,DRAW_DEPTH)

            context.push()
            context.translate(-300,0,DRAW_DEPTH)
            context.box(100);
            context.pop()

            context.push()
            context.translate(0,0,300+DRAW_DEPTH)
            context.sphere(100,12);
            context.pop()

            context.push()
            context.translate(0,0,-300+DRAW_DEPTH)
            context.sphere(100,12);
            context.pop()

            // ADD A GROUND PLANE
            //context.pop();
            //context.rotateY(deltaTime * 0.0002);
            // context.push();
            // context.push();
                // context.translate(0, 300, 0);
                // context.rotateX(Math.PI / 2);
                // context.fill(200);
                // context.plane(2000, 2000);
            // context.pop();
            context.pop();

            // context.scale(2,2)
            // context.push(); // Save current state
            // context.fill('red'); // Set fill color for one side
            // context.rect(-50, -50, 100, 100); // Draw one side of the box
            // context.fill('green'); // Set fill color for another side
            // context.rect(50, -50, 100, 100); // Draw another side of the box
            // context.fill('blue'); // Set fill color for another side
            // context.rect(-50, 50, 100, 100); // Draw another side of the box
            // context.fill('yellow'); // Set fill color for another side
            // context.rect(50, 50, 100, 100); // Draw another side of the box
        // context.pop(); // Restore original state

        

        // //context.translate(0,0)
        // context.stroke("yellow")
        // context.strokeWeight(1)
        // context.rect(0,0,100,100)

        // this.updateCanvasAttributes(
        //     this.widgetSize.width, 
        //     this.widgetSize.height, 
        //     0,0,
        //     'translate(0, 0), scale(1, 1)');

        // context.strokeWeight(1);

        // // Set grid color for x-axis
        // context.stroke('rgba(255,0,0,0.1)');
        // this.drawGrid(context, 1, 0, 0);

        // // Set grid color for y-axis
        // context.stroke('rgba(0,255,0,0.1)');
        // // Draw y-axis grid here
        // // TODO: Add grid drawing code for y-axis

        // // Set grid color for z-axis
        // context.stroke('rgba(0,0,255,0.1)');
        // // Draw z-axis grid here
        // // TODO: Add grid drawing code for z-axis
    }
}

class Quaternion {
    constructor(x, y, z, w) {
        if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number' || typeof w !== 'number') {
            throw new Error('Quaternion constructor requires four numeric arguments');
        }
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    slerp(q, t){
        // quaternion slerp
        
        // Calculate angle between them.
        let cosHalfTheta = this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;

        // if q1=q2 or q1=-q2 then theta = 0 and we can return q1
        if (Math.abs(cosHalfTheta) >= 1.0){
            return this;
        }

        // Calculate temporary values.
        let halfTheta = Math.acos(cosHalfTheta);
        let sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

        // if theta = 180 degrees then result is not fully defined
        // we could rotate around any axis normal to q1 or q2
        if (Math.abs(sinHalfTheta) < 0.001){ // fabs is floating point absolute
            return new Quaternion(
                (this.w * 0.5 + q.w * 0.5),
                (this.x * 0.5 + q.x * 0.5),
                (this.y * 0.5 + q.y * 0.5),
                (this.z * 0.5 + q.z * 0.5)
            );
        }

        let ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
        let ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

        //calculate Quaternion.
        return new Quaternion(
            (this.w * ratioA + q.w * ratioB),
            (this.x * ratioA + q.x * ratioB),
            (this.y * ratioA + q.y * ratioB),
            (this.z * ratioA + q.z * ratioB)
        )
    }
    multiply(q){
        return new Quaternion(
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y + this.y * q.w + this.z * q.x - this.x * q.z,
            this.w * q.z + this.z * q.w + this.x * q.y - this.y * q.x,
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
        )
    }
    static FromEulerAngles(x, y, z){
        let qx = Math.sin(x / 2);
        let qy = Math.sin(y / 2);
        let qz = Math.sin(z / 2);
        let qw = Math.cos(x / 2) * Math.cos(y / 2) * Math.cos(z / 2) - Math.sin(x / 2) * Math.sin(y / 2) * Math.sin(z / 2);
        return new Quaternion(qx, qy, qz, qw);
    }
    toEulerAngles(){
        // roll (x-axis rotation)
        let sinr_cosp = 2 * (this.w * this.x + this.y * this.z);
        let cosr_cosp = 1 - 2 * (this.x * this.x + this.y * this.y);
        let roll = Math.atan2(sinr_cosp, cosr_cosp);
        
        // pitch (y-axis rotation)
        let sinp = 2 * (this.w * this.y - this.z * this.x);
        let pitch;
        if (Math.abs(sinp) >= 1){
            pitch = Math.sign(sinp) * (Math.PI / 2); // use 90 degrees if out of range
        }else{
            pitch = Math.asin(sinp);
        }

        // yaw (z-axis rotation)
        let siny_cosp = 2 * (this.w * this.z + this.x * this.y);
        let cosy_cosp = 1 - 2 * (this.y * this.y + this.z * this.z);
        let yaw = Math.atan2(siny_cosp, cosy_cosp);

        return {
            roll,
            pitch,
            yaw
        }
    }
    normalize(){
        let magnitude = Math.sqrt(
            this.x * this.x +
            this.y * this.y +
            this.z * this.z +
            this.w * this.w
        );
        return new Quaternion(
            this.x / magnitude,
            this.y / magnitude,
            this.z / magnitude,
            this.w / magnitude
        )
    }
    // conjugate(){
    //     return new Quaternion(
    //         -this.x,
    //         -this.y,
    //         -this.z,
    //         this.w
    //     )
    // }
    multiplyVector(vector, normalize = false) {
        if(!vector || vector.length !== 3){
            throw new Error("Quaternion.multiplyVector: vector must be an array of length 3");
        }
        const u = [this.x, this.y, this.z];
        const a = this.w;
        const v = vector;

        const dotUV = u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
        const crossUV = [
            u[1]*v[2] - u[2]*v[1],
            u[2]*v[0] - u[0]*v[2],
            u[0]*v[1] - u[1]*v[0]
        ];

        const rotatedVector = [
            2*dotUV*u[0] + (a*a - dotUV)*v[0] + 2*a*crossUV[0],
            2*dotUV*u[1] + (a*a - dotUV)*v[1] + 2*a*crossUV[1],
            2*dotUV*u[2] + (a*a - dotUV)*v[2] + 2*a*crossUV[2]
        ];

        if(normalize){
            const length = Math.sqrt(rotatedVector[0]*rotatedVector[0] + rotatedVector[1]*rotatedVector[1] + rotatedVector[2]*rotatedVector[2]);
            rotatedVector[0] /= length;
            rotatedVector[1] /= length;
            rotatedVector[2] /= length;
        }

        return rotatedVector;
    }
}

class ImageCubeRotatorWidget
extends ImageViewerWidget {
    cubeRotationQuaternion = new Quaternion(0,0,0,1)
    draw(){
        super.draw(...arguments)  
    }
}

class Spline {
    localGravityMSS = 0.1;
    friction = 0.999;

    constructor(from, to, segmentCount) {
        this.from = from;
        this.to = to;
        this.segmentCount = segmentCount;
        this.segments = []; // Initialize segments array
    }
    draw(){
        beginShape();
        this.segments.forEach(segment => {
            vertex(segment.x, segment.y);
        });
        endShape();
    }
}

class Cable extends Spline {
    constructor(from, to, color) {
        super(from, to, 10); // Assuming segmentCount is always 10 for a Cable
        this.color = color;
    }
    // Add methods for Cable class here
}

class SplinePhysicsSandboxWidget extends Widget {
    socketRadius = 20;
    widgetSize = {
        width: 300,
        height: 300
    };
    sockets = [
        // left
        {x: 10, y: 10},
        {x: 10, y: 40},
        {x: 10, y: 70},

        // right
        {x: 290, y: 10},
        {x: 290, y: 40},
        {x: 290, y: 70},
    ];
    cables = [];

    constructor() {
        super(...arguments);
        this.cables.push(new Cable(this.sockets[0], this.sockets[2+1], "red"));
        this.cables.push(new Cable(this.sockets[1], this.sockets[2+0], "green"));
        this.cables.push(new Cable(this.sockets[2], this.sockets[2+2], "blue"));
    }

    draw() {
        super.draw(...arguments);
        this.cables.forEach((cable) => {
            this.drawCable(cable);
        });
    }

    drawCable(cable) {
        // Forward the call to the Cable class
        cable.draw();
    }
}

class NewImageViewerWidgetCommand 
extends BaseCmds(Command,{
    name: "New Image Viewer Widget",
    steps: [
        {
            question: "Loading...",
            onStepLoaded(wiz){
                system.hideCmdPrompt();
            }
        }
    ],
    finalCallback(wiz){

    }
}){/**/}

// class NewIFrameWidgetCommand extends BaseCmds(Command, {
//     name: "New iFrame Widget",
//     steps: [
//         {
//             question: "What URL?",
//             answerDefaultValue: "https://www.google.com/webhp?igu=1",
//             answerPlaceholder: "https://www.google.com/webhp?igu=1",
//             answerStorageKey: "input",
//             // beforeStepUnload
//             toastOnSuccess: (wiz)=>{
//                 return `Widget Added!\n${wiz.stepResponses[0].input}`
//             },
//             onStepLoaded: (wiz)=>{
//                 // TODO: set input to placeholder / default
//             },
//             onStepUnload: (wiz)=>{
//                 debugger;
//                 // after the user response is stored
//                 console.warn(`New ${this.name}: onStepUnload`, {wiz})

//                 const url = wiz.stepResponses[0].input;
//                 // todo: validate

//                 if(url.includes('youtube.com')){
//                     // use a YoutubePlayerWidget instead
//                     system.get("Dashboard")
//                     .registerWidget(
//                         `Youtube Player: ${url}`,
//                         new YoutubePlayerWidget("",{
//                             tracks:[
//                                 url
//                             ]
//                         })
//                     )
//                 }else{
//                     system
//                         .get("Dashboard")
//                         .registerWidget(
//                             "WidgetInstance"+performance.now(), 
//                             new iFrameWidget(url)
//                         );
//                 }


//                 // end the wizard
//                 wiz.end();
//                 // hide the command prompt
//                 system.get("cmdprompt").hide();
//             }
//         }
//     ]
// }){}


// contained in a widget holder
// who must call our draw method for us to be drawn
class BuildingBlock extends Widget {

}

class ScratchPad extends Widget {
    widgetSize = {
        width: 300,
        height: 300
    }
    nestedCanvas = null
    constructor(){
        super(...arguments)
        this.nestedCanvas = createGraphics(this.widgetSize.width, this.widgetSize.height);
        this.nestedCanvas.background(255, 0, 0);
    }
    draw(){
        //super.preDraw();
        super.draw(...arguments)

        this.nestedCanvas.fill(255, 255, 0);
        this.nestedCanvas.ellipse(this.nestedCanvas.width / 2, this.nestedCanvas.height / 2, 50, 50);


        image(this.nestedCanvas, this.smartPosition.x, this.smartPosition.y);
    }
}


// a place for building blocks to go
// in the future, we can drag and drop them across MR contexts (between clients)
// laptop > phone > tablet > desktop > ar > mr > vr > whatever
class BuildingBlockWidgetHolder extends Widget {
    widgetSize = {
        width: 300,
        height: 300
    }
    blocks = []
    draw(){
        super.draw(...arguments)

        // draw the blocks
        this.blocks.forEach((block)=>{
            block.draw();
        })
    }
}

class iFrameWidget extends Widget {
    url = ""
    pinned = false
    
    widgetSize = {
        width: Math.min(window.windowWidth * 0.2, 800),
        height: Math.min(window.windowHeight * 0.2, 800)
    }
    close(){
        super.close(...arguments)
        // delete this iframe
        if(this.iframe){
            this.iframe.remove()
        }
    }
    createIFrame(){
        const style = {
            'border-radius': '20px',
            'border': '3px solid red',
            'position': 'fixed',
            'top': '0',
            'left': '0',
            'z-index': '999999',
            'display': 'block',
            'width': this.widgetSize.width + 'px',
            'height': this.widgetSize.height + 'px',
            'transform': `scale(${zoom})`,
        }
        const tagAttrs = {
            'id': 'iframe',
            'frameborder': '0',
            'allowfullscreen': 'true',
            'scrolling': 'yes',
            'allow': 'autoplay; encrypted-media',
            // 'height': `${this.widgetSize.width}px`,
            // 'width': `${this.widgetSize.height}px`,
            'src': this.url ?? 'https://google.com/webhp?igu=1',
            'crossorigin': 'anonymous',
        }
        // alert(this.url + ' ' + this.widgetSize.width + 'x' + this.widgetSize.height)
        // console.log({tagAttrs})
        this.iframe = createElement('iframe');
        // console.log('created iframe',{iframe:this.iframe})
        for (let attr in tagAttrs) {
            this.iframe.attribute(attr, tagAttrs[attr]);
        }
        
        this.iframe.attribute('style',Object.keys(style).map((k)=>{
            return `${k}:${style[k]};`
        }).join(''));

        // hide by default (for performance)
        // this.iframe.hide();

        // TODO: allow unfreezing nested iframe tabs

        // wrap the iframe in a wrapper, and add a overlay sibling for "iframe click tracking"
        let wrapper = createElement('div');
        wrapper.class('iframe-wrapper');
        let overlay = createElement('div');
        overlay.class('iframe-overlay');
        wrapper.child(this.iframe);
        wrapper.child(overlay);
        // inject it into the dom #under-ui-elms
        wrapper.parent('under-ui-elms')

        // since we just spawned an iframe, focus on deep layer 1 (instead of 0)
        //deepCanvasManager.setActiveLayer(1);
        deepCanvasManager.focusedIndex = 1;
    }
    constructor(url,pxWidthOrOptsOrNull,pxHeightOrNull){
        super(...arguments);
        this.url = url ?? this.url;

        // let opts = null;
        // if(typeof pxWidthOrOptsOrNull === 'object'){
        //     opts = pxWidthOrOptsOrNull;
        // }

        console.warn('iframe',{
            url,
            two: arguments[1],
            three: arguments[2],
        })

        //this.widgetSize = { width: 300, height: 150 }

            if(arguments[0]?.widgetSize){
                this.widgetSize = arguments[0].widgetSize;
            }
            else if(arguments[1]?.widgetSize){
                this.widgetSize = arguments[1].widgetSize;
            }else if(pxHeightOrNull){
                this.widgetSize = {
                    width: pxWidthOrOptsOrNull,
                    height: pxHeightOrNull
                }
            }
        
        // if width/height opts were not provided
        // check the string for ?width=w&height=h or ?w=w&h=h

        /*
        if(arguments[1]?.fullTag?.length){
                arguments[1]?.fullTag
            }
            */

        this.createIFrame()
    }
    updateUrl(url){
        if(isEmptyOrUndefined(url)){
            system.panic("iFrameWidget.updateUrl: url cannot be empty or undefined")
        }
        console.warn('iFrameWidget.updateUrl',{url})
        this.iframe.elt.src = url;
    }
    
    // main iframe draw
    // draw iframe main
    onDraw(){
        super.onDraw(...arguments)

        this.ctx.push()
        this.ctx.translate(-this.smartPosition.x, -this.smartPosition.y)
        this.ctx.scale(zoom)
        this.ctx.fill("red")
        this.ctx.text(`url:${this.url}`, 0, 0, 100, 100);
        //this.ctx.pop()

        // if(system.get("cmdprompt").visible){
        //     this.iframe.hide();
        //     return
        // }
        // super.draw(...arguments)
        // if(this.doNotDraw){
        //     this.iframe.hide();
        //     return;
        // }else{
        //     this.iframe.show();
        // }

        // if(this.pinned){
        //     this.corrected.x = 0//(this.smartPosition.x + (mouseShifted.x*zoom))
        //     this.corrected.y = windowHeight - this.widgetSize.height//(this.smartPosition.y + (mouseShifted.y*zoom))
        // }else{
            // this.corrected.x = (-this.smartPosition.x - panX) * zoom;
            // this.corrected.y = (-this.smartPosition.y - panY) * zoom;

        //     this.corrected = this.smartPosition;
        // }

        // draw the + and - buttons we use to jump
        // from mobile -> tablet -> desktop -> etc

        const buttonSize = 50;
        const halfButtonSize = 25; // center
        const borderRadius = 10;
        const negYOffset = - buttonSize - 10;
        
        // Draw a white X on a RED BUTTON
        this.ctx.push(); // Save current drawing style and transformation matrix

        // Save the default state
        this.ctx.drawingContext.save(); 
        // Apply a skew transformation
        // The parameters are: scale factors (x, y), skew factors (x, y), translate (x, y)
        let time = Date.now() * 0.001; // Get current time in seconds
        let skewValueX = Math.sin(time); // Calculate sin value of the current time for x-axis skew
        let skewValueY = Math.cos(time); // Calculate cos value of the current time for y-axis skew
        this.ctx.drawingContext.transform(1, skewValueY, skewValueX, 1, 0, 0); // Skewing on both x and y axes
        // squash scale to account for skew in screen space
        this.ctx.scale(1.5,1)

        // Draw your objects here
        this.ctx.rect(50, 50, 100, 100);

        // Restore the context to its original state
        this.ctx.drawingContext.restore();

            this.ctx.translate(
                this.smartPosition.x,
                this.smartPosition.y
            )
            this.ctx.noStroke();
            this.ctx.rectMode(CORNER)
            this.ctx.fill("red");
            this.ctx.rect(0, negYOffset, buttonSize, buttonSize, borderRadius);
            this.ctx.rectMode(CENTER)
            this.ctx.fill("white");
            this.ctx.translate(halfButtonSize, halfButtonSize)
            this.ctx.rotate(radians(45));
            this.ctx.rect(0, 0, 30, 10, borderRadius);
            this.ctx.rect(0, 0, 10, 30, borderRadius);
            this.ctx.rotate(radians(-45));
            this.ctx.translate(-halfButtonSize, -halfButtonSize)
        this.ctx.pop(); // Restore drawing style and transformation matrix

        // Draw a white minus on a yellow button
        this.ctx.push(); // Save current drawing style and transformation matrix
        this.ctx.translate(
            this.smartPosition.x,
            this.smartPosition.y
        )
            this.ctx.rectMode(CORNER)
            this.ctx.fill("goldenrod");
            this.ctx.rect(
                            buttonSize + 10, 
                            negYOffset, 
                            buttonSize, 
                            buttonSize, 
                            borderRadius);
            this.ctx.rectMode(CENTER);
            this.ctx.fill("white");
            this.ctx.rect(
                            halfButtonSize + buttonSize + 10, 
                            negYOffset + halfButtonSize, 
                            30, 
                            10, 
                            borderRadius);
        this.ctx.pop(); // Restore drawing style and transformation matrix

        // Draw a white plus on a green button
        this.ctx.push(); // Save current drawing style and transformation matrix
            this.ctx.translate(
                this.smartPosition.x,
                this.smartPosition.y
            )
            this.ctx.translate(0, buttonSize + 10)
            this.ctx.noStroke();
            this.ctx.rectMode(CORNER)
            this.ctx.fill("green");
            this.ctx.rect(0, 0, buttonSize, buttonSize, borderRadius);
            this.ctx.rectMode(CENTER)
            this.ctx.fill("white");
            this.ctx.rect(
                halfButtonSize, 
                halfButtonSize, 
                30, 
                10, 
                borderRadius
            );
            this.ctx.rect(
                halfButtonSize, 
                halfButtonSize, 
                10, 
                30, 
                borderRadius);
        this.ctx.pop(); // Restore drawing style and transformation matrix

        let iFrameX = ( 
            (mouseShifted.x + panX)
            + this.smartPosition.x 
        ) * zoom;
        
        let iFrameY = (
            (mouseShifted.y + panY)
            + this.smartPosition.y
        ) * zoom;
        
        this.iframe.position(
            iFrameX,
            iFrameY
        );

        // set pointerEvents none when deepCanvasManager.focusedIndex < 1
        const panning = Math.abs(panMomentumVector.x ?? panMomentumVector.y)
        
        this.iframe.elt.style.pointerEvents = 
            panning 
            || deepCanvasManager.focusedIndex < 1
            || store.shiftIsPressed 
            ? 'none' 
            : 'auto';

        //debugger;
        //this.iframe.scale(zoom)
        // this.iframe.elt.style.width = `${this.widgetSize.width * zoom}px`;
        // this.iframe.elt.style.height = `${this.widgetSize.height * zoom}px`;
        // this.iframe.elt.id = this.id;
        // t
        this.iframe.elt.style.transform = `scale(${zoom})`;
    }
}
/* 

<YoutubePlayerWidget 
    width="300" 
    height="150" 
    src="https://www.youtube.com/embed/5qap5aO4i9A"
    extends="iFrame" />

<YoutubePlayerWidget
    track0="https://www.youtube.com/embed/5qap5aO4i9A"
    track1="https://www.youtube.com/embed/5qap5aO4i9A"
    />

*/
class YoutubePlayerWidget 
extends iFrameWidget {
    name = "Youtube Player"
    //widgetSize = { width: 300, height: 150 }
    playedTracks = []
    _tracks = null
    tracksChanged = false
    pinned = false
    constructor(name, options){
        super(...arguments)
        console.warn("New YoutubePlayerWidget!!!",{
            name,options
        })
        this.options = options ?? {};
        if(this.options.widgetSize){
            this.widgetSize = this.options.widgetSize;
        }
        this.setTrackList(this.getTrackList());
        this.updateUrl(this.getFirstTrack());
    }
    get tracks(){
        // valid cache hit
        if(this._tracks && !this.tracksChanged){
            return this._tracks;
        }
        // cache miss
        this.setTrackList(
            this.getTrackList()
        );
        return this._tracks;
    }
    setTrackList(tracks){
        // should we override value in options?
        if(!tracks || !tracks.length){
            system.panic("we don't support empty tracks here")
        }
        this.tracksChanged = true;
        // get tracks will pull from here and cache
        this.options.tracks = tracks.map(this.iframeSafeUrl);
        // unset any track0..trackN on options that may be lingering
        let i = 0;
        while(this.options[`track${i}`]){
            delete this.options[`track${i}`];
            i++;
        }
        // update cache
        this._tracks = this.options.tracks;
    }
    // pluck from options
    getTrackList(){
        let tracks = [];
        let i = 0;
        while(this.options[`track${i}`]){
            tracks.push(this.options[`track${i}`]);
            i++;
        }
        return [...tracks, ...this.options?.tracks ?? []];
    }
    getUnplayedTracks(){
        return this.tracks.filter(track => !this.playedTracks.includes(track));
    }
    getRandomTrackNotYetPlayed(){
        return random(this.getUnplayedTracks());
    }
    getFirstTrack(){
        if(!this.tracks.length){
            system.panic("YoutubePlayerWidget.getFirstTrack: no tracks available")
        }
        return this.options?.pickRandomOnPlay ? this.getRandomTrackNotYetPlayed() : this.tracks[0];
    }
    iframeSafeUrl(url){
        if(url.indexOf("/embed/") > -1){
            return url;
        }
        const urlObj = new URL(url);
        let videoId = urlObj.searchParams.get('v');
        if (!videoId) {
            videoId = 'dQw4w9WgXcQ';
        }
        // console.warn('iframeSafeUrl',
        //     `https://www.youtube.com/embed/${videoId}`
        // )
        // Added autoplayParam to enable autoplay in the embed URL
        return `https://www.youtube.com/embed/${videoId}`;
    }
    // use update() instead if you want to ignore draw method culling
    // onDraw(){
    //     // when visible and being drawn...
    //     super.onDraw(...arguments)
    // }
}


class OpenTableViewerCommand {}
class TableWidget extends Widget {
    tableIndex = null;
    constructor({tableIndex}){
        this.tableIndex = tableIndex;
    }
    get table(){
        return store.tables[this.tableIndex];
    }
}

// const SELF_TEST_CLASSES = {};
// const SELF_TEST_INSTANCES = {};
// const SELF_TEST_CLASS_ARGS = {};
// // keyName must be unique per feature
// const SelfTest = function(baseClass, keyName){
//     //const extendedClassInstance = new baseClass(...arguments);
//     // console.warn('todo: register this class as something to run @selfTest time', {baseClass})
    
//     // Object.defineProperties(SELF_TEST_INSTANCES,{
//     //     [keyName]: {
//     //         value: new baseClass(...arguments),
//     //         writable: false,
//     //         enumerable: true,
//     //         configurable: false
//     //     }
//     // })

//     let callMeToMakeNew = function(){
//         console.warn('instancing self-test',{
//             keyName,
//             stc: SELF_TEST_CLASSES[keyName],
//             sti: SELF_TEST_INSTANCES[keyName],
//             vsThis: this,
//         })
//         // adjust our eagerly instanced class with any additional "construction-time" arguments
//         // IF a reconstruct method is defined (some base classes have default implementations)
//         //extendedClassInstance?.reconstruct?.(...arguments);
//         //return extendedClassInstance;
//         SELF_TEST_INSTANCES[keyName] = new baseClass(...arguments);
//         return SELF_TEST_INSTANCES[keyName];
//     };
//     SELF_TEST_CLASSES[keyName] = callMeToMakeNew;
//     console.warn('setting SELF_TEST_CLASSES',{keyName,callMeToMakeNew})
//     return callMeToMakeNew;
// }

// NOTE: we pre-process these
// and convert them to GherkinFeature objects
// filled with an Object of keyed GherkinScenario objects
// which in turn are filled with GherkinStep objects
// class FeatureTestTables extends SelfTest(FeatureTest,"FeatureTestTables") {

class FeatureTestTables extends FeatureTest {
    background = [
        // alias "given a fresh system" ~ "given a fresh root system"
        "given a fresh, pre-booted sandboxed system instance"
    ]
    scenarios = {
        "system creates a table at boot": [
            // alias "given a fresh system" ~ "given a fresh root system"

            // TODO: update parser to support this syntax (in addition to our other syntaxes)
            // in this one, you don't have to key {Given,When,Then} as long as you have a "given" in the first position
            // and the rest of the sequence evaluates to valid Gherkin
            "given a fresh sandbox instance", 
            "when the system boots",
            "and i access rootTestTable",
            "then i see the table exists",
            "and the table contains 3 rows",
            "and the table contains 3 columns",
            "and the table contains 9 cells",
        ],
        "user can create a table": [
            "given a fresh start",
            "when i create a table",
            "then i see a new table with 9 empty cells across 3 rows and 3 columns",
        ],
        "user can save a table": ToBeImplemented,
        "user can load a table": ToBeImplemented,
        "user can delete a table": ToBeImplemented,
        "user can name a table": ToBeImplemented,
        "user can rename a table": ToBeImplemented
    }
}
const FEATURE_TESTS = {
    "FeatureTestTables": FeatureTestTables
}
// EndRegion: Tables / Nested Tables
class Pomodoro {
    timer = null
    ended = false
    endedAt = null
    constructor(){
        this.durationMs = 20 * 60 * 1000;
        this.timerStartedAt = performance.now();
        this.ticker = setInterval(()=>{
            this.tick();
        },1000)
    }
    tick(){
        if(this.endedAt){
            return
        }
        if((performance.now() - this.timerStartedAt) > this.durationMs){
            this.end();
        }
    }
    end(){
        if(this.ticker){
            clearInterval(this.ticker);
            this.ticker = null;
        }
        this.endedAt = performance.now();
    }
}
class PomodoroWidget extends Widget {
    name = "🍅 Pomodoro Widget"
    widgetSize = { width: 300, height: 150 }
    pomClassInstance = null
    constructor(){
        super(...arguments);
        this.pomClassInstance = new Pomodoro();
    }
    draw(){
        super.draw(...arguments)
        fill("darkblue")
        textAlign(CENTER, CENTER);
        text(
            "🍅 Pomodoro Timer 🍅",
            this.smartPosition.x + (this.widgetSize.width/2), 
            this.smartPosition.y + 20 // + (this.dimensions.height/2)
        )
        if(this.pomClassInstance.endedAt){
            const endedAtFormatted = new Date(this.pomClassInstance.endedAt).toLocaleTimeString();
            const durFmtd = new Date(this.pomClassInstance.durationMs).toLocaleTimeString();
            text(
                `Pomodoro Ended!\nduration: ${durFmtd}\n at:${endedAtFormatted}`,
                this.smartPosition.x + (this.widgetSize.width/2), 
                this.smartPosition.y + 40 // + (this.dimensions.height/2)
            )
        }else{
            const remainingMs = this.pomClassInstance.durationMs - (performance.now() - this.pomClassInstance.timerStartedAt);
            const hours = Math.floor(remainingMs / 3600000);
            const minutes = Math.floor((remainingMs % 3600000) / 60000);
            const seconds = Math.floor((remainingMs % 60000) / 1000);
            const remainingFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            textAlign(CENTER, TOP)
            text(
                `Pomodoro Running: \n${remainingFormatted} remaining`,
                this.smartPosition.x + (this.widgetSize.width/2), 
                this.smartPosition.y + 40 // + (this.dimensions.height/2)
            )
        }
    }
}

// /:-/
class D3Widget extends Widget {
}

// we're not re-inventing the wheel,
// we're just referencing the wheel in a new way
// d3 compatible data / options

class PieChart extends Widget {
    name = "Pie Chart"
    widgetSize = { width: 300, height: 300 }
    data = [
        { label: "Thing A 10/30", value: 10 },
        { label: "Thing B 20/30", value: 20 },
    ]
    totalValue = 100
    arcStart = 0;
    arcRadius = 50;
    constructor(){
        super(...arguments)
        this.totalValue = this.data.reduce((acc, cur) => acc + cur.value, 0);
    }
    onDraw(){
        super.onDraw(...arguments)

        // draw an arc filled based on relative data contributions to the total
        
        
        for(let i = 0; i < this.data.length; i++){
            let arc = this.data[i];
            let arcSize = arc.value / this.totalValue;
            let arcEnd = this.arcStart + arcSize * TWO_PI;
            let arcMid = this.arcStart + ((arcEnd - this.arcStart) / 2);
            
            let arcX = this.smartPosition.x + (this.widgetSize.width / 2);
            let arcY = this.smartPosition.y + (this.widgetSize.height / 2);
            // this.ctx.push()
            this.ctx.fill("red");
            drawShape('arc',{arcX, arcY, arcRadius:this.arcRadius, arcStart:this.arcStart, arcEnd}, this.ctx);
            // this.ctx.pop();

            this.ctx.fill("white", 0, 0);
            this.ctx.text("Pie Chart", 0, 0)

            // draw a label for each arc
            let labelX = arcX + this.arcRadius * Math.cos(arcMid);
            let labelY = arcY + this.arcRadius * Math.sin(arcMid);
            this.ctx.text(arc.label, labelX, labelY);

            // update arcStart for the next arc
            this.arcStart = arcEnd;
        }
    }
    
}

class DonutChart extends PieChart{
    widgetSize = { width: 300, height: 300 }
    data = [
        { label: "Thing A 10/30", value: 10 },
        { label: "Thing B 20/30", value: 20 },
    ]
    onDraw()
    {
        super.onDraw(...arguments)
        let innerRadius = 20;
        for(let i = 0; i < this.data.length; i++){
            let arc = this.data[i];
            let arcSize = arc.value / this.totalValue;
            let arcEnd = this.arcStart + arcSize * TWO_PI;
            let arcMid = this.arcStart + ((arcEnd - this.arcStart) / 2);
            let arcX = this.smartPosition.x + (this.widgetSize.width / 2);
            let arcY = this.smartPosition.y + (this.widgetSize.height / 2);
            // this.ctx.push()
            this.ctx.fill("red");
            drawShape('arc', {x: arcX, y: arcY, radius: this.arcRadius, startAngle: this.arcStart, endAngle: arcEnd}, this.ctx);
            this.ctx.fill("white");
            drawShape('arc', {x: arcX, y: arcY, radius: innerRadius, startAngle: this.arcStart, endAngle: arcEnd}, this.ctx);
            // this.ctx.pop();

            this.ctx.text("Donut Chart", 0, 0)

            // draw a label for each arc
            let labelX = arcX + this.arcRadius * Math.cos(arcMid);
            let labelY = arcY + this.arcRadius * Math.sin(arcMid);
            this.ctx.text(arc.label, labelX, labelY);

            // update this.arcStart for the next arc
            this.arcStart = arcEnd;
        }
    }
}

class Sparkline extends Widget {
    onDraw()
    {
        super.onDraw(...arguments)
        this.ctx.fill("yellow")
        this.ctx.triangle(
            0, 0,
            0, this.widgetSize.height,
            this.widgetSize.width, this.widgetSize.height
        )
    }
}

class BlockBreaker extends Widget {

}
class SnakeGame extends Widget {

}
class PipeGameWidget extends Widget {
    spots = []
    edges = []
    numInputs = 1
    numOutputs = 1
    rows = 3
    cols = 3
    piece_types = [
        "straight",
        "corner",
        "t",
        "cross"
    ]
    piece_rotations = [
        "up",
        "right",
        "down",
        "left"
    ]
    edge_parts = [
        "none",
        "input",
        "output",
    ]
    current_edge_part_pool = []
    constructor(){
        current_edge_part_pool.length = 0
        // pre-assign our edge parts (based on capped input and output counts)
        for(let i = 0; i < this.numInputs; i++){
            current_edge_part_pool.push("input")
        }
        for(let i = 0; i < this.numOutputs; i++){
            current_edge_part_pool.push("output")
        }
        // for the remainder, fill the pool with "none"
        // Calculate the number of edge pieces
        let edgePieces = (this.rows * 2) + (this.cols * 2) - 4;
        // Calculate the number of inner pieces
        // let innerPieces = (this.rows - 2) * (this.cols - 2);
        // Calculate the number of "none" pieces
        let nonePieces = edgePieces - this.numInputs - this.numOutputs;
        // Fill the pool with "none" for the remaining pieces
        for(let i = 0; i < nonePieces; i++){
            current_edge_part_pool.push("none")
        }

        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                this.spots.push({
                    row: i,
                    col: j,
                    piece: {
                        type: random(this.piece_types),
                        rotation: random(this.piece_rotations),
                    }
                })

                // if this spot is on an edge,
                // add an edge part
                if(i === 0 || i === this.rows - 1 || j === 0 || j === this.cols - 1){
                    this.edges.push({
                        row: i,
                        col: j,
                        part: random(this.edge_parts)
                    })
                }
            }
        }
    }
    onDraw(){
        super.onDraw(...arguments)

        // TODO: draw to static cache on change

        // draw the grid
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                // draw the grid
                this.ctx.push()
                this.ctx.translate(
                    this.smartPosition.x + (i * 50),
                    this.smartPosition.y + (j * 50)
                )
                this.ctx.stroke("black")
                this.ctx.noFill()
                this.ctx.rect(0, 0, 50, 50)
                this.ctx.pop()
            }
        }

        // draw the edges
        this.edges.forEach((edge)=>{
            this.ctx.push()
            this.ctx.translate(
                this.smartPosition.x + (edge.row * 50),
                this.smartPosition.y + (edge.col * 50)
            )
            this.ctx.stroke("black")
            this.ctx.noFill()
            this.ctx.rect(0, 0, 50, 50)
            this.ctx.pop()
        })

        // draw the parts
        this.spots.forEach((spot)=>{
            this.ctx.push()
            this.ctx.translate(
                this.smartPosition.x + (spot.row * 50),
                this.smartPosition.y + (spot.col * 50)
            )
            this.ctx.stroke("black")
            if(spot.part === "straight") {
                this.ctx.fill("red")
            } else if(spot.part === "corner") {
                this.ctx.fill("blue")
            } else if(spot.part === "t") {
                this.ctx.fill("green")
            } else {
                this.ctx.noFill()
            }
            // rotate to the current rotation of the part
            this.ctx.translate(25, 25)
            if(spot.rotation === "up"){
                this.ctx.rotate(radians(0))
            }else if(spot.rotation === "right"){
                this.ctx.rotate(radians(90))
            }else if(spot.rotation === "down"){
                this.ctx.rotate(radians(180))
            }else if(spot.rotation === "left"){
                this.ctx.rotate(radians(270))
            }

            // Visualize the current rotation by changing the border radius of one corner
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(50, 0);
            this.ctx.quadraticCurveTo(50, 50, 0, 50);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.pop()
        })

    }
    onClickPart(part){
        part.type = this.getNextPieceForPart(part.type);
    }
    onRightClickPart(part){
        part.rotation = this.getNextRotationForPart(part.rotation);
    }
    getNextRotationForPart(currentRotation){
        // get the next rotation in the pool
        // if it's the last rotation, return the first rotation
        let currentIndex = this.piece_rotations.indexOf(currentRotation);
        if(currentIndex === this.piece_rotations.length - 1){
            return this.piece_rotations[0];
        }
        return this.piece_rotations[currentIndex + 1];
    }
    getNextCyclePartForPart(currentPart){
        // get the next piece in the pool
        // if it's the last piece, return the first piece
        let currentIndex = current_edge_part_pool.indexOf(currentPart);
        if(currentIndex === current_edge_part_pool.length - 1){
            return current_edge_part_pool[0];
        }
        return current_edge_part_pool[currentIndex + 1];
    }
}

class RandomThought extends Widget {}
class Reminder extends Widget {}

// a little widget for drawing pixel art
// can use the output as icons for commands and widget backgrounds, etc...
// TODO: implement a basic file manager for saved media resources

class TodoWidget extends Widget {
    name = "Todo Widget"
    todos = []
    widgetSize = { width: 300, height: 150 }
    constructor(){
        super();
        this.input = mctx.createInput("");
        this.input.elt.placeholder = "Add Todo";
        this.input.parent('under-ui-elms')

        this.input.elt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.addTodo(this.input.value());
                this.input.value('');
            }
        });
    }
    recalcDimensions(){
        // based on the number of todos, let's grow up to a max height
        // from there we'll implement a nested scrollView for scrolling the list vertically
        // for now, just grow unbouded
        this.widgetSize.height = 150 + (this.todos.length * 20);
    }
    addTodo(thing){
        this.todos.push({value:thing, status:0});
        /** @see Dashboard.reflowLayout */
        this.dashboard?.reflowLayout();
    }
    updateTodo(id, newValue){
        this.todos[id] = newValue;
    }
    toggleTodo(index){
        this.todos[index].status = !this.todos[index].status;
    }
    setTodoStatus(index, status){
        this.todos[index].status = status;
    }
    draw(widgetID){
        // todo: split into super.preDraw/super.postDraw
        super.draw(...arguments); 

        this.input.position(
            // center the input box
            this.smartPosition.x + (panX/zoom) + (this.widgetSize.width/2) - (this.input.width/2),
            // tuck it above the bottom of the widget
            this.smartPosition.y + (panY/zoom) + this.widgetSize.height - 30
        )
        // if the command prompt is visible, hide the input since p5.js inputs are drawn over the canvas
        if(system.get("cmdprompt").visible){
            this.input.hide();
        }else{
            this.input.show();
        }
        
        fill("darkblue")
        textAlign(CENTER, CENTER);
        text(
            "Todos ("+this.todos.length+")",
            this.smartPosition.x + (this.widgetSize.width/2), 
            this.smartPosition.y + 20 // + (this.dimensions.height/2)
        )

        this.todos.forEach((todo,index)=>{
            fill(todo.status ? "green" : "darkblue")
            textAlign(LEFT, CENTER);
            text(
                (index+1)+" "+(todo.status ? '✅' : '❌')+" "+todo.value,
                this.smartPosition.x + 20, //+ (this.dimensions.width/2), 
                this.smartPosition.y + 60 + (index * 20)
            )
        })
    }
}

/* TODO */
class TimeSinceLoadWidget extends Widget {
}

class Sortable {
    constructor() {
        // Initialize any properties needed for sorting here
    }

    // Define any methods needed for sorting here
}

// for posting things to the void instead of Twitter
class UnTweet extends Widget {
    name = "UnTweet Widget"
    size = { width: 300, height: 150 }
    draw(){

    }
}

class TodoScanner {
    /* scans self-source code for todos */
}

class TodoImplementationProposer {
    /* proposes steps to address Todos */
}

class TodoImplementer {
    /* executes human-approved plans to address Todos */
}

class TodoImplementationTester {
    /* tests todo implementations, tracks for regressions and completion / bugs / readiness for release */
}

class TodoImplementationMonitor {
    /* monitors instances in the field of the solution for performance errors or bugs or other logs and analytics and metrics */
}

class TodoBackendManager {
    /* class for interfacing with the internals of the Todo Management System from privileged code */
}

class TodoServer {
    /* tiny webserver microservice which
    - serves the Todo Management System
    */
}

class PrioritizerWidget extends TodoWidget {
    constructor() {
        super();
        this.sortingContext = new Sortable();
    }

    // Override the addTodo method to add sorting functionality
    addTodo(thing) {
        super.addTodo(thing);
        this.sortTodos();
    }

    sortTodos() {
        // Implement your sorting logic here using this.todos and this.sortingContext
        // For example, you might do something like this:
        // this.todos.sort(this.sortingContext.compareFunction);
    }

    // You might also want to override the draw method to add UI for sorting
    draw(widgetID) {
        super.draw(widgetID);
        // Add your drawing code for the sorting UI here
    }
}

class ClockWidget extends Widget {
    name = "Clock Widget"
    widgetSize = { width: 300, height: 150 }
    /* 12-hr hour, mm, ss, milliseconds am/pm */
    get dateFormatted(){
        let date = new Date();
        let day = date.getDay();
        let dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][day];
        return `${dayName}\n${date.getMonth()+1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}`
    }
    get timeFormatted(){
        let date = new Date();
        let hours = date.getHours();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12; 
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');
        let milliseconds = ""; //"." + date.getMilliseconds();
        return `${hours}:${minutes}:${seconds}${milliseconds} ${ampm}`;
    }
    // format
    get time(){
        return Date.now();
    }
    onDraw(widgetID){
        super.onDraw(...arguments); // todo: split into super.preDraw/super.postDraw
        // just render the current time for now
        
        // this.ctx.push()
        this.ctx.fill("darkblue")
        this.ctx.textAlign(CENTER, CENTER);
        this.ctx.textFont('Georgia');
        this.ctx.textSize(32);
        this.ctx.textStyle(BOLD);
        this.ctx.text(
            this.dateFormatted + "\n" + this.timeFormatted, 
            (this.widgetSize.width/2), 
            (this.widgetSize.height/2)
        )
        // white overlay
        this.ctx.fill(255)
        this.ctx.text(
            this.dateFormatted + "\n" + this.timeFormatted, 
            (this.widgetSize.width/2) - 3, 
            (this.widgetSize.height/2) - 3
        )
        // this.ctx.pop()
    }
}
class TimeToSunSetWidget extends ClockWidget {
    constructor(){
        super(...arguments)
        // return the time to sunset based on my current location
        // for now we'll hard code the time:
        this.sunset_time = new Date();
        // set to 5:18 PM for 11/20/23 in Kingsport, TN
        this.sunset_time.setHours(17,18,0,0);
    }
    get dateFormatted(){
        let timeTosunset = this.sunset_time - Date.now();
        let hours = Math.floor(timeTosunset / (1000 * 60 * 60));
        let minutes = Math.floor((timeTosunset % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((timeTosunset % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s \nto sunset`
    }
    get timeFormatted(){
        return 'sunset'
    }
    draw(){
        super.draw(...arguments)

        this.drawSunsetGradient();
    }
    onDraw(widgetID){
        // todo: split into super.preDraw/super.postDraw
        super.onDraw(...arguments); 

        textAlign(CENTER, CENTER);
        fill("darkblue")
        text(
            this.dateFormatted + "\n" + this.timeFormatted,
            0 + (this.widgetSize.width/2),
            0 + 20 // + (this.dimensions.height/2)
        )
    }
    drawSunsetGradient(){
        // // draw a sunset themed background gradient
        // // from yellow to orange to red
        let lines = 10;
        let colorsToLerp = [
            "black",
            "purple",
            "red",
            "orange",
            "yellow",
            "blue",
            "green",
            "brown",
        ]
        for(let i = 0; i < lines; i++){
            // divide the display by the number of lines (horizontal bands)
            // draw rects to represent the gradient
            let colorIndex = Math.floor((i/lines) * colorsToLerp.length);
            let color = colorsToLerp[colorIndex];
            this.ctx.strokeWeight(0)
            this.ctx.fill(color);
            this.ctx.rect(
                0, 
                0 + (i * (this.widgetSize.height / lines)), 
                this.widgetSize.width, 
                this.widgetSize.height / lines
            )
        } 
    }

}
class GraphWidget extends Widget {}

// In the future the GherkinRunnerWidget will
// ask you which Feature(s)/Tags you want to run
// for now, let's just make one command that runs one feature
// then make it dynamic later
class GherkinRunnerWidget extends Widget {
    name = "Gherkin Runner Widget"
    constructor(sequence){
        super("Gherkin Runner Widget")
        this.gherkinRunner = new GherkinRunner(sequence);
    }
    loadSequence(sequence){
        // loads and validates the sequence
        this.gherkinRunner.loadSequence(sequence);
    }
    setResults(results){
        // todo validate results
        if(!results){
            system.panic("Widget.setResults: results cannot be null");
        }
        system.warn('Widget.setResults: results',results)
        this.results = results
        setTimeout(()=>{
            system.dashboard.reflowLayout()
        },100)
    }
    async run(){
        await this.gherkinRunner.run();
    }
    toggleRunning(){
        this.running = !this.running;
    }
    recalcDimensions(){
        this.widgetSize.width = Math.max(600, windowWidth - 60);
        this.widgetSize.height = 150 + (this.maxHeight ?? 0);

    }
    // render the widget
    onDraw(widgetID){
        super.onDraw(widgetID);
        let buttonSize = 30;
        // TODO: decide if we want to coordinate from top left or center center of the widgets by convention
        let buttonX = this.widgetSize.width - 40;
        let buttonY = 20;
        let triSize = 20; 
        let half_triSize = 5;

        // "run"/"pause" button
        fill(this.running ? "yellow" : "green")
        rect(
            buttonX + 10, 
            buttonY, 
            buttonSize, 
            buttonSize,
            5
        )
        let barWidth = 5;
        if(this.running){
            fill("white")
            // pause icon is two vertical bars
            rect(
                buttonX + 3, 
                buttonY, 
                barWidth, 
                buttonSize - 6
            )
            rect(
                buttonX + barWidth + 6, 
                buttonY, 
                barWidth, 
                buttonSize - 6
            )
        }else{
            fill("white")
            // draw "run" icon as a right-pointing triangle
            triangle(
                buttonX + 3,                    buttonY - 10, 
                buttonX + (buttonSize - 10),     buttonY, 
                buttonX + 3,                    buttonY + (buttonSize - 20)
            )
            
        }

        // Widget Label: # of results
        textAlign(CENTER, CENTER)
        fill("darkblue")
        text(
            `Features: ${this.results.length}`,
            (this.widgetSize.width / 2),
            // 20px off the top edge
            20
        )

        /** @see Widget.draw */

        //console.warn('GherkinRunnerWidget.draw');
        // rounded rect with status lights in rows and columns
        // each status light is a circle with a label
        // each status light is a different color
        // each status light represents the status of a passing or 
        // failing part of the current feature run
        let x = 20;
        let y = 20;
        this.maxHeight = 0;
        // let widgetWidth = 300
        // let widgetHeight = 300
        let yIncrement = 20;
        let xIncrement = 20;
        this.results.forEach((result,index)=>{
            y += yIncrement
            // remember to increment x and y
            // and fit the lights into the widget
            fill("red");
            circle(
                x,
                y,
                10
            );
            textAlign(LEFT, CENTER)
            text(
                // print Feature name
                "[Feature] "+result.name,
                x + 10,
                y
            )
            x += xIncrement;
            // loop over the scenario results
            // todo: add ability to collapse features
            Object.entries(result.results)
            .forEach(([scenarioName, scenarioResult])=>{
                x += xIncrement
                y += yIncrement

                textAlign(LEFT, CENTER)
                circle(
                    x,
                    y,
                    10
                );
                text(
                    "[Scenario] " + scenarioName,
                    x + 10,
                    y // + (index * yIncrement)
                )

                scenarioResult.stepResults
                .forEach((stepResult, stepIndex)=>{
                    //console.warn({stepResult})
                    //debugger;
                    x += 20;
                    y += yIncrement
                    //fill("yellow"); // status light
                    circle(
                        x,
                        y,
                        10
                    );
                    textAlign(LEFT, CENTER)
                    text(
                        // print Scenario name
                        `step ${stepIndex}`,
                        x + 20,
                        y, // + ((index + stepIndex + 1) * yIncrement)
                    )
                    this.maxHeight = Math.max(this.maxHeight, y + ((index + stepIndex + 1) * yIncrement));
                    x -= 20;
                })
                
                //de-indent back to the left
                x -= 20
            })
            // de-indent back to the left
            x = 20;
        })
    }
}


ClockDecorator = function(target) {
    class Clock {
        timeMultiplier = 1.0;
        multiplierSetAt = null;

        timePaused = false;
        pausedAtTime = null;
        
        constructor(){

        }
        pauseTime(){
            this.timePaused = true;
            this.pausedAtTime = performance.now();
        }
        setTimeMultiplier(multiplier){
            this.timeMultiplier = multiplier;
            this.multiplierSetAt = performance.now();
        }
        resumeTime(){
            this.resumedAt = performance.now();
        }
    }
    return function(...args) {
        const d = new target(...args);
        d.clock = new Clock();
        
        Object.defineProperty(d, 'getTime', {
            get: function() {
                if(d.timeMultiplier !== 1){
                    d.overrideTime = (performance.now() - d.multiplierSetAt) * d.timeMultiplier;
                    return d.overrideTime;
                }
                if(d.timePaused){
                    return d.pausedAtTime;
                }
                return Date.now();
            },
            set: function(){
                if(d.timePaused){
                    system.warn("skipping forward, then re-pausing...");
                }
                console.warn('todo write clock desync tracking logic')
            }
        });
        return d;
    }
}







/*
progress and todos
11.15.23: need to add arguments to commands
    - arguments should be flagged as required or optional
    - arguments should have a type (string, number, boolean, etc)
    - arguments should have a default value
    - arguments should have a description
    - arguments should have a name
    - arguments should have a label
    - arguments should have a placeholder
    - arguments should have a validation function

11.15.23: 2:15PM EST:
    - [ ] need to finish New Command Wizard
    - [ ] need to add a way to render an "Input" and destroy it when the MVC graph is loaded (since the observered input is what trigger events)
    - [ ] need a way to add breakpoints 
    - [ ] need a way to add a "watch" on a variable
    - [ ] need a stepped debugger
    - [ ] need a way to sandbox simultaneous execution

    - [ ] need a way to visualize "the system" in the graph view
    - [ ] need a way to do nested graphs (subgraphs)

    - [ ] need to refactor suggestion code so we can loop through them with the keyboard shortcuts (effectively stepping an offset value)
*/

class Argument {
    constructor({
        name, 
        label,
        description, 
        type, 
        defaultValue, 
        required, 
        validationFn
    }){
        this.name = name;
        this.label = label;
        this.description = description;
        this.type = type;
        this.defaultValue = defaultValue;
        this.required = required;
        this.validationFn = validationFn;
    }
}

/*
| Step Number | Refactoring Step |
|-------------|------------------|
| 1 | Modularize the Code |
| 2 | Use Constants |
| 3 | Improve Naming Conventions |
| 4 | Add Comments |
| 5 | Implement an Entity Component System (ECS) |
| 6 | Implement Computed Properties |
| 7 | Implement a Virtual DOM |
| 8 | Implement a Cache for Nodes |
| 9 | Implement a Cachebuster Timestamp |
| 10 | Optimize Loops |
| 11 | Use Web Workers for Long-Running Tasks |
| 12 | Use WASM for Performance-Critical Tasks |
| 13 | Use a Functional Programming Style |
| 14 | Use Switch Statements and Constants for Exhaustive Pattern Matching |
| 15 | Use Mixins and Higher-Order Functions for Extensibility |
| 16 | Add Unit Tests |
| 17 | Use a Linter |
| 18 | Use a Code Formatter |
| 19 | Implement an Interactive Graph Viewer |
| 20 | Synchronize the Graph Viewer with a Video Player |
*/

let cmdprompt;
/**
 * 
 * Array of Raycast rays
 * @type {Raycast[]}
 */
let raysToVisualize = [];

// TODO: move to MyMouseEvents
document.addEventListener('mousedown', function(event) {
    // if we clicked an iFrame, focus the top layer
    if (event.target.tagName === 'IFRAME') {
        console.warn('clicked an iframe!',{event})
        
    }

    // we'll add layer-swapping back in later
    // and per-layer shader hooks :D

    // system.todo("remember to update drawing canvas based on segmented z depth to allow for objects to traverse the z axis without swapping entire layers (tho if you need to we recommend it for performance reasons)")
        
    // keep the focus, just swap the top layer
    // deepCanvasManager.focusedIndex = deepCanvasManager.focusedIndex === 0 ? 1 : 0;
    // let topCanvas = deepCanvasManager.canvases[1];
    // deepCanvasManager.canvases[1] = deepCanvasManager.canvases[0];
    // deepCanvasManager.canvases[0] = topCanvas;

    // swap settings to match
    // let topCanvasSettings = deepCanvasManager.canvasSettings[1];
    // deepCanvasManager.canvasSettings[1] = deepCanvasManager.canvasSettings[0];
    // deepCanvasManager.canvasSettings[0] = topCanvasSettings;

    // draw a raycast from the mouse position
    let from = mctx.createVector(mouseX, mouseY);
    let to = mctx.createVector(windowWidth, windowHeight);
    let raycast = new Raycast(from, to);
    console.warn('RAY CAST RESULTS!',{
        raycast,
    })


    if(store.visualizeRays){
        raysToVisualize.push(raycast);
    }
    // decay: remove them over time
    setTimeout(()=>{
        raysToVisualize.unshift();
    },3000)
})
// double-click
document.addEventListener
('dblclick', function(event) {
    // Code to be executed on double click
    //system.todo("respond to double click!")
    InvokableCommands.RECENTER()
});


// Add a keyboard listener for cmd shift p shift+p
document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyP' && event.shiftKey && event.metaKey) {
        event.preventDefault();
        if(!store.CmdPromptVisible){
            cmdprompt.show();
        }else{
            cmdprompt.hide();
        }
    }
    if (event.code === 'Slash' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if(!store.CmdPromptVisible){
            cmdprompt.show();
        }else{
            cmdprompt.hide();
        }
    }
});

// debounce
let debounce = function(func, wait, immediate, options = {}) {
    let timeout;
    options = options || {};
    let leading = options.leading || false;
    let trailing = options.trailing || true;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            timeout = null;
            if (!immediate && trailing) func.apply(context, args);
        }
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait || 200);
        if (callNow || (leading && !timeout)) func.apply(context, args);
    }
}

// window.addEventListener('resize', function() {
//     onResizeDebounced();
// });

const MODES = {
    SELECT: 'select',
    PAN: 'pan',
    ADD_NODE: 'addNode',
    ADD_EDGE: 'addEdge',
    DELETE: 'delete',
}

const SAMPLE_GRAPHS = {
    EMPTY: 'empty',
    MVC: 'mvc',
    FLUX: 'flux',
    AJAX_FLUX: 'ajaxFlux',
}

// indicator LED
class StatusLight {
    x = 0;
    y = 0;
    r = 10;
    s = 3;
    c = 'red';
    name = 'L'
    constructor({x,y,r,c,s,name}){
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
        this.s = s;
        this.name = name;
    }
    draw(ctx){
        // note things like status lights get drawn on the gui layer
        // it's drawn ABOVE the "deep" canvas layers
        // and is (for now) never blurred (since it has notifications and stuff)
        ctx.push();
        ctx.fill(store[this.name]?"green":"red");
        ctx.circle(this.x,this.y,this.r);
        ctx.strokeWeight(this.s);
        ctx.stroke(this.s);
        ctx.fill(255);
        ctx.textAlign(LEFT, TOP);
        ctx.text(
            this.name,
            this.x+this.r+5,
            this.y+this.r+5
        );
        ctx.pop();
    }
}

// deepCanvasManager
class LayereredCanvasRenderer {
    canvases = []
    maxRendered = 1 // todo extend
    globalPan = {x:0,y:0}
    globalZoom = 0
    onClick(e){
        // go through the debug shapes and move the last one to the front of the array
        //this.debugShapes.unshift(this.debugShapes.pop());
        // wrap around focus on click
        this.focusedIndex--
        if(this.focusedIndex<0){
            this.focusedIndex = 1
        }
    }
    // for now, we assume we are working with 3 visible simultaneous canvases
    constructor(){
        window.addEventListener("click",this.onClick.bind(this))
        this.canvases = [];
        this.canvasSettings = [

        ]
        for(let i = 0; i < 3; i++){
            let sketch = function(p) {
                p.setup = function() {
                    p.createCanvas(windowWidth, windowHeight);
                }
                p.draw = function() {
                    // draw all widgets for this depth
                    system.get("Dashboard")?.widgetDepthOrder?.forEach?.((widgetID)=>{
                        let widget = system.get("Dashboard").widgets[widgetID];
                        if(widget.canvasID+1 === i){
                            if(
                                widget 
                                // && widget.visible 
                                // && !widget.doNotDraw
                            ){
                                widget.draw(widgetID);
                            }
                        }
                    })
                }
                p.onResize = function(){
                    p.resizeCanvas(windowWidth, windowHeight);
                }
            };
            this.canvases.push(new p5(sketch, `deep-canvas-${i+1}`));
            this.canvasSettings.push({
                blur: 50,
                clearFlag: true,
            });
        }
        // bind a window resize event handler
        document.addEventListener('resize',this.onResize.bind(this))

        /* uiContext */
        let sketchUI = function(p) {
            p.setup = function() {
            }
            p.draw = function() {
                p.clear()
                // p.fill("purple")
                // p.stroke("red")
                // p.strokeWeight(1)
                // p.rect(0,0,800,800)
                // p.rect(10,10,850,850)
                // p.rect(20,20,1000,1000)
            }
            // Define the mousePressed function
            p.mousePressed = function(){
                // bail early if one of our other handlers handled the click
                if(checkDidClickASuggestion()){
                    return;
                }
                if(checkDidClickAModeSwitcherButton()){
                    return;
                }

                // TODO: click handlers for widgets on the dashboard

                // maybe select a node
                if(store.currentGraph && store.currentGraph.OnMousePressed){
                    store.currentGraph.OnMousePressed();
                }

                panningBG = true;
                dragStartX = mouseX;
                dragStartY = mouseY;

                // if (
                //     store.currentGraph 
                //     && !store.currentGraph.selectedNodeIDs.length
                // ) {
                    // NOTE: we need to NOT flag as panning
                    // based on the click target and any current MODE override
                    // like maybe we should be allowing drag / drop
                    // or spawning a connection spline
                    
                // } else {
                //     panningBG = false;
                // }
            }
            p.onResize = function(){
                p.resizeCanvas(windowWidth, windowHeight);
            }
            // Define the mouseDragged function
            p.mouseDragged = function(event){
                let blockPan = false;
                if(store.currentGraph){
                    store.currentGraph.OnMouseDragged(event);
                    blockPan = store.currentGraph.selectedNodeIDs.length > 0;
                }
                if(!blockPan){
                    panX += mouseX - pmouseX;
                    panY += mouseY - pmouseY;
                }
                // update our stored momentum vector by checking the delta
                // between the current and previous mouse positions
                panMomentumVector.x += (mouseX - pmouseX) * store.panMomentumDecay;
                panMomentumVector.y += (mouseY - pmouseY) * store.panMomentumDecay;
            }
        };
        this.uiContext = new p5(sketchUI, `deep-canvas-ui`);
        console.warn('uiContext',{uiContext:this.uiContext})
        this.uiContext.resizeCanvas(windowWidth, windowHeight);

        //this.draw()
    }


    getProcessingJSWebGL3DContext(){
        // if one exists, it is returned
        // else none exist, and layer is added and the context is returned
        if (this.webGLContext) {
            return this.webGLContext;
        } else {
            let newLayer = this.addLayer('webgl');
            this.webGLContext = newLayer.getContext('webgl');
            return this.webGLContext;
        }
    }

    addLayer(typename){
        let createdLayer = null;
        switch(typename){
            case 'html':
                createdLayer = this.createHTMLLayer();
                break;
            case 'webgl':
                createdLayer = this.createWebGLLayer();
                break;
            case 'three.js':
                createdLayer = this.createTHREEJSLayer();
                break;
            case 'p5js2d':
                createdLayer = this.createP5JS2DLayer();
                break;
            case 'd3js':
                createdLayer = this.createD3JSLayer();
                break;
            default:
                system.panic(`Failed to create Rendering Layer; unknown layer type ${typename}`)
                break;
        }
        return createdLayer;
    }

    onResize(){
        // update the dimensions to match the window (of all 3 canvases)
        this.canvases.forEach((canvas)=>{
            canvas.resizeCanvas(windowWidth, windowHeight);
        })
    }
    debugShapes = [
        {
            name: "rect",
            color: "red",
            args: [0,0,100,100]
        },
        {
            name: "ellipse",
            color: "blue",
            args: [0,0,100,100,5]
        },
        {
            name: "triangle",
            color: "green",
            // arg order === p5.js triangle arg order
            // x1,y1,x2,y2,x3,y3
            args: [0,0,100,100,0,100]
        }
    ]
    focusedIndex = 0;
    draw(){
        if(store.disableDeepCanvas){
            return;
        }
        this.canvases.forEach((canvas,index)=>{
            this.drawDebugShapeToDeepCanvasLayer(index)
        })
        // set the blur on the foreground layer canvas and the background canvas
        // for now we hard-code, but eventually we can make this dynamic
        // or just fully move to shader/three.js land
        // todo: cache / dirty-check updates
        this.canvases.forEach((canvas, index) => {
            
            document.getElementById(`deep-canvas-${index+1}`).style.filter = `blur(${index-1 === this.focusedIndex ? 0 : store.deepCanvasBlurLevel}px)`;
        });
        // if the focusedIndex !== 0, we need to blur the "main" canvas too
        document.querySelector('main canvas').style.filter=`blur(${this.focusedIndex === 0 ? '0' : store.deepCanvasBlurLevel}px)`
        if(document.querySelector('#threejscanvas')){
            document.querySelector('#threejscanvas').style.filter=`blur(${this.focusedIndex === 1 ? '0' : store.deepCanvasBlurLevel}px)`
        }
        // if we have any iframes, blur them too when not focused on layer "1"
        if(document.querySelectorAll("iframe").length){
            Array.from(document.querySelectorAll("iframe")).forEach((v,k)=>{
                v.style.filter = `blur(${this.focusedIndex === 1 ? '0' : store.deepCanvasBlurLevel}px)`;
            })
        }
    }
    angles = [];
    drawDebugShapeToDeepCanvasLayer(canvasIndex){
        const canvas = this.canvases[canvasIndex];
        if(this.canvasSettings[canvasIndex].clearFlag){
            canvas.clear();
        }


        if(!this.angles[canvasIndex]){
            this.angles[canvasIndex] = 0;
        }

        // TODO: object define on window for caching
        let halfWidth = windowWidth/2
        let halfHeight = windowHeight/2

        canvas.push();
        canvas.translate(mouseShifted.x, mouseShifted.y);
        canvas.translate(
            panX - (halfWidth*zoom), 
            panY -(halfHeight*zoom)
        );
        canvas.scale(zoom);
        const shape = this.debugShapes[canvasIndex];
        // p5.js automatically knows which canvas to draw on based on the canvas object we're calling the methods on.
        // There's no need to call setcontext or currentCanvas.
        // The canvas object encapsulates its own context.
        canvas.strokeWeight(5);
        canvas.stroke("black");
        canvas.fill(shape.color);

        //canvas.rect(0,0,100,100);
        let inargs = [...shape.args]
        let angle = this.angles[canvasIndex];
        //  invert the angle if the index is odd
        if(canvasIndex % 2 === 1){
            angle = -angle;
        }
        let radius = 20;
        // x
        inargs[0] += (panX * zoom) + (radius * Math.cos(angle));
        // y
        inargs[1] += (panY * zoom) + (radius * Math.sin(angle));
        if(shape.name === "triangle"){
            // x2
            inargs[2] += (panX * zoom) + (radius * Math.cos(angle));
            // y2
            inargs[3] += (panY * zoom) + (radius * Math.sin(angle));
            // x3
            inargs[4] += (panX * zoom) + (radius * Math.cos(angle));
            // y3
            inargs[5] += (panY * zoom) + (radius * Math.sin(angle));
        }
        this.angles[canvasIndex] += .01;
        // if angle is 2pi, reset to 0
        if(this.angles[canvasIndex] >= Math.PI * 2){
            this.angles[canvasIndex] = 0;
        }
        canvas[shape.name](...inargs);
        canvas.textAlign(CENTER, CENTER)
        canvas.textSize(32)
        // canvas.fill("white")
        canvas.stroke("black")
        canvas.strokeWeight(1)
        canvas.text(canvasIndex, panX*zoom, panY*zoom)
        canvas.pop();

    }
}

currentDrawingContext = null;
function mySpecialDrawingContext(canvasIndex){
    // switches between the 3 canvases based on .canvasID
    if(canvasIndex === -1){
        // -> foreground, 0
    }else if(canvasIndex === 0){
        // -> midground, 1
    }else if(canvasIndex === 1){
        // -> background, 2
    }
}

function extractQueryParamsOrDefaults(string){
    let requestedWidth = null;
    let requestedHeight = null;
    try {
        const url = new URL(string);
        requestedWidth = url.searchParams.get('width');
        requestedHeight = url.searchParams.get('height');
    } catch (e) {
        console.error(`Failed to parse URL: ${e.message + ' ' + result}`);
    }
    // normalize requestedWidth/height to ints, with defaults based on the current window size
    requestedWidth = requestedWidth 
        ? Math.min(window.windowWidth - 20, parseInt(requestedWidth)) 
        : window.windowWidth / 2;
    requestedHeight = requestedHeight 
        ? Math.min(window.windowHeight - 20, parseInt(requestedHeight)) 
        : window.windowHeight / 2;

    return {requestedWidth,requestedHeight}
}

// TODO: extend Renderable
// this is a Widget Rendering Context
// NOTE: we stack multiple Dashboards assigned to 3 canvases
// the foreground, and background canvases are snapshots of the midground canvas as it passed INTO the FG or BG during a Zoom Level Context Shift
// we do this so we can cache the canvas and apply a blur to it, and then use the cached blurred image texture to represent the frozen layer,
// the frozen layers (out of focus layers) are panned with parallax factors when the midground is panned to simulate depth of field
class Dashboard {
    widgetLayoutOrder = []
    widgetDepthOrder = []
    widgets = {}
    // we animate widgets, so we need to track their current positions and their target positions
    layout = {}
    visible = true
    collapsed = false
    // clear(){
    //     throw new 
    //     //this.visible = false
    //     // this.widgets = {}
    //     // this.widgetLayoutOrder.length = 0
    //     // this.widgetDepthOrder.length = 0
    // }
    init(){
        // TODO: extend an entity component system where components have active state as boolean
        this.active = true;
        return this; // chainable
    }
    toggleCollapsed(){
        this.collapsed = !this.collapsed;
        if(this.collapsed){
            this.collapse()
        }else{
            this.reflowLayout();
        }
    }
    collapse(){
        this.collapsed = true;
        // update widget Target positions to be in a stack (slight offset per card)
        this.widgetLayoutOrder.forEach((widgetID,index)=>{
            let widget = this.widgets[widgetID]
            let x = index * -3;
            let y = index * 3;
            let w = widget.widgetSize.width;
            let h = widget.widgetSize.height;
            this.layout[widgetID] = {
                x,y,w,h
            }
        })
    }
    centerView(resetZoom = false){
        // Instantiate and start the animations
        // const panXAnimation = new Animation(panX, 0, 1000, value => panX = value);
        // const panYAnimation = new Animation(panY, 0, 1000, value => panY = value);
        // const zoomAnimation = new Animation(zoom, 1, 1000, value => zoom = value);

        // requestAnimationFrame(panXAnimation.animate.bind(panXAnimation));
        // requestAnimationFrame(panYAnimation.animate.bind(panYAnimation));
        // requestAnimationFrame(zoomAnimation.animate.bind(zoomAnimation));

        console.warn('make cancelable!')
        animateVector(
            /* from */ 
            {x:panX,y:panY,z:zoom},
            /* to */ 
            {x:0,y:0,z:resetZoom?(zoom == 1.2 ? 0.5 : 1.2 ):zoom}, 
            /*onUpdate*/
            (value, fieldName)=>{
                // console.warn('onupdate',{value,fieldName})
                //window[fieldName] = value;
                switch(fieldName){
                    case 'x':
                        panX = value;
                        break;
                    case 'y':
                        panY = value;
                        break;
                    case 'z':
                        zoom = value;
                        break;
                }
            }, 
            /* duration ms */ 
            500
        );
    }
    toggleVisibility(){
        this.visible = !this.visible;
    }
    reflowLayout(){
        // make sure the body, html els did not scroll away from 0,0
        // this is a hack to fix a bug where the body scrolls away from 0,0
        document.body.scrollTo(0,0,{behavior:"instant"})

        // let the widgets redefine their sizes
        this.widgetLayoutOrder.forEach((widgetID)=>{
            this.widgets[widgetID]?.recalcDimensions?.();
        })

        // for now we assume cube widgets and grid layout
        // allow extension for more advanced / customizable layout with pinned widgets,
        // custom sized widgets, etc
        let currentRowWidth = 0, 
        accumulatedRowOffset = 0, 
        currentRowMaxHeight = 0, 
        prevRowHeight = 0,
        currentRowIndex = 0;

        const space = 3; //420;
        
        // Sort widgets by height in descending order
        this.widgetLayoutOrder.sort((a, b) => {
            let widgetA = this.widgets[a];
            let widgetB = this.widgets[b];
            let heightA = widgetA && widgetA.widgetSize ? widgetA.widgetSize.height : 0;
            let heightB = widgetB && widgetB.widgetSize ? widgetB.widgetSize.height : 0;
            return heightB - heightA;
        });

        this.widgetLayoutOrder.forEach((widgetID, index) => {
            let widget = this.widgets[widgetID];
            if (!widget || !widget?.widgetSize) {
                system.panic("Dashboard.reflowLayout: widget or widgetSize not found\n\n\nDid you forget to extend Widget base class?", { widgetID, widget });
            }

            let w = widget.widgetSize.width;
            let h = widget.widgetSize.height;

            let padding = 1; // Define padding
            w = w - 20 * padding; // Subtract padding from width
            h = h - 20 * padding; // Subtract padding from height

            // let virtualWidth = windowWidth / zoom;
            // if (currentRowWidth + w + space > virtualWidth) {
            //     prevRowHeight = currentRowMaxHeight;
            //     currentRowIndex++;
            //     currentRowWidth = 0; // Reset row width
            //     accumulatedRowOffset += prevRowHeight + space; // Increase space between widgets vertically
            // }
            currentRowMaxHeight = Math.max(currentRowMaxHeight, h);
            let x = currentRowWidth;
            let y = accumulatedRowOffset;

            this.layout[widgetID] = {
                x, y, w, h
            }

            currentRowWidth += w + space; 
        });
    }
    newWidget(){
        this.registerWidget(...arguments)

        return this; // chainable
    }
    registerWidget(widgetIDOrInstance,instanceOrNull){
        // console.warn("registerWidget",{
        //     widgetIDOrInstance,
        //     instanceOrNull
        // })
        // if widgetIDOrInstance contains youtube.com, return a new youtube widget instance instead
        
        let launched = -2;
        if(typeof widgetIDOrInstance === 'string'){
            // see if it's an invokable uri
            launched = system.tryInvokeHandlerForUri(widgetIDOrInstance);
        }
        if(launched === -2 || launched === -1){
            // not a uri, or no handler found
        }else{
            console.warn('Dashboard.registerWidget: uri handler found, returning early')
            return;
        }

        let widgetID, widgetInstance = widgetIDOrInstance;
        if(typeof widgetIDOrInstance !== "string"){
            //system.panic('Dashboard.registerWidget: widgetID must be a string',widgetID)
            if(typeof instanceOrNull === `undefined`){
                // assign an ID
                //widgetInstance = widgetIDOrInstance; // swap
                widgetID = "WidgetInstance"+performance.now();
            }else{
                widgetInstance = instanceOrNull
            }
        }
        // require both args
        if(!widgetID || !widgetInstance){
            system.panic('Dashboard.registerWidget: missing required args',{widgetID,widgetInstance,arguments})
        }
        // define a back reference
        widgetInstance.dashboard = this; 
        this.widgetDepthOrder.unshift(widgetID);
        this.widgetLayoutOrder.unshift(widgetID);
        this.widgets[widgetID] = widgetInstance;
        
        // console.warn("Dashboard > Register Widget",{
        //     widgetID,
        //     widgetInstance,
        //     depthLen: this.widgetDepthOrder.length,
        //     layoutLen: this.widgetLayoutOrder.length,
        // })

        // reflow widget layout
        this.reflowLayout();

        return this; // chainable
    }
    deRegisterWidget(widgetID){
        
        // remove from widgetDepthOrder, widgetLayoutOrder
        this.widgetDepthOrder.splice(this.widgetDepthOrder.indexOf(widgetID),1);
        this.widgetLayoutOrder.splice(this.widgetLayoutOrder.indexOf(widgetID),1);

        console.warn('Dashboard.deRegisterWidget:',{
            depthLen: this.widgetDepthOrder.length,
            layoutLen: this.widgetLayoutOrder.length,
        });

        // reflow widget layout
        this.reflowLayout();

        return this; // chainable
    }
    closeAllWidgets(){
        Object.entries(this.widgets)
        .forEach(([key, widget]) => {
            widget?.close?.();
        });
        this.widgets = {}
        this.widgetDepthOrder.length = 0;
        this.widgetLayoutOrder.length = 0;

        // console.warn("Dashboard.closeAllWidgets",{
        //     depthLen: this.widgetDepthOrder.length,
        //     layoutLen: this.widgetLayoutOrder.length,
        // })

        // reflow widget layout
        this.reflowLayout();

        // center the view
        this.centerView();

        return this; // chainable
    }
    shuffleWidgets(){
        this.widgetLayoutOrder = mctx.shuffle(this.widgetLayoutOrder);
    }
    shuffleWidgetPositions(){
        this.shuffleWidgets();

        // randomize widget zDepth and order in the widgetIDs array
        this.widgetLayoutOrder.forEach((widgetID,index)=>{
            /*
            z = index
            */
            let z = Math.round(mctx.random(
                minWidgetDepth,
                maxWidgetDepth
            ))
            this.widgets[widgetID].zDepth = z;
            this.widgets[widgetID].canvasID = Math.round(mctx.random(-2,2))
        });
        
        this.updateWidgetDepthOrder();
    }
    updateWidgetDepthOrder() {
        // Assuming `widgets` is an object where keys are widget IDs and values are widget objects
        // And each widget object has a `z` property indicating its Z-order
        this.widgetDepthOrder.sort((a, b) => this.widgets[a].zDepth - this.widgets[b].zDepth);
        // pass the zDepth value into the widget
        this.widgetDepthOrder.forEach((widgetID,index)=>{
            this.widgets[widgetID].zDepth = index;
        });
    }
    draw(){
        if(!this.visible){
            return;
        }

        // check our draw order
        // TOOD don't do this every frame, do it when the draw order changes
        this.updateWidgetDepthOrder()

        // reset our hover elements
        hoveredArray.length = 0;
        this.widgetDepthOrder.forEach((widgetID)=>{
            if(!this.widgets[widgetID]){
                system.error('Dashboard.draw: widget not found',widgetID)
                return;
            }
            let scaledTarget = {
                x: this.layout[widgetID].x, // * zoom,
                y: this.layout[widgetID].y  //* zoom,
            }
            // aka widget.draw()
            this.widgets[widgetID]
                .setTargetPosition(scaledTarget)
                .draw(widgetID);
        });
        // if there's at least one hovered widget, set the cursor to pointer
        document.body.style.cursor = hoveredArray?.length 
            ? "pointer" 
            : "default";
    }
    focusWidget(id){
        // pan our view so the widget is centered on the screen
        // account for the widgetSize
        // adjust the zoom level so the widget fills as much of the screen as possible without being cropped
        const widget = this.widgets?.[id];
        if(!widget){ 
            system.panic("Dashboard.focusWidget: widget not found",{id}) 
        } else {
            // Assuming widget has properties x, y for its position and width, height for its size
            const centerX = widget.x + widget.width / 2;
            const centerY = widget.y + widget.height / 2;

            // Assuming we have a method to set the center of the view
            this.setViewCenter(centerX, centerY);

            // Assuming we have a method to get the size of the view
            const viewWidth = this.getViewWidth();
            const viewHeight = this.getViewHeight();

            // Calculate the zoom level so the widget fills as much of the screen as possible without being cropped
            const zoomLevel = Math.min(viewWidth / widget.width, viewHeight / widget.height);

            // Assuming we have a method to set the zoom level of the view
            this.setViewZoom(zoomLevel);
        }
    }
}

// Define the initial state of the store
let store = {
    /* motion sick mode by default */
    disableSprites: 1,

    showDebugLayer: 0,
    showDebugCursor: 0,
    windowHasFocus: true,
    disableDeepCanvas: 0,
    deepCanvasBlurLevel: 10, // in px for now: make relative
    focused: true,
    touchInputs: [],
    pinchScaleFactor: 1,
    cullOutOfBoundsWidgets: 1,
    DISABLE_PARALLAX: 0,

    // when typing in the command prompt, we also filter the current widgets
    // in case you are searching for just Todos or something
    filteredWidgetIDs: [],


    // Define the initial state of the canvas
    zoom: 1,
    panX: 0,
    panY: 0,
    panningBG: false,
    dragStartX: 0,
    dragStartY: 0,
    panMomentumVector: {
        x: 0,
        y: 0
    },
    // there's panning parallax, and then there's mouse peek on top
    // of that to exaggerate the effect and explore the edges of the canvas
    mouseExtraPanPeekVelocity: {
        x: 0,
        y: 0
    },
    panFriction: 0.3,
    panMomentumDecay: 0.01,

    // use command Toggle Clear Mode to disable bg clear on draw for a fun
    // trippy effect
    clearMode: true,
    interactionMode: MODES.PAN,
    shiftIsPressed: false,

    currentPlaxExpFactor: 1, // 1-2 is good

    //

    maxThumbstickMomentum: 10,
    thumbstickMomentum: 0,
    tStickMomentumDecay: 0.9,
    thumbstickPosition: {x:0,y:0},
    // rolling average of thumbstick readings
    thumbstickReadings: [],
    averageThumbstickReading: {x:0,y:0},
    tStickGain: 0.01,
    tStickDeadzone: 0.5,

    // for now, one dashboard per client instance
    // in the future we'll make it a sub-instance on a per-system basis
    // perhaps even allowing simultaneous dashboards, with one active / current one at a time
    // assume they require fullscreen draw access and don't like to share?
    // ExclusiveRenderContext vs SharedRenderContext s
    // next up: multi-pages of dashboards
    Dashboard: null,
    // maybe we just store these IN dashboard manager?...
    widgets: {},
    showWidgetPositions: 1, //false,

    // viewValue: '',
    // controllerValue: '',
    // modelValue: '',
    // modelValueFromView: '',
    // eventId: 0,

    lastReceived: Date.now(),
    
    // moved to currentGraph
    // mode: 'mvc', // default mode
    // nodes: [],
    // edges: [],
    // events: [],
    
    commandBuffer: {
        name: ''
    },
    currentCommand: {},
    commandHistory: [],
    CmdPromptVisible: false,

    activeWizard: null,
    // user defined commands
    // todo: load these from local storage / remote storage
    // todo: cache these to local storage / remote storage
    customCommandFactories: {},
    customCommandInstances: {},

    currentGraph: null,

    maxVisibleOptionsCount: 10,

    dynamicStuff: {},

    status_lights: (()=>{
        // Generate Default Lights
        const lights = {
            // rendererStarted:null,
            // rendererHasOptionsToRender:null,
            shiftIsPressed:null,
            panningBG:null
        }
        Object.keys(lights).forEach((name,index)=>{
            lights[name] = new StatusLight({
                name,
                x: 30 + (index * 30),
                y: 30,
                r: 15,
                s: 3,
                c: 'red'
            })
        })
        return lights;
    })(),

    tables: [],

    /* SimpleToggle() -> Invokable via CommandPrompt */
    displayWidgetLabels: true,
};
window.store = store;
const mergeStateFromLocalStorage = function(state){
    if(!state || !Object.keys(state).length){
        return;
    }
    // merge state from local storage
    Object.entries(state).forEach(([key,value])=>{
        console.warn('considering state update',{key})
    })
}

// console.warn('TODO: 1 store per sandbox');

class DynamicThing {
    constructor(options){
        this.options = options ?? {}
        // todo: mixin for default options to extend here
    }
}

class ToggleableThing extends DynamicThing {
    toggleState = false; // off by default
}

class AST {
    cursor = {x:0,y:0};
    root = [];
    setCursor(x,y){
        cursor = {x,y};
    }
    getClosestNode(treeLevel){
        let minDist = Math.Infinity;
        let closestNode = null;
        for(let candidate of treeLevel){
            if(Array.isArray(candidate)){
                // keep digging
                // TODO: improve search
                // by killing branches with
                // consistently increasing distances
                let result = this.getClosestNode(candidate);
                if(result.minDist < minDist){
                    minDist = result.minDist;
                    closestNode = result.closestNode;
                }
            }else{
                // base case!
                let d = this.getDistanceToNode(candidate);
                if(d < minDist){
                    minDist = d;
                    closestNode = node;
                }
            }
        }
        return {
            minDist,
            closestNode
        }
    }
    // aka getDistanceToCursor
    getDistanceToNode(node){
        return dist(node.x,node.y,cursor.x,cursor.y);
    }
    getNodeAtCursor(){
        let parent = this.getParentForCursor(cursor);
    }
    parseCursor(cursorString){
        return {
            // Total Depth within the AST
            // 0 for root level nodes
            x: cursor.split('.')[0],
            // Immediate Depth with the parent Node (if any)
            y: cursor.split('.')[1]
        }
    }
    getParentForCursor(cursor){

    }
    addNodeAtCursor(cursor, node){
    }
}

/**

    Note: due to Gherkin syntax parsing requirements:

    givens CAN be chained onto other givens
    givens CAN also be chained onto whens
    but givens CANNOT be chained onto thens

    @deprecated (for now?)
*/
class GherkinBusinessReq {
    name = "GherkinBusinessReq"
    // givens = []
    // whens = []
    // thens = []
    ast = []

    addGiven(given){
    }
    addThen(then){
    }
    addWhen(when){
        this.ast.addNodeAtCursor(when);
    }
}

/* used by our parser to build the AST */
const GHERKIN_AST_TOKENS = {
    FEATURE: 'Feature',
    SCENARIO: 'Scenario',
    STEP: 'Step',
    GIVEN: 'Given',
    WHEN: 'When',
    THEN: 'Then',
    AND: 'And',
    BUT: 'But', // our implementation doesn't support this
    BACKGROUND: 'Background',
    EXAMPLES: 'Examples',
    OUTLINE: 'Outline',
    END_FEATURE: 'EndOfFeature',
    END_SCENARIO: 'EndOfScenario',
    // STEP: 'Step',
    BACKGROUND_STEP: 'BackgroundStep',
    SCENARIO_OUTLINE: 'ScenarioOutline',
    EXAMPLE_ROW: 'ExampleRow',
    TAG: 'Tag',
    COMMENT: 'Comment',
    BLANK: 'Blank',
    TO_BE_IMPLEMENTED: 'TO_BE_IMPLEMENTED',
};

const ToBeImplemented = GHERKIN_AST_TOKENS.TO_BE_IMPLEMENTED

/**
 * Rules for valid state transitions that 
 * a Gherkin parser can make when parsing
 * a Valid Gherkin Feature Definition
 * in a particular JSON format as
 * described here:
 * @see FeatureTest
 * @see GFDParser
 */
class GherkinParserTransitionMatrix {
    tt = null
    get matrix(){
        return this?.tt?.pairs ?? [];
    }
    /**
     * 
     */
    constructor(){
        // TODO: nestable state machines
        this.tt = new TruthTable();
        const S = GFDParser.PARSER_STATES;
        // these are all the valid state transitions
        /**
         * START  
         |   └── FEATURE  
         |       └── SCENARIO  
         |           └── GIVEN  
         |               ├── GIVEN (optional)  
         |               └── WHEN  
         |                   ├── WHEN (optional)  
         |                   └── THEN  
         |                       ├── THEN (optional)  
         |                       └── SCENARIO (optional)
         */
        this.tt.bulkAllow([
            // start -> feature
            [S.START, S.FEATURE],
                // feature -> scenario
                [S.FEATURE, S.SCENARIO],
                    // scenario -> given
                    [S.SCENARIO, S.GIVEN],
                        // *opt* given -> given
                        [S.GIVEN, S.GIVEN],
                            // *req* given -> when
                            [S.GIVEN, S.WHEN],
                        // *req* when -> then
                        [S.WHEN, S.THEN],
                            // *opt* when -> when
                            [S.WHEN, S.WHEN],
                        // *opt* then -> then
                        [S.THEN, S.THEN],
                        // *opt* then -> scenario
                        [S.THEN, S.SCENARIO], 
                    [S.SCENARIO, S.TO_BE_IMPLEMENTED],
                [S.TO_BE_IMPLEMENTED, S.SCENARIO],
        ])
        // log our allowed transitions
        console.warn('GherkinParserTransitionMatrix: allowed transitions:',this.matrix)
    }
}

// a factory that takes in a Gherkin definition class
// and parses it out into an AST
// which is then converted to an executable sequence
// handles validation along the way
// tracking syntax errors and warnings/suggestions
// aka FeatureDefinitionToSequenceParser
class GFDParser {
    // array of messages about our parsing work
    /** GherkinSequence */
    output = null
    // our instance of a FeatureTest class
    // which we parse into executable GherkinSequence
    definition = null

    parserStateMachine = null

    constructor(definition){
        // console.warn('GFDParser: constructor(definition):',{
        //     type: typeof definition,
        //     constructorName: definition?.constructor?.name,
        //     definition
        // })

        // if (!(definition instanceof FeatureTest)) {
        //     throw new Error(
        //         "GFDParser: " +
        //         "definition must be an instance of FeatureTest" +
        //         "got: " + (definition?.constructor?.name ?? 'undefined')
        //     );
        // }
        if(definition?.scenarios === ToBeImplemented){
            // no-op, let the ToBeImplemented scenario pass through
            // even tho it should technically fail pre-validation
        }
        else if(definition?.scenarios){
            // we're... good probably?
        }
        else if(definition?.scenarioZZZ){
            if(!definition?.postConstructorCalled){
                // do we waitUntilTrue here?
                // constructors can't be async, so we'd have to wrap the GFDParser in a promise in a ParserFactory->newParserAsync()
                //debugger;
                // for now, just force the postConstructor to be called
                if(!definition?.postConstructor?.call){
                    system.panic("GFDParser: definition.postConstructor must be a function!",{badDefinition:definition})
                }
                definition.postConstructor();
                if(!definition?.scenarioZZZ){
                    system.panic("GFDParser: definition.postConstructor must provide values for get scenarioZZZ!",{badDefinition:definition})
                }
            }else{
                system.panic("GFDParser: no scenarioZZZ provided!",{
                    "GFDParser:ctor(definition) Failing Definition:":definition
                })
            }
        }

        this.definition = definition;
    }

    // states:
    // - start (no tokens read yet)
    // - parsingFeature - feature open token read, but no scenarios yet
    // - parsingScenario - in a feature > scenario, but not in a step
    // - parsingStep - in a feature > scenario > step
    
    // -- TODO: add And, Scenario Outline, Example, Tag, Comment, Blank
    
    // - fatalErrorState - encountered a fatal error
    static PARSER_STATES = {
        START: 'Start',
        FEATURE: GHERKIN_AST_TOKENS.FEATURE,
        SCENARIO: GHERKIN_AST_TOKENS.SCENARIO,
        GIVEN: GHERKIN_AST_TOKENS.GIVEN,
        WHEN: GHERKIN_AST_TOKENS.WHEN,
        THEN: GHERKIN_AST_TOKENS.THEN,
        FATAL_ERROR_STATE: 'Fatal Error State',
        TO_BE_IMPLEMENTED: GHERKIN_AST_TOKENS.TO_BE_IMPLEMENTED,
    }

    throwFatalError(message){
        // put the parser in a fatal state
        this.parserStateMachine.setState(GFDParser.PARSER_STATES.FATAL_ERROR_STATE);
        // panic the system
        system.panic(message);
    }

    parse(){
        if(!this.definition){
            system.panic("GFDParser: no definition provided")
        }

        if(!this.definition?.scenarioZZZ){
            //system.debug({CHECK_DEF:this.definition})
            system.dump({scenariolessDefinition:this.definition})
            system.panic("GFDParser: no scenarios provided at all!")
        }

        // Definition must have at least one Feature > Scenario at parse time
        if(!Object.keys(this.definition?.scenarioZZZ ?? {})?.length){
            system.panic("GFDParser: empty scenarios object provided")
        }
        
        let truthMatrix = new GherkinParserTransitionMatrix().matrix;

        this.parserStateMachine = new StateMachine({
            states: GFDParser.PARSER_STATES,
            
            defaultStateID: GFDParser.PARSER_STATES.START,

            transitionMatrix: truthMatrix
        })

        //this.parserStateMachine.debugPrintCoverage();

        // Begin Parsing
        const tokenDefinitions = [];
        tokenDefinitions.push({
            __type: GHERKIN_AST_TOKENS.FEATURE,
            value: this.definition?.name ?? 'Unnamed Feature',
            index: 0
        })

        if(this.definition?.name){
            if(this.definition.name === "UnconfiguredFeatureTest"){
                system.dump({definition:this.definition})
                system.panic("GFDParser: UnconfiguredFeatureTest");
            }
            //console.warn(`Parsing Feature Description name: ${this.definition.name}`)
        }

        if(this.definition?.background){
            system.warn('TODO: implement background parsing of FeatDef: background',{
                background: this.definition.background,
                featTestDef: this.definition
            });
        }

        
        // we loop through this.definition.scenarioZZZ
        let scenarioCount = 0;
        Object.keys(this.definition.scenarioZZZ).forEach((scenarioKey)=>{
            scenarioCount++;
            
            //console.warn(`Parsing FeatDesc Scenario: ${scenarioCount} ${scenarioKey}`)

            const steps = this.definition.scenarioZZZ[scenarioKey];

            // push a open_scenario token
            tokenDefinitions.push({
                __type: GHERKIN_AST_TOKENS.SCENARIO,
                value: scenarioKey,
                index: scenarioCount
            })

            const stepKeys = [
                GHERKIN_AST_TOKENS.GIVEN,
                GHERKIN_AST_TOKENS.WHEN,
                GHERKIN_AST_TOKENS.THEN
            ];

            if(steps === ToBeImplemented){
                // continue
                tokenDefinitions.push({
                    __type: GHERKIN_AST_TOKENS.TO_BE_IMPLEMENTED,
                    value: scenarioKey,
                    index: scenarioCount
                })
                return;
            }

            if(typeof steps === 'string'){
                system.dump({
                    stepsButItsAString: steps,
                })
                system.panic("shouldn't have a string here!");
            }

            // pre-process any steps that are in the format: "given ...", "then ...", "when..."
            if(Array.isArray(steps)){
                system.dump({
                    steps
                })
                system.panic("GFDParser: scenario steps must be an object, not an array");       
            }

            stepKeys.forEach((stepKey)=>{
                // GIVEN, WHEN, THEN
                let checkStep = getMatchingKeyValueCaseInsensitive(steps,stepKey);
                if(!checkStep){
                    system.panic(`GFDParser: scenario must have a "${stepKey}". scenarioKey: ${scenarioKey}"`);
                }else{
                    // if it's an array, add them all, flatten
                    // else add the single step as a string
                    const values = Array.isArray(checkStep) 
                    ? checkStep 
                    : [checkStep];
                    const wrappedValues = values.map((value,index)=>{
                        return {
                            __type: stepKey,
                            value,
                            index
                        }
                    })
                    //system.warn(`parsing Scenario Definition Steps: ${stepKey}`,{wrappedValues})
                    tokenDefinitions.push(
                        ...wrappedValues
                    );
                }
            })
            //console.warn('just pushed',{tokenDefinitions})

            // push a close_scenario token
            // tokenDefinitions.push({
            //     __type: GHERKIN_AST_TOKENS.END_SCENARIO,
            //     value: scenarioKey,
            //     index: scenarioCount
            // })
        })

        if(SHOW_DEV_WARNINGS){
            if(scenarioCount > MAX_SUGGESTED_SCENARIOS_PER_FEATURE){
                system.warn(`GFDParser: ${scenarioCount}/${MAX_SUGGESTED_SCENARIOS_PER_FEATURE} too many scenarios in this feature, consider refactoring`);
            }
        }

        // now that we have a 1-D array of tokenDefinitions, 
        // we need to convert it to a sequence of token instances for validation and execution :D
        //system.success("GFDParser: Successfully generated 1-D array of TokenDefinitions tokenDefinitions",tokenDefinitions);

        // then, our final output GherkinSequence object
        this.output = new GherkinSequence();
        let prevStepType = null;
        tokenDefinitions.forEach((tokenDef)=>{
            // if we're in a fatal error state, just continue so we can wrap up the loop
            // todo: use a break-able loop instead
            if(this.parserStateMachine.state === GFDParser.PARSER_STATES.FATAL_ERROR_STATE){
                return;
            }

            /** @TODO: Nice error messages */
            const TAG = "GFDParser: "; // namespaced reporting (used as prefix for logging)
            system.setTag(TAG); // used for bulk logging from one source
            // TODO: tweak these rules to use real constants like:
            // `${FEATURE_TOKEN} must be followed by ${SCENARIO_TOKEN}`
            // and set it up so i can define them as compactly as possible like:
            // mustBeFollowedBy[FEATURE_TOKEN, [SCENARIO_TOKEN]]
            // canBeFollowedBy
            // mustPrecede
            // mustBePrecededBy
            // canPrecede
            // canBePrecededBy

            const RULES = [
                // technically the requirement is that the key is set on the object
                // hash tables don't guarantee order, so we can't rely on the order of the keys
                "FeatureDefinitions must open with a Feature definition", 
                "Feature must be followed by a Scenario",
                "Scenario must be followed by a Given",
                // NOTE: "ands" are converted to back-to-back Givens during definition -> seq parsing
                // hence the OR here:
                "Given must be followed by a Given or When", 
                "When must be followed by a When or Then",
                "Then can be followed by additional Thens or a new Scenario",
            ];

            if(!tokenDef.__type){
                this.parserStateMachine.setState(GFDParser.PARSER_STATES.FATAL_ERROR_STATE);
                system.dump({tokenDef})
                system.panic("GFDParser: tokenDef.__type is undefined");
            }else if(this.parserStateMachine.canTransition(tokenDef.__type)){
                this.parserStateMachine.setState(tokenDef.__type);
                // update output
                this.output.addStep(tokenDef);
            }else{
                // put the parser StateMachine in a fatal error state
                this.parserStateMachine.setState(GFDParser.PARSER_STATES.FATAL_ERROR_STATE);
                system.panic("GFDParser: invalid transition: " + JSON.stringify(tokenDef));
            }
        });

        // Validate sequence
        const validator = new GherkinSequenceValidator(this.output);
        const isValid = validator.validateSequence();
        //this.output.isValid = isValid;
        if(!isValid){
            system.dump(this.definition);
            system.panic("GFDParser: invalid sequence: " + validator.validationErrors.join(","));
        }

        // End of Parsing
        if(!this.output.steps.length){
            system.panic("GFDParser: output is empty")
        }
        return this.output;
    }
}

function getMatchingKeyValueCaseInsensitive(obj, key) {
    if(Array.isArray(obj)){
        // TODO: update parser to support this syntax (in addition to our other syntaxes)
        // in this one, you don't have to key {Given,When,Then} as long as you have a "given" in the first position
        // and the rest of the sequence evaluates to valid Gherkin
        // scenarios: {"something":["given something","when i blah","then blank"]}
        system.dump({
            arrayShouldaBeenObj: obj,
            key
        })
        system.panic("shoulda been an object");
    }
    if(typeof obj === 'string'){
        system.dump({
            stringShouldaBeenObj: obj,
            key
        })
        system.panic("getMatchingKeyValueCaseInsensitive: obj is a string, not an object")
        return null;
    }
    const matchedKey = Object.keys(obj)
        .find(k => k.toLowerCase() === key.toLowerCase());
    if (!matchedKey) {
        system.dump({
            keys: Object.keys(obj)
        })
        system.panic("getMatchingKeyValueCaseInsensitive: no matching key found for key: " + key)
        return null;
    }
    return obj[matchedKey];
}

class GherkinASTNode {
    constructor(type, content, parent = null) {
        this.type = type;
        this.content = content;
        this.parent = parent;
        this.children = [];
    }

    addChild(node) {
        node.parent = this;
        this.children.push(node);
    }
}

class GherkinASTBuilder {
    constructor() {
        this.tokenSequence = [];
        this.currentIndex = 0;
        this.currentParent = new GherkinASTNode('Root', {});
    }

    registerHarness(harness) {
        this.harness = harness;
    }

    consume() {
        if (this.currentIndex < this.tokenSequence.length) {
            return this.tokenSequence[this.currentIndex++];
        } else {
            throw new Error("End of token sequence reached unexpectedly.");
        }
    }

    peekAhead(tokenCount) {
        return this.tokenSequence.slice(this.currentIndex, this.currentIndex + tokenCount);
    }

    buildAST(tokenSequence) {
        this.tokenSequence = tokenSequence;
        this.currentIndex = 0;

        while (this.currentIndex < this.tokenSequence.length) {
            let token = this.consume();
            this.processToken(token);
        }

        return this.currentParent; // Return the root of the AST
    }

    processToken(token) {
        if (!this.harness[token.type]) {
            throw new Error(`Unsupported token type: ${token.type}`);
        }

        let node = new GherkinASTNode(token.type, token.content);
        this.currentParent.addChild(node);

        // Logic to update the current parent based on token type
        if (
            token.type === GHERKIN_AST_TOKENS.FEATURE 
            || token.type === GHERKIN_AST_TOKENS.SCENARIO
        ) {
            this.currentParent = node;
        } else if (
            token.type === GHERKIN_AST_TOKENS.END_SCENARIO 
            || token.type === GHERKIN_AST_TOKENS.END_FEATURE
        ) {
            if (this.currentParent.parent) {
                this.currentParent = this.currentParent.parent;
            } else {
                throw new Error("Invalid document structure: No parent to return to.");
            }
        }

        // Additional logic for other token types...
    }
}




// # I want this tool to feel as expressive as typing in Cursor with Co-Pilot
class TestStep extends DynamicThing {
    // options:
    // one-time check condition
    // vs. waitUntilTrue condition

    // defaults:
    // continue on failure: true (don't fail others by default)
    // sometimes errors are so bad as to be "Fatal" in those cases, we might
    // want to allow a test to halt the entire test suite to save time and fallout

    // multi-user session testing
    // automated tests for multi-user sessions via highly-opinionated callback hooks
    // plus, a robust api for lower-level integration into the tooling

    /** @parameter Async : boolean - whether the step can be queued to run asynchronously */

    // cypress: is async by default, which is neat, but can be confusing



}

class TestConfigration extends DynamicThing {
    // TestSteps can be flagged as parallel to be eligible for parallel execution
    steps = []
}

// Debug Decorator
function DebugDecorator(target) {
}

// 


// History Decorator
function UndoRedoDecorator(target) {
    return function(...args) {
        //console.warn('UndoRedoDecorator', {target, args})
        const d = new target(...args);
        d.undoStack = [];
        d.currentState = {};
        d.undoStackX = 0;
        d.recordStep = function(state){
            // if our head (undoStackX) is not at the end of the undoStack
            // then we need to remove everything after the head
            if(this.undoStackX < this.undoStack.length - 1){
                this.undoStack = this.undoStack.slice(0,this.undoStackX+1);
            }

            this.undoStack.push(JSON.parse(JSON.stringify(this.currentState)));
            this.currentState = state;
            d.undoStackX = this.undoStack.length - 1;
        }
        d.undo = function(){
            // bounds check
            if(this.undoStackX > 0){
                this.undoStackX--;
                this.currentState = this.undoStack[this.undoStackX];
            }
        }
        d.redo = function(){
            // bounds check
            if(this.undoStackX < this.undoStack.length - 1){
                this.undoStackX++;
                this.currentState = this.undoStack[this.undoStackX];
            }
        }
        return d;
    }
}

class Refactor extends UndoRedoDecorator(DynamicThing) {
    name = "Refactor"
    // pieces to consider
    parts = []
    // our change history
    changes = []
    // an interface to a test runner
    automatedTestRunner = null
    // Mixin Methods:
    // - addPart // define things that will be important
    // - removePart // remove from consideration
    // - runTests // run tests on the parts
    // - setTestConfiguration() // override the current configuration table with new values
}

/* for previewing a gamepad input */
class GamePadWidget extends Widget {

}

class MyMouseEvents extends Widget {
    constructor(){
        super(...arguments)
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
    onMouseDown(e){
        console.warn('onMouseDown',{e})
    }
    onMouseUp(e){
        console.warn('onMouseUp',{e})
    }
    cleanupListeners(){
        window.removeEventListener('mousedown', this.onMouseDown.bind(this));
        window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }
}

class KeyboardWidget extends Widget {
    widgetSize = { width: 300, height: 100 }

    currentlyPressedKeys = []

    constructor(){
        super(...arguments)
        // if you put them somewhere predictable, they can be cleaned up for you
        // or if you use a mixed-in parent class method to register your callbacks
        // or maybe a parent class could detect you implemented them and register them for you! shadow-programming
        window.addEventListener('keydown',this.onKeyDown.bind(this))
        window.addEventListener('keyup',this.onKeyUp.bind(this))
    }
    cleanupListeners(){
        window.removeEventListener('keydown',this.onKeyDown.bind(this))
        window.removeEventListener('keyup',this.onKeyUp.bind(this))
    }

    onKeyUp(e){
        // update our hash of currently pressed keys
        this.currentlyPressedKeys[e.code] = false;
        // handle shift/ctrl/alt/meta keys
        this.currentlyPressedKeys['Shift'] = e.shiftKey;
        this.currentlyPressedKeys['Control'] = e.ctrlKey;
        this.currentlyPressedKeys['Alt'] = e.altKey;
        this.currentlyPressedKeys['Meta'] = e.metaKey;
    }
    onKeyDown(e){
        // update our hash of currently pressed keys
        this.currentlyPressedKeys[e.code] = true;
        // handle shift/ctrl/alt/meta keys
        this.currentlyPressedKeys['Shift'] = e.shiftKey;
        this.currentlyPressedKeys['Control'] = e.ctrlKey;
        this.currentlyPressedKeys['Alt'] = e.altKey;
        this.currentlyPressedKeys['Meta'] = e.metaKey;
    }

    close(){
        this.cleanupListeners();
    }

    onDraw(){
        super.onDraw(...arguments);

        let ctx = this.ctx;

        // ctx.push();
        // ctx.fill("red")
        // ctx.rect(0,0,100,100)

        // in a standard keyboard layout,
        // draw a box for every common key
        // in a common qwerty layout
        const padding = 5;
        const keySize = 30;
        const keyLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];
        let keyIndex = 0;
        for(let i = 0; i < 4; i++){
            for(let j = 0; j < 10; j++){
                const x = (j + 1) * (keySize + padding);
                const y = (i + 1) * (keySize + padding);
                const key = keyLabels[keyIndex++];
                const isPressed = this.currentlyPressedKeys[key];
                ctx.push()
                ctx.stroke("black")
                ctx.strokeWeight(1)
                // Draw the main key rectangle
                ctx.fill(isPressed ? "darkgreen" : "#400040") // Made the lower part even darker
                
                ctx.rect(x, y, keySize, keySize)
                // Draw a smaller rectangle inside to give a 3D effect
                ctx.fill(isPressed ? "green" : "purple")
                let offset = isPressed ? 2 : 0
                ctx.rect(x - offset, y - offset, keySize - 4, keySize - 4, 20)
                ctx.fill("black")
                ctx.strokeWeight(0)
                ctx.textSize(20)
                ctx.textStyle(BOLD)
                ctx.textAlign(CENTER, CENTER)
                // Adjust the text position to prevent cropping
                ctx.text(key, x, y ) // Adjusted the text position to prevent cropping
                ctx.pop()
            }
        }

        // Check if the status is failing to update to green
        if(
            this.currentlyPressedKeys['ControlLeft'] 
            && this.currentlyPressedKeys['AltLeft'] 
            && this.currentlyPressedKeys['ShiftLeft']
        ){
            ctx.fill("green")
            ctx.rect(0,0,100,100)
        }

        ctx.text("Computer Keyboard Preview",0,0)
    }
}

class TreeWidget extends Widget {
    name = "TreeWidget"
    tree = null
    widgetSize = {
        width: 300,
        height: 600
    }
    constructor(){
        super(...arguments)

        this.depth = mctx.random(1,5);
        this.width = mctx.random(1,5);
        this.height = mctx.random(1,5);
    }
    onDraw(){
        super.onDraw(...arguments);

        /* for now draw a hard-coded struct, in the future, they'll be dynamic */
        
        for(let i = 0; i < this.depth; i++){
            let x = i * 100;
            for(let j = 0; j < this.width; j++){
                let y = j * 100 + (i * 50); // Offset the y-coordinate to create a tree-like structure
                for(let k = 0; k < this.height; k++){
                    let z = k * 100;
                    this.ctx.push();
                    this.ctx.translate(x,y,z);
                    this.ctx.fill("green");
                    this.ctx.rect(0,0,10,10);
                    this.ctx.pop();
                    if(k > 0){ // Connect the rectangles with lines if it's not the first rectangle in the column
                        this.ctx.push();
                        this.ctx.strokeWeight(2);
                        this.ctx.stroke("black");
                        this.ctx.line(x, y - 50, x, y); // Draw a line from the previous rectangle to the current one
                        this.ctx.pop();
                    }
                }
            }
        }

    }
}

class BonsaiTreeWidget extends TreeWidget {
    name = "BonsaiTreeWidget"
    tree = null
    widgetSize = {
        width: 300,
        height: 600
    }
    constructor(){
        super(...arguments)
    }
}

class WizardController {
    name = 'default wizard';
    currentStepIndex = null;
    stepResponses = [];
    shownSteps = [];
    wizardSuggestionList = null;
    get selectedSuggestionIndex(){
        return this?.wizardSuggestionList?.selectedOptionIndex;
    }
    set selectedSuggestionIndex(value){
        this.wizardSuggestionList.selectedOptionIndex = value;
    }
    get steps(){
        return this?.config?.steps ?? [];
    }
    get currentStep(){
        let step = this?.steps?.[this?.currentStepIndex] ?? null;
        if(!step.repeatCount){
            step.repeatCount = 0;
        }
        return step;
    }
    // all valid suggestions
    get allValidSuggestions(){
        //console.warn('get allValidSuggestions')
        const cStep = this.currentStep;
        //console.warn('allValidSuggestions? cStep',{cStep})
        let suggestions = [
            ...(cStep?.suggestions ?? [])
        ];
        if(cStep.skippable){
            suggestions.push({
                name: "Skip",
                value: "skip"
            })
        }
        if(cStep.actions?.length){
            cStep.actions.forEach((action)=>{
                //console.log('converting action to suggestion',{action})
                suggestions.push({
                    name: action.label,
                    value: action.value
                })
                // console.warn('inserted suggestion',{
                //     key: suggestions.length-1,
                //     value: suggestions.at(-1)
                // })
            })
        }
        if(!cStep.required){
            suggestions.push({
                name:'Cancel',
                value: 'cancel',
                OnSelect: ()=>{
                    console.warn('cancel wizard')
                    this.end();
                }
            })
        }
        store.all_valid_suggestions_length = suggestions.length;

        return suggestions;
    }
    constructor(wizardConfig){
        // todo: ValidateWizardConfig
        // if this config steps is empty or missing, throw
        if(!wizardConfig?.steps?.length){
            throw new Error('wizard config must have steps');
        }
        this.config = wizardConfig;
        this.name = wizardConfig.name ?? this.name;
        this.wizardSuggestionList = new SuggestionList();
        this.wizardSuggestionList.bindOnEnterPressed(this.OnPressEnter.bind(this));
        this.wizardSuggestionList.bindOnEscapePressed(this.OnPressEscape.bind(this));
        let _this = this;
        this.wizardSuggestionList.bindGetFilteredOptions(()=>{
            // console.warn('bound get filtered WizardController',{
            //     len: this.visibleSuggestions.length,
            //     len2: _this.visibleSuggestions.length
            // })
            return this.allValidSuggestions;
        })
        this.wizardSuggestionList.bindGetAllOptions(()=>{
            return this.allValidSuggestions;
        })
    }
    start(){
        store.activeWizard = this;
        this.switchToStep(0);
    }
    // aka goToStep, showStep, viewStep
    switchToStep(stepIndex){
        // TODO: validate we can LEAVE the current step FOR the desired step (check transition truth table)
        
        // if(this.currentStep?.toastOnSuccess){
        //     //system.toast(this.currentStep.toastOnSuccess);
        //     //system.successToast(this.currentStep.toastOnSuccess);
        //     let msg = this.currentStep.toastOnSuccess?.call ? this.currentStep.toastOnSuccess.call(this,this) : this.currentStep.toastOnSuccess;
        //     system.get("toastManager").showSuccess(msg);
        // }

        this.currentStepIndex = stepIndex;
        this.shownSteps.push(this.currentStepIndex);
        // drawSuggestions automatically updates based on the current step
        this.currentStep?.onStepLoaded?.call(this,this);
        
    }
    /** @return bool - did we click a _visible_ suggestion rect? */
    checkDidClickASuggestion(){
        system.todo('wizard controller: check did click a suggestion')
    }
    tryCompleteStep(){
        // process the current step
        // proceed if the current step is valid

        if(this.selectedSuggestionIndex !== null){
            // record the current response
            // let takeThingsOffThisValue = Object.keys(this.visibleSuggestions[this.selectedSuggestionIndex]);
            // console.warn('need to take things off this value',{
            //     takeThingsOffThisValue
            // });
            console.warn('about to record step response...',{
                cSI: this.currentStepIndex,
                offset: this.wizardSuggestionList.selectionOffset,
                //visibleLength: this.visibleSuggestions.length,
                allLength: this.allValidSuggestions.length,
                selectedSuggestionIndex: this.selectedSuggestionIndex,
                value: this.allValidSuggestions[this.selectedSuggestionIndex]?.value,
                label: this.allValidSuggestions[this.selectedSuggestionIndex]?.label
            })

            const selectedSuggestion = this.allValidSuggestions[this.selectedSuggestionIndex];
            if(!selectedSuggestion){
                console.warn('no selected suggestion?')
            }

            if(selectedSuggestion?.value === 'skip'){
                console.warn('SKIPPING!')
                this.switchToStep(this.currentStepIndex+1);
                return;
            }
            if(selectedSuggestion?.value === 'cancel'){
                console.warn('CANCELING!')
                this.end();
                return;
            }

            

            this.stepResponses[this.currentStepIndex] = {
                input: CmdPromptInput.value(),
                selectedSuggestionIndex: this.selectedSuggestionIndex,
                selectedSuggestionValueOrLabel: 
                    selectedSuggestion?.value
                    ?? selectedSuggestion?.label
            }

            console.warn('recorded step response', {
                step:this.currentStep,
                response: this.stepResponses[this.currentStepIndex]
            })

            if(!this.steps || !this.steps.length){
                console.error('no steps?',this);
                return;
            }

            if(!this.steps[this.currentStepIndex]){
                console.error('no step for current step index?',[this.steps,this.currentStepIndex]);
                return;
            }

            const validatorResponse = this.validateResponseForStep(
                this.currentStepIndex, // stepIndex
                this.steps[this.currentStepIndex],
                this.stepResponses);

            // console.warn('validation response', {
            //     validatorResponse
            // })

            if(!validatorResponse?.valid){
                console.error('validation failed',validatorResponse);
                return;
            }

            

            // if the selected suggestion had an execute function, call it
            if(selectedSuggestion?.OnSelect){
                selectedSuggestion.OnSelect.call(this,this);
            }
        }

        // unload the current step
        if(this.currentStep?.toastOnSuccess){
            // AND we didn't have an error
            system.get("toastManager").showSuccess(this.currentStep.toastOnSuccess?.call ? this.currentStep.toastOnSuccess.call(this,this) : this.currentStep.toastOnSuccess);
        }
        if(this.currentStep?.onStepUnload){
            this.currentStep.onStepUnload.call(this, this);
        }

        // TODO: make a global cmdprompt.reset() function
        // and a default onStepCompleted -> cmdprompt.reset() call
        // can opt out with wizardConfig.dontResetInputBetweenSteps = true
        if(!this.dontResetInputBetweenSteps){
            CmdPromptInput.value("")
            store.commandBuffer = {name: CmdPromptInput.value()}
        }

        // if there's a onStepCompleted function, call it
        if(this?.onStepCompleted){
            this.onStepCompleted.call(this,this);
        }

        // reset the selected suggestion index between steps
        this.selectedSuggestionIndex = null;
        this.selectionOffset = 0;

        // if the current step is set to repeatWhile, repeat it
        if(this.currentStep?.repeatWhile){
            // todo: note if we add Undo, we need to decrement this count
            this.currentStep.repeatCount++;
            return;
        }
        
        // if we completed it, and it was the last step,
        // end the wizard
        if(this.currentStepIndex === this.config.steps.length - 1){
            this.end();
        }else{
            this.switchToStep(this.currentStepIndex+1);
        }
    }
    end(){
        store.activeWizard = null;
        console.warn("WizardController end, finalCallback Defined?",{
            config: this.config,
            finalCallback: this.config.finalCallback ? true : false,
            fcbString: this.config.finalCallback?.toString()
        })
        if(this.config.finalCallback){
            this.config.finalCallback.call(this,this);
        }
        // free the wizardSelectList
        //this.wizardSuggestionList?.destroy()
        this.wizardSuggestionList = null;
    }
    onDraw(){
        if(!store.activeWizard || store.activeWizard !== this){
            console.warn('wizard is not active, skip onDraw')
            return;
        }
        this.drawCurrentStep();
        this.wizardSuggestionList.draw(deepCanvasManager.uiContext);
    }
    drawStepProgressBreadcrumbs(){
        mctx.push()
        // center
        mctx.translate(
            mctx.windowWidth / 2 - ((this.config.steps.length / 2) * 10),
            30
        )
        let spacing = 30;
        // Draw lines first
        this.config.steps.forEach((step, stepIndex) => {
            if (stepIndex > 0) {
                let c = stepIndex <= this.currentStepIndex ? color(0, 255, 0) : color(255, 0, 0);
                mctx.stroke(c);
                mctx.strokeWeight(4);
                mctx.line(
                    spacing + (stepIndex * spacing), spacing,
                    spacing + ((stepIndex - 1) * spacing), spacing
                );
            }
        });

        // Then draw dots
        this.config.steps.forEach((step, stepIndex) => {
            let c = stepIndex == this.currentStepIndex 
                ? "yellow" 
                : stepIndex <= this.currentStepIndex 
                    ? mctx.color(0, 255, 0) 
                    : mctx.color(255, 0, 0);
            mctx.fill(c);
            mctx.strokeWeight(0);
            mctx.circle(spacing + (stepIndex * spacing), spacing, 20);
        });
        mctx.pop()
    }
    drawCurrentStep(){
        const uictx = deepCanvasManager.uiContext;
        this.drawStepProgressBreadcrumbs();
        const cStep = this.currentStep;
        const questionTitle = cStep?.questionTitle ?? 'Question';
        const question = cStep.question;
        // todo cache interpreted string that replaces {prevResp} with the previous response
        // console.warn('displaying wizard step question',{
        //     currentStepIndex:this.currentStepIndex,
        //     question
        // });

        // render the name of the current command in the top right
        uictx.textAlign(RIGHT,TOP);
        uictx.textStyle(BOLD)
        uictx.text(`${this.name}`, uictx.windowWidth - 20, 20);

        // render the question
        let offsetY = 30;
        uictx.fill(255)
        uictx.textAlign(LEFT,TOP);
        uictx.textStyle(BOLD)
        uictx.text(`${questionTitle}`, 20, offsetY + 20);
        uictx.textStyle(NORMAL)
        uictx.text(`${question}`, 20, offsetY + 50);
    }
    OnPressEscape(event){
        if(confirm('Are you sure?')){
            this.end();
        }
    }
    // todo: bail early on these handlers if !store.activeWizard
    OnPressEnter(event){
        // validate the current response to the current step
        // if it's valid, store it
        // if it's invalid, show an error message
        console.warn('WZD enter was pressed', {
            currentCMDName: this.name,
            currentStepConfig: this.config.steps[this.currentStepIndex]
        })
        this.tryCompleteStep();
    }
    handleWizardInput(event){
        // console.warn('Wizard:handleWizardInput',{
        //     wsl: this.wizardSuggestionList
        // });
        switch(event.keyCode){
            case 13:
                // validate the current response to the current step
                // if it's valid, store it
                // if it's invalid, show an error message
                return this.wizardSuggestionList.OnPressEnter.call(
                    this.wizardSuggestionList,
                    event
                );
                break;
            case 38:
                return this.wizardSuggestionList.onPressUp.call(
                    this.wizardSuggestionList,
                    event
                )
                break;
            case 40:
                return this.wizardSuggestionList.onPressDown.call(
                    this.wizardSuggestionList,
                    event
                )
                break;
            default:
                // update the current response to the current step
                //this.wizardSuggestionList?.OnInput?.call(this.wizardSuggestionList,event);
        }
    }
    validateResponseForStep(stepIndex,step,responseArray){
        let {answerStorageKey,answerValidationRules} = step;
        if(!answerStorageKey || !answerValidationRules){
            console.warn('nothing to validate',{step,responseArray})
            return {valid:true};
        }
        // console.warn('validating',{
        //     step,
        //     responseArray,
        //     answerStorageKey,
        //     answerValidationRules
        // })
        let rules = answerValidationRules.split(':');
        let errors = [];
        const response = responseArray[stepIndex];
        console.warn('validating response',{
            response,
            rules
        })
        const responseValue = response?.input ?? null;
        rules.forEach((rule)=>{
            switch(rule){
                case 'required':
                    if(isEmptyOrUndefined(responseValue)){
                        throw new Error(`Response for ${answerStorageKey} is required`);
                    }
                    break;
                case 'unique':
                    // TODO: uniqueness needs to be implemented at the command level (not the wizard level)
                    // TODO: require a callback reference to step.checkIsUnique(value)
                    break;
                case 'string':
                    if(typeof responseValue !== 'string'){
                        throw new Error(`Response for ${answerStorageKey} must be a string`);
                    }
                    break;
                case 'csv':
                    // TODO
                    break;
                default:
                    console.error('unknown validation rule name:',rule);
                    break;
            }
        })
        if(errors.length){
            console.error('validation errors', errors)
            return {valid:false, errors};
        }
        return {valid:true};
    }
}

// TODO: nest these into a New Game... Parent Wizard

/*
class FlashCardGameWizardConfig
extends Config
{
    name = "New Flash Card Game..."
}
class MatchingCardGameWizardConfig
extends Config
{
    name = "New Matching Card Game..."
}
class KlondikeSolitaireGameWizardConfig
extends Config
{
    name = "New Klondike Solitaire Game..."
}
class Match3GameWizardConfig
extends Config
{
    name = "New Match 3 Game..."
}
class ChatRoomWizardConfig
extends Config
{
    name = "Load Chat Room"
    steps = [
        {
            question: "What is the name of the chat room?",
        },
        {
            question: "What is the description of the chat room?",
        },
        {
            question: "What is the password of the chat room?",
        },
        {
            question: "What is the maximum number of users allowed in the chat room?",
        }
    ]
}
class LoadMessengerWindowWizardConfig
extends Config 
{
    name = "Open Messenger Window"
    steps = [
        {
            display: "MOST_RECENT_MESSENGER_WINDOW" 
            // TODO: read from user preferences
        }
    ]
}
class NewQuizWizardConfig
extends Config
{
    name = "New Quiz..."
    steps = [
        {
            question: "What is the name of the quiz?",
        },
        {
            question: "What is the description of the quiz?",
            skippable: true,
            required: false,
            optional: true,
        },
        {
            question: "What are the questions of the quiz?",
            repeatable: true, // Add another question...
            answerStorageKey: "questions",
            subSteps: [
                {
                    question: "What is the question?",
                    answerStorageKey: "question",
                },
                {
                    question: "What is the answer?",
                    answerStorageKey: "answer",
                },
                {
                    question: "Is an answer required?",
                    answerStorageKey: "required",
                },
                {
                    question: "Is it multiple choice?",
                    answerStorageKey: "multipleChoice",
                },
                {
                    conditional: "multipleChoice",
                    questionIfTrue: "What are the other choices?",
                    repeatable: true, // Add another choice
                    maxRepeats: 3, // 3 + 1 = 4 choices
                    subSteps: [
                        {
                            question: "What is the choice?",
                            answerStorageKey: "choice",
                        }
                    ]
                },
                {
                    conditional: "multipleChoice",
                    questionIfTrue: "Fixed display order or random?",
                    answerStorageKey: "randomizeChoices",
                },
                {
                    conditional: "multipleChoice && randomizeChoices",
                    questionIfTrue: "What is the desired order?",
                    answerType: "sortedList",
                    sortedListOf: "choices",
                }
            ]
        }
    ]
}
class MessengerWindowWizardConfig
extends Config
{
    name = "Messenger Window Wizard"
}
*/

class AddGraphNodeWizardConfig
extends Config
{
    name = "Add Graph Node..."
    altnames = [
        "New Graph Node...",
        "New Node...",
        "New..." // our default NEW
    ]
    steps = [
        // {
        //     question: "what type of node would you like to add?",
        //     suggestions: [
        //         {
        //             name: "Rect",
        //             value: "rect"
        //         }
        //     ]
        // },
        {
            question: "what is the name of the node?",
            answerStorageKey: "name",

            subQuestions: [
                {
                    question: "what type of node?",
                    answerDefaultValue: "rect",
                    suggestions: [
                        {
                            name: "Rect", value: "rect"
                        }
                    ]
                }
            ]
        }
    ]
    // overload the default finalCallback
    finalCallback(wizardInstance){
        console.warn('AddGraphNodeWizardConfig finalCallback')
        
        cmdprompt.hide();

        if(!store.currentGraph){
            store.currentGraph = new Graph();
        }
        const id = store.currentGraph.nodes.length;
        store.currentGraph.addNode({
            id,
            name: wizardInstance?.stepResponses?.[0]?.input,
            x: (id % Math.floor(windowWidth / 200)) * 200,
            y: Math.floor(id / Math.floor(windowWidth / 200)) * 100,
            width: 200,
            height: 100,
            shape: 'rect',
            graph: store.currentGraph // todo: just store ID
        })
    }
}

// should we extend WizardConfig?
class RunGherkinCommandWizardConfig extends Config {
    name = "Run Gherkin Feature Test"
    steps = [
        {
            questionTitle: "Running Gherkin Test Suite...",
            // todo: support dynamic getters for fields
            // maybe via a WizardConfigStep class
            question: "Number of Steps: 0 | Pending: 0 | Passing: 0 | Failing: 0 | Skipped: 0 | Overall Progress: 0% | Current Scenario Progress: 0%",
            // reRenderQuestion(){
            //     this.question = `Number of Steps: ${this.steps.length} | Pending: ${this.steps.filter((step)=>step.status === 'pending').length} | Passing: ${this.steps.filter((step)=>step.status === 'passing').length} | Failing: ${this.steps.filter((step)=>step.status === 'failing').length} | Skipped: ${this.steps.filter((step)=>step.status === 'skipped').length} | Overall Progress: ${this.getOverallProgress()}% | Current Scenario Progress: ${this.getCurrentScenarioProgress()}%`
            // },
            // getOverallProgress(){
            //     return Math.floor(this.steps.filter((step)=>step.status !== 'pending').length / this.steps.length * 100);
            // },
            // getCurrentScenarioProgress(){
            //     return Math.floor(this.steps.filter((step)=>step.status !== 'pending').length / this.steps.filter((step)=>step.status !== 'pending').length * 100);
            // }
            onStepLoaded(wizardInstance){
                console.warn('Gherkin Test Suite: onStepLoaded')
                console.warn('Loading Sequence via GherkinRunnerWidget...');
                gherkinRunnerWidget.loadSequence(getTestGherkinSequence());
                console.warn('Running Test via widget');
                gherkinRunnerWidget.run();
            }
        }
    ]
}

class CommandStepConfig {
    constructor(config){
    }
}

class CommandStep {

}

/*
    @CustomCommandFactory
            |
            input: @CustomCommandConfig
            |
            process: function() {
                return new this.CustomCommandInstance();
            }
            |
            output: @CustomCommandInstance
        
        defintion:
            /** config: JSONOfCustomCommandFactory *-/
            constructor(config){
                if(!(config instanceof JSONOfCustomCommandFactory)){
                    system.panic(`CustomCommandFactory: config must be a JSONOfCustomCommandFactory`);
                }
            }
            
            get CustomCommandInstance(){
                // return a new instance of the CustomCommand
                return this.CustomCommandFactoryInstance.new();
            }
*/

/*
CustomCommandFactoryFactory -> generates instances of Custom Command Factories
            Custom Command Factories -> generate instances of Custom Commands

CmdPrompt offers Registration Method for Custom Command Factories, so that, Custom Commands can be found by name/description metatags, and instantiated on demand

When a CommandSuggestion is selected, the appropriate Custom Command Factory is instantiated
            or we call a singleton factory to get a fresh instance of the Custom Command
            and the command is executed
    In different CommandFlow or ControlFlow Scenarios,
            CommandFactories can be passed around as references, by simply passing the CommandFactory ID
            Then, when you finally _do_ need an instance of the command (if ever)
                you can have the system invoke you a fresh instance by ID
            The nice thing is, with this extensible system
                the factories can be stored in pre-configured ways
                so that multiple consumers can use the same factory
                rather than instantiating multiple copies of the same command
                wasting resources
*/

/* the literal class that manages taking JsonOf... objects and turning them into instances */
class CustomCommandFactoryFactory {
    factory = null
    get Factory(){
        return factory;
    }
    constructor(){
        this.factory = new CustomCommandFactory();
    }
}
/* 
    takes String or Object, maintains an Object 
    @throwable parseError - flag is set when JSON parsing fails
*/
class CustomCommandFactory {
    value = {}
    constructor(string_or_object){
        if(!string_or_object){
            system.panic(`CustomCommandFactory: string_or_object must be defined`)
        }
        // if we're given an object, don't parse it
        if(typeof string_or_object === 'object'){
            this.value = string_or_object;
        }else{
            try{
                this.value = JSON.parse(string);
            }catch(e){
                this.value = {}; //undefined;
                this.parseError = e;
            }
        }
        //console.warn('set CustomCommandFactory value: ', {value:this.value})
    }
    get name (){
        return this?.value?.name ?? "Custom Command with no name";
    }
    // name = "My Custom Command Factory"
    // // the configuration of the command
    // options = {}
    // _id = null;
    // constructor(options){
    //     this.options = options ?? {};
    // }
    // get id(){
    //     // if(this._id === null){
    //     //     this._id = this.generateID();
    //     // }
    //     return this.options?.id;
    // }
    // execute(){
    //     console.warn('OnCustomCommandFactoryExecute')
    //     if(this.options?.execute){
    //         this.options.execute.call(this);
    //     }
    // }
}
class CustomCommandConfig extends Config {
    _name = `Unnamed Custom Command`
    __type = "CustomCommandConfig"
    __extends = "Config"

    get name(){
        return `${this._name} Config`
    }
}
class CustomCommand extends Command {
    name = 'Unnamed Custom Command'
    constructor(config){
        this.name = config?.name ?? this.name;
    }
}
// an example JSON definition of a CustomCommandFactory
// this is used downstream to run a self test
// to make sure that custom command factory instances 
// are properly hydrating
// NOTE: jake's hello world command actually calls and references this command for its one and only execution step
const ExampleCustomCommandFactory = {
    __type: "CustomCommandFactory",
    name: "Example Hello World Command Factory",
    // define a simple command that prints a Hello World toast
    customCommandConfig: {
        __type: "CustomCommandConfig",
        __extends: "Config",
        name: "Example Hello World Command",
        execution_steps: [
            {
                // fields can be strings, arrays, or objects of lazily evaluated getter fn
                __type: "CommandStepConfig",
                // no return
                __returnType: "void", 
                

                // array of required global state keys
                // will panic if any are missing after a default retry/wait period
                using: ["toastManager"],
                
                __calls: "toastManager.showToast", 
                __args: ["Hello World!"],
                
                // what the command will be called for the user to search for it
                name: "Print Hello World",

                // further searchable text / accessibility text information for the user
                description: "Prints a Hello World toast",
                
            }
        ]
    }
}

/*
    Feature     
*/

/*

    Feature     Custom Commands 
    
    SubFeature  can hydrate from JSON to real executable commands

    Scenario    Jakes first custom command 
                    just shows a toast that says "Hello World!"

    Given       a CommandPrompt (valid instance of the Command Prompt)
    
    When        the user types "jake"... (assumption, into the first and only active input)

                # Validate that the command appears as a suggestion in the command palette
    Then        the user sees a suggested auto-complete of "Jakes first custom command"

*/
/*
    custom command factory is a special type of command factory
    it has a user-defined (or system generated) serializable JSON format

    + the factory itself is just a thin wrapper around 
      "the class" that can take care of meta-operations 
      when the class being defined is: 

        instantiated, 
        processing global operations, 
        triggering lifecycle methods, etc...
    
    + the first way to invoke a command, is via the command prompt, 
        so by default, we register all custom commands to the command prompt
        
        >   in the future, we can add other ways to invoke commands, 
            like via a menu, or a button, etc...
        
        >   we can also add other ways to define commands, like via the gui, then saved to the storage system
            or via a command line interface, copy/paste bulk import, file upload, etc...

        >   we can also add other ways to serialize commands, like as a binary, or as a compressed string, etc...
    
    + the second way to invoke a command, is via a test runner,
       by default (unless the command is flagged as "not testable") 
       all commands in the system are testable and tested
       auto-tested based on their configured test schedule
       carry their test validation status and a pointer to the validator that validated them
       and a pointer to the validation run, for further tracing of the validation run when failures occur

    + the third way to invoke a command is via a custom command runner
        > commands can refer to other commands,
        > runtimes use singleton factories for commands to ensure that they are only instantiated once
        > you have to opt-in to having multiple, separate instances of commands executing in parallel
        > commands can be flagged as "parallel" to be eligible for parallel execution (or maybe opt-out, havent'd decided yet)

*/
// Toasts Feature Feature Description Definition (Serializable to JSON)
class FeatureTest_ToastsFeature 
// TODO: enforce that it contains only literals
// maintains serializability
extends FeatureTest {
    name = "Toasts Feature"

    // dependcy injection (single string, or array of strings)
    // system will panic if these don't exist in the global state
    __targetSingletonKey = "toastManager" // ""[]

    scenarios = {
        "Show Toast": {
            given: "A Toast Notification Manager",
            when: "I call the ShowToast method",
            then: [
                "I expect a toast to appear",
                // AND
                // "I expect the toast to disappear after 3 seconds",
            ]
        },
        "Show a Pinned Toast":{
            given: "A Toast Notification Manager",
            when: "I call the ShowToast method with the pinned option set to true",
            then: [
                "I expect a toast to appear",
                // AND
                // "I expect the toast to remain on screen until dismissed",
            ]
        },
        "Dismiss a pinned toast":{
            given: "a pinned toast message",
            when: "I call the dismiss method on the toast",
            then: "I expect the toast to disappear"
        }
    }

    givenMap = {
        "A Toast Notification Manager": [
            // system singleton keys
            "toastManager"
        ],
        "a pinned toast message": [
            // prime the system with a pinned toast
            ["toastManager.showToast","hello world! pinned",{pinned:true}],
        ]
    }

    whenMap = {
        "I call the ShowToast method": [
            // in a when context, we know to tack () on the end
            // we assume the mapping is to a function by default
            ["toastManager.showToast", "Hello World!"]
        ],
        "I call the ShowToast method with the pinned option set to true": [
            // when it's an array, we know to pass the first item as the function name and the rest as arguments
            ["toastManager.showToast", "Hello World!", {pinned:true}]
        ],
        "I call the dismiss method on the toast": [
            // TODO: ability to dismiss specific toast(s)
            "toastManager.dismissLatestToast"
        ]
    }
    
    // note: latestToast is sugar for "toastManager.toasts.at(-1)"
    thenMap = {
        "I expect a toast to appear": [
            ["toastManager.latestToast", "not null"]
        ],
        "I expect the toast to disappear after 3 seconds": [
            ["toastManager.latestToast", "not null"],
            ["timeManager.stepTime", "3 seconds"],
            ["toastManager.latestToast", "null"]
        ],
        "I expect the toast to remain on screen until dismissed": [
            ["toastManager.latestToast", "not null"],
            // ["timeManager.stepTime", "Infinity"],
            ["timeManager.stepTime", "1 day"],
            ["toastManager.latestToast", "not null"],
            "toastManager.dismissLatestToast",
            ["toastManager.latestToast", "null"]
        ],
        "I expect the toast to disappear": [
            ["toastManager.latestToast", "not null"],
            "toastManager.dismissLatestToast",
            ["toastManager.latestToast", "null"]
        ],
    }
}

autorunFeatureTests.push(FeatureTest_ToastsFeature);

// Our Example Custom Commands rely on the Toasts Feature being Implemented and Tested, since their hello world is based on being able to trigger a system toast
// (this is until we have a different stdout for the system, then we can just use that) but there's no command prompt environment yet, so we're using the toast manager
const EXAMPLE_FEATURE_TEST_OBJ = {
   __type: "FeatureTest",
   name: "CustomCommandFactory Feature File",
   // the type we're defining / testing
   __targetType: "CustomCommandFactory",
    // constructor arguments for the CustomCommandFactory
    constructorArgs: [{
        name: "Example Hello World Command Factory",
        description: "CustomCommandFactory",
        scenarios: {
            "custom commands > appear in cmd pallete": {
                // we parse this downstream 
                // to await a valid instance of the CommandPrompt 
                // in the global state of the current system sandbox
                given: "CommandPrompt",
                // note: we don't specify which input here,
                // since, contextually, there is only one main input for the user to type into
                // in "the CommandPrompt" context
                when:  `the user types "jake"`,
                then:  `the user sees SuggestedCommand "Jakes first custom command" in the SuggestionList`,
            },
            "custom commands > can hydrate from JSON to real executable commands": {
                given: `CommandPrompt`,
                when: `the user executes "Jakes first custom command"`,
                then: `a Toast appears that says "Hello World!"`,
            }
        }
    }]
}
// make sure we can pass a real, in-memory JS obj
// autorunFeatureTests.push(EXAMPLE_FEATURE_TEST_OBJ)
// or a stringified JSON obj, that will be converted to a real JS obj on the fly
// autorunFeatureTests.push(JSON.stringify(EXAMPLE_FEATURE_TEST_OBJ))
// ^^^ both should pass if the system is working correctly
// we should have a way to tag them with different test run names like
// "FeatureTest:CustomCommandFactory" or "FeatureTest:CustomCommandFactory:JSON"

const exampleCustomCommandFactory = new CustomCommandFactory(ExampleCustomCommandFactory);
// console.warn('json of custom command factory',{
//     ExampleCustomCommandFactory,
//     exampleCustomCommandFactory
// })

// here we introduce a custom command as though it is one
// the user previously built and serialized to disk
// let imagine hydrated this from a JSON string...
store.customCommandFactories["myFirstCustomCommand"] = {
    // the class to instantiate @runtime / @hydrate / @execute / @deserialize
    __type: "CustomCommandFactory", 
    // the configuration of the command
    customCommandConfig: {
        __type: "CustomCommandConfig",
        __extends: "Config",

        // config fields
        name: "Jakes First Custom Command!",
        description: "This is a custom command that Jake made!",
        created_at: new Date().toISOString(),
        // TODO: created_by_user_id
        created_by: "Jake",

        steps: [
            {
                __type: "CommandStepConfig",

                name: "Custom Command Step Config",

                // the question to ask the user
                question: "which numbers would you like to add?",

                /* 
                    @property answerDefinitions CommandStepConfig[]
                    
                    @property answerDefinition
                */
                answerDefinitions: [
                    // "new connect the dots",
                    // "new scenario",
                    // "new GWT step",
                    // "new feature",
                    // "new stepDefinition",
                    // "new stepMapping",

                ]
            }
        ]
    }
}

class NewCommandWizardConfig
extends Config {
    name = "New Command..."
    steps = [
        {
            question: "What is the name of the command?",
            answerStorageKey: "input",
            onStepCompleted(wizardInstance){
                console.warn('onStepCompleted',{wizardInstance, latestResponse: wizardInstance?.latestResponse})
                const latestResponse = wizardInstance?.latestResponse;
                console.warn('user completed step 1. reply: ' + latestResponse)

                // TODO: if boolean "Default Suggested Command" is true,
                // we need to decorate the command with the default suggested command decorator
                const myNewCommandID = performance.now() + Math.random();
                const myCustomCommandClassFactory = new CustomCommandFactory({
                    id: myNewCommandID,
                })
                wizardInstance.currentCommandID = myNewCommandID;
                store.customCommandFactories[myNewCommandID] = myCustomCommandClassFactory;
                system.get("toastManager").showToast(`Created Custom Command Factory: ${myNewCommandID}`, {pinned: false});
            }
        },
        {
            question: "What is the description of the command?",
            answerStorageKey: "description",
            answerValidationRules: "required:string",
            onStepCompleted(wizardInstance){
                const myNewCommandID = wizardInstance.currentCommandID;
                const myCustomCommandClassFactory = store.customCommandFactories[myNewCommandID];
                myCustomCommandClassFactory.options.description = wizardInstance?.latestResponse;
            }
        },{
            question: "What are the steps of the command?",
            answerStorageKey: "steps",
            answerStorageType: "CommandStep[]",
            onStepLoaded(wizardInstance){
                console.warn('What are the steps of the command? onStepLoaded')
            },
            onStepUnload(wizardInstance){
                console.warn('What are the steps of the command? onStepUnload')
            },
            // TODO:
            // beforeValidate
            // || afterValidate
            // || extendValidator
            // || customValidator
            onStepSubmitted(wizardInstance){
                console.warn('What are the steps of the command? onStepSubmitted')
                // Let's mock the user making a selection since we don't have the UI for it yet
                wizardInstance.stepResponses[wizardInstance.currentStepIndex] = {
                }

                // returning false here flags as a validation error
                // returning true here allows the step to complete
                const steps = wizardInstance?.latestResponse;
                // using Dispatch:Action, Commit:Mutation, etc... for setting / getting state
                // dynamically at runtime inside the System
                console.warn('TODO: need to define UI for specifying Steps of a Command')
                const stepsAreValid = steps?.length > 0; // todo validate steps
                return stepsAreValid;
            }
        }
    ]
    finalCallback(wizardInstance){
        console.warn('NewCommandWizardConfig finalCallback')

        // hide the command input
        // register the command with the command prompt via store.availableCommands
        cmdprompt.registerCommand(
            // name
            wizardInstance.stepResponses[0].input,
            // description
            wizardInstance.stepResponses[1].input,
            // what to execute (in the future it'll be a repeating field of steps), for now it's a single text value
            wizardInstance.stepResponses[2].input,
        );
    }
}

class WizardConfig {
    name = 'WizardConfig'
    steps = []
    constructor(name){
        this.name = name ?? this.name
    }
}

class NewCommandCommand
extends BaseCmds(Command, new NewCommandWizardConfig()){}

class RunGherkinCommand
extends BaseCmds(Command, new RunGherkinCommandWizardConfig()){}

class AddGraphNodeCommand
extends BaseCmds(Command, new AddGraphNodeWizardConfig()){}

/*
class NewFlashCardGame
extends BaseCmds(Command, new FlashCardGameWizardConfig()) {}

class NewMatchingCardGame
extends BaseCmds(Command, new MatchingCardGameWizardConfig()){}

class NewKlondikeSolitaireGame
extends BaseCmds(Command, new KlondikeSolitaireGameWizardConfig()){}

class NewMatch3Game
extends BaseCmds(Command, new Match3GameWizardConfig()){}

class NewChatRoom
extends BaseCmds(Command, new ChatRoomWizardConfig()){}

class LoadMessengerWindowCommand
extends BaseCmds(Command, new LoadMessengerWindowWizardConfig()){}
*/

class GPTChatSessionWizardConfig
extends Config {
    // should probably proxy back to a protected server
    // for now, we'll call openai directly from the browser
    api_key = "" // requested at runtime and only stored in memory for the life of the tab session
    name = "New GPT Chat Session..."
    storageFields = [
        {
            name: "chatHistory",
            type: "array",
            arrayOf: "string"
        }
    ]
    requiredObservedInputs = [
        {
            name: "prompt",
            type: "string",
            displayAs: "textarea"
        }
    ]
    // onStepCompleted(wizardInstance){
    //     // TODO: make a global cmdprompt.reset() function
    //     // and a default onStepCompleted -> cmdprompt.reset() call
    //     // can opt out with wizardConfig.dontResetInputBetweenSteps = true
    //     CmdPromptInput.value("")
    //     commandBuffer = {name: CmdPromptInput.value()}
    // }
    steps = [
        // {
        //     question: "What is the name of the chat session?",
        //     answerPlaceholder: "My Chat Session",
        //     answerStorageKey: "name",
        //     answerStorageType: "string",
        //     answerValidationRules: "required:string",
        //     displayObservedInputs: []
        // },
        {
            repeatWhile: true, // let the code flag when the loop ends
            question: "What is your prompt?",
            answerStorageKey: "prompt",
            displayObservedInputs: ["prompt"],
            onStepCompleted(wizardInstance){
                console.warn(
                    "this onStepCompleted function wont serialize to JSON! \n" +
                    "need to apply special function serialization logic to the config... \n" +
                    "or use static definition api"
                )
                //wizardInstance.latestResponse

                const cStep = wizardInstance?.currentStep;
                if(!cStep){
                    system.panic("no current step in onStepCompleted callback in GPTChatSessionWizardConfig");
                }

                // release infinite loop
                if(!cStep?.iterations){
                    cStep.iterations = 0
                }
                cStep.iterations++;
                if(cStep.iterations > cStep.maxIterations){
                    cStep.repeatWhile = false;
                }else{
                    // noop; continue
                }
            }
        }
    ]
}

class APIKeyCachable extends Cachable {}
const OpenAPIKey = new APIKeyCachable();
class ScrollableWidget extends Widget {
    scrollViewportDims = {/*x:0,y:0*/padding:10}
    scrollViewportPos = {x:0,y:0}
    scrollContentDimensions = {x:0,y:0}
    scrollContentPosition = {x:0,y:0}
    scrollValues = {x:0,y:0}
    scrollBarWidth = 10
    minScrollBarSize = 10

    onDraw(){
        super.onDraw(...arguments)
        // draw the scrollable viewport
        stroke(0); strokeWidth(1); fill(0,0)
        rect(
            this.scrollViewportDims.padding,
            this.scrollViewportDims.padding,
            this.widgetSize.width - this.scrollViewportDims.padding * 2,
            this.widgetSize.height - this.scrollViewportDims.padding * 2
        )
        // draw the scroll bars
        // vertical
        stroke(0); strokeWidth(1); fill(0,0)
        rect(
            this.widgetSize.width - 3 - this.scrollBarWidth,
            this.scrollViewportDims.padding,
            this.scrollBarWidth,
            Math.max(
                this.minScrollBarSize, 
                this.widgetSize.height - this.scrollViewportDims.padding * 2
            )
        )
        // horizontal
    }
}
// TODO: extends MessageQueue
class ConsoleWidget extends ScrollableWidget {
    // NOTE: not only do system.panic,info,success,warn pipe to this widget,
    // but we also overload the built-in console{log,info,warn,error} functions to 
    // pass arguments through so we can see the in the runtime without 
    // needing to rely on chrome dev tools
    messages = []

    addMessage(message){
        this.messages.push(message);
    }

    onDraw(){
        super.onDraw(...arguments)

        textAlign(LEFT, TOP);
        text("Console Message Length : "+this.messages.length, 10, 10);
    }
}

class AIWidget extends Widget {
    promptHistory
    preamble = "You are helpful bot. you're super kind, friendly, and helpful. you like to help others expand their creative thinking and self-awareness and emotional intelligence. while helping them with various tasks anchored around scientifically backed theories and formulations for various tasks and goalsets"
    remoteBackedHistory = null;
    constructor(keyname){
        super(...arguments);
        this._keyname = keyname;
        if(!keyname){
            keyname = performance.now() + Math.random();
            console.warn('starting fresh brain with id: brain_'+keyname)
        }else{
            // load any history we have from localstorage
            this.promptHistory = store.get("brain_"+keyname) ?? [];
        }
    }
    fromJSON(json){
        return new this.constructor(json.keyname, json);
    }
    onDraw(){
        super.onDraw()
        text("AI Widget: "+this.preamble, 10, 10);
    }
}

class AIChatWidget extends AIWidget {
}

class ChatGPTWidget extends AIChatWidget {
    constructor(){
        super(...arguments);

        if(!OpenAPIKey.value){
            // set one
            OpenAPIKey.value = prompt("Please enter your OpenAI API Key");
            console.warn("storing key...", OpenAPIKey.value.length);
        }
    }
}

class StartChatGPTSessionCommand
extends BaseCmds(Command, new GPTChatSessionWizardConfig()){}

class NewToastWizardConfig
extends Config {
    name = "🥂 New Toast"
    steps = [{
        question: "What is the message of the toast?",
        answerStorageKey: "message",
        // todo: min / max length
        answerValidationRules: 'required:string'
    }]
    finalCallback(wizardInstance){
        system.get("toastManager").showToast(
            wizardInstance.stepResponses[0].input,
            {pinned: false}
        );
        CmdPromptInput.value('');
        cmdprompt.hide();
    }
}

class ShowNewToastCommand 
extends BaseCmds(Command, new NewToastWizardConfig()){}

// Define the ShowCmdPromptCommand class
// class ShowCmdPromptCommand extends Command {
//     constructor(){
//         super("Show Command Prompt")
//     }
//     // draw, perform, verb, invoke, execute, run, do,
//     invoke(){
//         // Show Command Prompt
//         store.CmdPromptVisible = true;

//         // focus the command palette input element
//         CmdPromptInput.elt.focus();
//     }
// }

class MyJavascriptCommand extends Command {
    constructor(target, ...args){
        super();
        this.target = target.split('.');
        this.args = args;
    }
    invoke(){
        // safer than eval, but not by much...
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
        let context = window;
        for(let i = 0; i < this.target.length - 1; i++) {
            context = context[this.target[i]];
        }
        context[this.target[this.target.length - 1]].call(window, ...this.args)
    }
}

class WindowLocationReload extends MyJavascriptCommand {
    constructor(){
        super("window.location.reload");
    }
}

class SoftReloadCommand extends Command {
    name = "Soft Reload"
    // implements Command.invoke to be called back when Command.execute runs
    invoke(){
        console.warn("onCommandExecuting: Soft Reload")
    }
}

class HardReloadCommand extends Command {
    name = "Hard Reload"
    invoke(){
        new WindowLocationReload().execute();
    }
}

// Define the HideCmdPromptCommand class
// class HideCmdPromptCommand extends Command {
//     constructor(){
//         super("Hide CMD Prompt")
//     }

//     invoke(){

//         // clear the command buffer
//         store.commandBuffer = {name:''};
//         CmdPromptInput.value('');

//         // Hide CMD Prompt
//         store.CmdPromptVisible = false;
//     }
// }

// Define the ToggleCmdPromptCommand class
// class ToggleCmdPromptCommand extends Command {
//     constructor(){
//         super("Toggle CMD Prompt")
//     }
//     invoke(){
//         // Toggle CMD Prompt
//         store.CmdPromptVisible = !store.CmdPromptVisible;
//     }
// }

function loadGraph(name){
    // TODO: destruct any current graph
    console.warn('loadGraph',{name})
    switch(name){
        case 'empty':
            store.currentGraph = new Graph();
            break;
        case 'self':
            // Load the visualization of the system! :D
            loadSelfGraph();
            break;
        case 'mvc':
            store.currentGraph = new MVCExampleGraph();
            break;
        case 'flux':
            store.currentGraph = new FluxExampleGraph();
            break;
        case 'ajaxFlux':
            store.currentGraph = new FluxAjaxExampleGraph();
            break;
        default:
            console.warn('unknown graph type',name);
    }
}

// executable javascript strings for custom functions
class CustomFn {
    _str = ""
    result;
    constructor(str){
        this._str = str;
    }
    execute(){
        let output;
        try {
            output = eval(this._str);
        }catch(e){
            //system.panic(e)
            output = e;
        }
        this.result = output;
        return output;
    }
}

// backing types
// note this can be nested
class StepAction {
    steps = []
    results = []
    constuctor(name){
        this.name = name
    }
    setSteps(steps){
        // TODO: validate them
        this.steps = steps;
    }
    execute(){
        if(this.customExecute){
            return this.customExecute.execute(this);
        }
        let results = [];
        this.steps.forEach((step)=>{
            if(step?.execute){
                results.push(step.execute());
                return;
            }
            results.push(step);
        })
        this.results = results;
        return results;
    }
    defineCustomEvaluation(str){
        this.fnStr = str;
        this.customExecute = new CustomFn(str);
    }
    addStep(step){
        steps.push(step)
    }
    replaceStep(stepIndex, step){
        steps[stepIndex] = step;
    }
    nullStep(stepIndex){
        steps[stepIndex] = null;
    }
    serializeStepsRecursive(steps){
        return steps.map((step)=>{
            if(step?.serialize){
                return step.serialize();
            }
            // it's a literal value
            return step;
        })
    }
    serialize(){
        // TODO: be sure to include sub-steps
        let output = {
            // what type to hydrate as on load
            __type: 'StepAction',
            steps: this.serializeStepsRecursive(this.steps)
        }
        return output;
    }
    // warning this may have unintended consequences
    // if you rely on the position of steps
    // use this only if needed
    // removeStep(stepIndex){
    //     steps.splice(stepIndex,1);
    // }
}

class StepActionFactory {
    hydrateFromPlainObject(options){
        let root = new StepAction(options);
        // TODO: recursively hydrate sub-steps
        return root;
    }
}

class DispatchAction extends StepAction {
    store = null;
    actionKey = null; // "DoRemotePostAsync"
    execute(){

    }
}

class Mutate extends StepAction {
    store = null;
    lookupKey = null; // thing[0].ok['but']?.really
    nextValue = null; // place to store the nextValue
    execute(){

    }
}

const CMD_ACTIONS = {
    DispatchAction,
    Mutate,
}

class CommandStepAction {
    get actionType(){
        return this.options?.actionType
    }
    constructor(options){
        this.options = options ?? {}
        console.warn('Command Step Action created');
    }
}

/**
 * This is a class that produces an instance of a CommandStepAction
 */
class CommandStepActionFactory {
    createAction(options){
        // new DispatchAction()
        // || new Mutate()
        return new CMD_ACTIONS[options.actionType](options)
    }
}

/**
 * @TODO
 * this should be a class for browsing through a collection of graphs
 * showing their cached icons / names / last modified status,
 * and allowing you to load them / duplicate them / delete them / rename them / etc...
 */
class GraphBrowser {
    // requires a Sandboxed System for loading graphs into
    currentSandbox = null;
    currentSystem = null;
    //currentSystemManager = null; currentSystem.manager
    addGraph(){
    }
    renameGraph(graphID, newName){
    }
    deleteGraph(graphID){
    }
}

class GraphNode {
    observedInputs = []
    constructor(options){
        this.options = options ?? {}
        this.graph = options.graph ?? null;
    }
    addObservedInput(input){
        this.observedInputs.push(input);
        input.myIDX = this.observedInputs.length - 1;
        input.input((event)=>{
            this.OnObservedInputChanged(event, input.myIDX);
        });
    }
    OnObservedInputChanged(event, inputIndex){
        const input = this.observedInputs[inputIndex]
        let inputValue = input.value();
        let _event = { 
            id: store.eventId++, 
            value: inputValue, 
            progress: 0, 
            flowIndex: 0, // replaces stage
        };
        if (event.keyCode === 8) {
            _event.key = 'backspace';
        } else {
            _event.key = event.key; //inputValue.slice(-1);
        }
        // send event up to parent graph to manage it's event flow
        this.graph.events.push(new GraphEvent(_event));
    }
    // renderNode
    drawNode(){
        if(!this.graph){
            if(!this.warned){
                this.warned=true;
                console.warn('cant draw node, no graph',{t:this})
            }
            return;
        }
        if (this.graph.selectedNodeIDs.indexOf(this.options.id) > -1) {
            fill(255, 0, 0); // red for selected node
        } else {
            fill(100 + (this.options.type === 'rect' ? 0 : 50)); // original fill color
        }

        this.observedInputs.forEach((input)=>{
            input.position(this.options.x, this.options.y + 20);
        })

        stroke("purple");

        let node = this.options;
        node.label = node?.label ?? node?.name;
        
        // let nodeValue = node.id === 0 
        //     ? store.viewValue 
        //     : node.id === 1 
        //         ? '' 
        //         : store.modelValue;
                
        // let otherNodeValue = node.id === 0 
        //     ? store.modelValueFromView 
        //     : node.id === 1 
        //         ? '' 
        //         : store.viewValue;
    
        if(node.shape === 'errorRect') {
            drawErrorNode(node);
        } else {
            drawShape(node.x, node.y, node.shape);
        }
    
        drawLabel(node.x, node.y, node.label);
    }
}

class Edge {

}

class TodoNode extends GraphNode {

}

class GraphSnapshot {
    graph = null;
    constructor(graph){
        this.graph = graph
    }

    grabSnapshot(){
        // render the graph to a canvas
        // return the canvas as a base64 encoded string
        this.result = canvas.elt.toDataURL();
        return this.result;
    }
}

// NOTE: you must have an active graph selected for this to work
// TODO: render graphs to an offline canvas so we can
// regenerate these in the background
// TODO: allow setting override icons for commands
// TODO: display command icons in the command palette
// TODO: when i type "load graph..."
//       i need a way to suggest the available graphs
//       BEFORE you enter into the wizard
//       it's like i need to peek into the suggestion's first step's suggestions and display them...
class SetCommandIconCommand extends Command {
    constructor(){
        if(!store.currentGraph){
            console.error('no current graph, cannot set command icon');
            return;
        }
        super("Set Command Icon")
        this.snapshotGrabber = new GraphSnapshot(store.currentGraph);
    }
    execute(){
        if(!this.snapshotGrabber){
            console.error('no snapshot grabber, cannot set command icon');
            return;
        }
        super.execute();
    }
}

[
    'zoom', 
    'panX', 
    'panY',
    'panningBG',
    'dragStartX',
    'dragStartY',
    'panMomentumVector'
].forEach((prop) => {
    Object.defineProperty(window, prop, {
        get: function() {
            return store?.[prop] ?? -Math.Infinity;
        },
        set: function(value){
            if(!store){
                return;
            }
            store[prop] = value;
        }
    })
});

// an instance of a graph
class Graph {
    nodes = []
    edges = []
    eventFlow = []
    events = []
    selectedNodeIDs = []

    constructor(options){
        this.options = options ?? {}
        // TODO: merge any defaults we'd like
    }
    loadGraphFromJSON(json){
        console.error('NotImplemented')
    }
    // OnNodeEventEmitted(event){

    // }
    OnMousePressed(event){
        // Adjust mouse position for pan and zoom
        let adjustedMouseX = (mouseX - panX) / zoom;
        let adjustedMouseY = (mouseY - panY) / zoom;
        let mousePos = mctx.createVector(adjustedMouseX, adjustedMouseY);

        let closestNode = null;
        let closestDistance = Infinity;
        this.nodes.forEach((node, i) => {
            let _node = node;
            if(!node){
                console.error('bad node?', node, i)
                return;
            }
            if(node.options){
                node = node.options;
            }
            if(isEmptyOrUndefined(node.x)||isEmptyOrUndefined(node.y)){
                console.error('bad node position?', node, i)
                return;
            }
            if(Number.isNaN(node.x) || Number.isNaN(node.y)){
                console.error('bad node position?', node, i)
                return;
            }
            if(Number.isNaN(mousePos.x) || Number.isNaN(mousePos.y)){
                console.error('bad mouse position?', mousePos)
                return;
            }
            let d = dist(mousePos.x, mousePos.y, node.x, node.y);
            if (closestNode === null && d < 50) {
                closestNode = _node.id;
            }
        });
        if(closestNode){
            this.selectedNodeIDs[0] = closestNode.id;
        }
    }
    OnMouseDragged(event){
        if(this.selectedNodeIDs.length){
            this.selectedNodeIDs.forEach((id)=>{
                this.nodes[id].x += mouseX - pmouseX;
                this.nodes[id].y += mouseY - pmouseY;
            })
        }
        
    }
    renderGraph(){

        if(this.selectedNodeIDs.length){
            this.selectedNodeIDs.forEach((id)=>{
                this.nodes[id].x += (mouseX - panX) / zoom;
                this.nodes[id].y += (mouseY - panY) / zoom;
            })
        }

        // when we render a graph, we only the top level of subgraphs for each node
        // to prevent needing to recursively render the entire graph at all times

        // draw lines first
        this.drawLines();
        // draw events next
        this.events.forEach((event, i) => {
            event.update();
            event.drawEvent();
        });
        // draw nodes on top
        this.nodes.forEach((node, i) => {
            node.drawNode(node);
        });
        // TODO: draw labels last
    }
    drawLines(){
        this.edges.forEach((edge) => {
            let currentNode = this.nodes[edge.from];
            // if(!currentNode){
            //     console.error('drawLines: no currentNode',edge.from,this.nodes.length)
            //     return;
            // }
            if(currentNode.options){
                currentNode = currentNode.options;
            }
            let nextNode = this.nodes[edge.to];
            if(nextNode.options){
                nextNode = nextNode.options;
            }
            // if(!nextNode){
            //     console.error('drawLines: no nextNode',edge.to,this.nodes.length)
            //     return;
            // }
            stroke(edge.color);

            // sensible defaults?
            // if(
            //     !edge.fromAnchor 
            //     || Number.isNaN(edge.fromAnchor.x)
            //     || Number.isNaN(edge.fromAnchor.y)
            // ){
            //     edge.fromAnchor = {x:0,y:0};
            // }
            // if(
            //     !edge.toAnchor 
            //     || Number.isNaN(edge.toAnchor.x)
            //     || Number.isNaN(edge.toAnchor.y)
            // ){
            //     edge.toAnchor = {x:0,y:0};
            // }
            // if(Number.isNaN(currentNode.x) || Number.isNaN(currentNode.y)){
            //     console.error('Bad value',{currentNode})
            //     return;
            // }
            // if(Number.isNaN(nextNode.x) || Number.isNaN(nextNode.y)){
            //     console.error('Bad value',{nextNode})
            //     return;
            // }

            // console.warn('drawing edge line',{
            //     edge,
            //     currentNode,
            //     nextNode
            // })

            line(
                currentNode.x + edge.fromAnchor.x, 
                currentNode.y + edge.fromAnchor.y, 
                nextNode.x + edge.toAnchor.x, 
                nextNode.y + edge.toAnchor.y
            );
        });
    }
    addNode(nodeOpts){
        this.nodes.push(new GraphNode(nodeOpts))
    }
}

class MVCExampleGraph extends Graph {
    name = "MVCExampleGraph"
    constructor(options){
        super(options)
        this.nodes = [
            { id: 0, x: 125, y: 200, shape: 'triangle', label: 'View' },
            { id: 1, x: 300, y: 50, shape: 'ellipse', label: 'Controller' },
            { id: 2, x: 500, y: 200, shape: 'rect', label: 'Model' }
        ];
        // hydrate nodes as instances
        this.nodes.forEach((_n,index)=>{
            this.nodes[index] = new GraphNode({
                ..._n,
                graph: this
            });
        })
        this.edges = [
            // view -> controller
            { from: 0, to: 1, color: 'red', fromAnchor: { x: 0, y: 30 }, toAnchor: { x: 0, y: 30 } },
            // controller -> model
            { from: 1, to: 2, color: 'red', fromAnchor: { x: 0, y: 30 }, toAnchor: { x: 0, y: 30 } },
            // model -> controller
            { from: 2, to: 1, color: 'blue', fromAnchor: { x: 0, y: 0 }, toAnchor: { x: 0, y: 0 } },
            // controller -> view
            { from: 1, to: 0, color: 'blue', fromAnchor: { x: 0, y: 0 }, toAnchor: { x: 0, y: 0 } }
        ];
        this.eventFlow = [
            {from: 0, to: 1}, // view -> controller
            {from: 1, to: 2}, // controller -> model
            {from: 2, to: 1}, // model -> controller
            {from: 1, to: 0}, // controller -> view
        ]
    }
}

class TodoConfig {
    name = 'TodoConfig'
    steps = []
    constructor(name){
        this.name = name ?? this.name
    }
    setOnToggledCallback(callback){
        this.onToggleCallback = callback
    }
}



class TodoWizardConfig extends WizardConfig {
    name = "New Todo..."
    steps = [
        {
            questionTitle: "What?",
            question: "What is the name of the todo?",
            answerStorageKey: "name",
            // todo: minlength / maxlength
            answerValidationRules: 'required:string',
            answerPlaceholder: "Enter a name for the todo",
            // NOTE: actions get converted to suggestions
            // Actions and Suggestions are both "Selectable"
            // and call OnSelect when the user selects them
            // suggestions have an api where execute is called when they are selected
            actions:[
                {
                    value: 'save',
                    label: 'Save',
                    // OnSelect
                    OnSelect: function(){
                        console.log('TODO: actions > Save > execute');
                    }
                }
            ],
            onStepLoaded: function(){
                console.warn('TodoWizardConfig Step Loaded',{t:this})
            },
            onStepUnload: function(){
                console.warn('TodoWizardConfig Step Unloaded',{t:this})
            }
        },
    ]
    
    constructor(name){
        super(name)

        this.config = this.config ?? {}
        // this is called when the wizard is completed
        // and it's time to store the results

        // we configure this callback to be called when the final output node (a todo instance) is toggled
        // we might want to move this into the class Todo class which should extend Node as it's a special type of a node in a graph
        this.todoConfig = new TodoConfig();

        // === REMEMBER OUR GOAL ===
        //   We're practicing writing code that looks as much like
        //   plain english business / behavior rules as possible
        // === REMEMBER OUR GOAL ===

        // ~~~ NOTE ~~~
        // setOnToggledCallback registers a callback function within the Todo class that _would_ be instantiated IF/WHEN the user
        // decides to spawn one
        // because of the dynamic nature of the system,
        // we have to map a lot of callbacks for different event lifecycle hooks
        // rather than having one top-down proceedural function that does everything
        // instead, we have a graph of interconnected Commands
        // that each have their own lifecycle hooks
        // and all operate within a Sandbox|System in a SystemManager
        // ~~~~~~~~~~~
        // * Turing Complete / Von Neumann Architecture
        
        this.todoConfig.setOnToggledCallback((todo,testRunner)=>{
            // we toss expectations between contexts
            // so we can centralize expectations in a big switch
            // table for speed and ease of maintenance
            let expected_status = null;
            if(testRunner){
                expected_status = testRunner.getExpectation(todo)
            }
            // what does the system do when the Todo is toggled?
            // how do we assert that the system did what it was supposed to?
            if(testRunner && todo.completed !== expected_status){
                testRunner.panic("Todo toggle action fired, but the status did not change")
            }
        });
    }

    finalCallback(wizardInstance) {
        console.warn('TodoWizardConfig Final Callback',{wizardInstance});

        // if the dashboard is un-collapsed, collapse it
        // TODO: just broadcast an event the dashboard can subscribe to
        // or raise an event the system can handle
        system.get("Dashboard").collapse();

        // if no active graph, add a new graph
        if(!store.currentGraph){
            loadGraph("empty");
        }

        // 1. push the todo into the current graph as a node at the current level
        // todo: make a TodoNode
        store.currentGraph.addNode({
            id: store.currentGraph.nodes.length,
            name: wizardInstance?.stepResponses?.[0]?.input,
            x: 100,
            y: 100,
            width: 200,
            height: 100,
            shape: 'rect',
            graph: store.currentGraph // todo: just store ID
        })

        cmdprompt.hide();
        //cmdprompt.hide();
    }
}
class RepeatingTodoWizardConfig extends TodoWizardConfig {
    name = "New Repeating Todo..."
    constructor(name){
        super(name)
        this.steps.push({
            questionTitle: "When?",
            question: "What is the frequency of the todo? {prevResp}",
            answerStorageKey: "frequency",
            answerValidationRules: 'required:frequency',
            answerDefaultValue: 'once',
            optional: true,
            skippable: true,
            required: false,
            actions: [
                {
                    value: 'save',
                    label: 'Save',
                }
            ],
            suggestions: [
                {
                    name: "Once",
                    value: "once",
                    selected: true
                },
                {
                    name: "Daily",
                    value: "daily"
                },
                {
                    name: "Weekly",
                    value: "weekly"
                },
                {
                    name: "Monthly",
                    value: "monthly"
                },
                {
                    name: "Custom",
                }
            ]
        })
    }
}
class Duration {
    
}
// todo: can be used to count up or down...
class Timer {
    mode = "timer" // vs. "stopwatch"
    startedAt = null
    elapsedSec = 0
    resumedAt = null
    pausedAt = null
    pausedDuration = null
    completedAt = null
    ticker = null
    finalDuration = null;
    get duration(){
        return this.durationSec
    }
    get durationSec(){
        return this.options?.durationSec ?? 0
    }
    get remainingSec(){
        return this.durationSec - this.elapsedSec
    }
    constructor(options){
        this.options = options ?? {
            durationSec: 60
        }
        this.start()
    }
    get timeElapsed(){
        return this.elapsedSec
    }
    get timeRemaining(){
        return this.remainingSec
    }
    get timeElapsedFormatted(){
        return `${this.elapsedSec} / ${this.durationSec}`
    }
    get timeRemainingFormatted(){
        return `${this.remainingSec} / ${this.durationSec}`
    }
    tick(){
        if(!this.ticking){
            return;
        }
        this.elapsedSec = performance.now() - this.startedAt - this.pausedDuration;
        this.elapsedSec = Math.floor(this.elapsedSec / 1000);
        if(this.elapsedSec >= this.durationSec){
            this.ended();
            return;
        }
        requestAnimationFrame(()=>{
            this.tick()
        })
    }
    ended(){
        this.completedAt = performance.now();
        this.ticking = false;
        this?.onComplete?.();
    }
    start(){
        this.pausedAt = null
        this.resumedAt = null
        this.pausedDuration = null
        this.completedAt = null
        this.startedAt = performance.now();
        this.ticking = true;
        this.ticker = setTimeout(()=>{
            this.tick();
        },1);
    }
    pause(){
        this.ticking = false;
        this.pausedAt = performance.now();
    }
    resume(){
        this.pausedDuration += performance.now() - this.pausedAt;
        this.pausedAt = null;
        this.resumedAt = performance.now();
        this.ticking = true;
        this.tick();
    }
    stop(){
        this.ticking = false;
    }
    restart(){
        this.pausedAt = null;
        this.startedAt = performance.now();
    }
}
// holds multiple Timers
class TimerManager {
    timers = []
    recents = [
        10 * 1000,
        30 * 1000,
        60 * 1000,
        2 * 60 * 1000,
        3 * 60 * 1000,
        5 * 60 * 1000,
        10 * 60 * 1000,
        15 * 60 * 1000,
        20 * 60 * 1000,
        25 * 60 * 1000,
        30 * 60 * 1000,
        40 * 60 * 1000,
        45 * 60 * 1000,
        60 * 60 * 1000
    ]
    constructor(){
        // default timer
        this.timers.push(new Timer({
            durationSec: 60
        }));
        this.timers[0].start()
    }
}
// regression tests / feature tests
const bugs = [

]
const features = [

]
const InvokableCommands = {
    ["YouTube - Joe Pera Talks you back to sleep"](){
        return "https://www.youtube.com/watch?v=DSUilYKcRMA";
    },
    ["New Fact"](){},
    ["New Thing"](){},
    ["New Type"](){},
    ["New Command Argument"](){

    },

    ["Fun Fact..."](){
        system.todo("Say a fun fact!")
    },

    ["List {Invokable Commands}"](){
        system.todo("List {Invokable Commands}")
    },
    ["Show {Invokable Commands}"](){
        system.todo("Show {Invokable Commands}")
    },
    ["Describe {Invokable Commands}"](){
        system.todo("Describe {Invokable Commands}")
    },
    ["Help Page For {Invokable Command}"](){
        system.todo("Help Page For {Invokable Command}")
    },

    ["How Do I..."](){
        system.todo("How Do I...")
    },
    
    ["F.A.Q. Frequently Asked Questions"](){},

    // localized, limited, quick
    ["Re-Roll AI Cache For This Node"](){},
    // slow, background, potentially delayed / incomplete results
    ["Re-Roll AI Cache For This Node AND All Downstream Nodes"](){},



    ["Inspiration: simple generative graph example - Orion Reed"](){
        system.registerWidget(new iFrameWidget(
            "https://x.com/OrionReedOne/status/1731965009981301071?s=20"
        ));
    },
    ["sine wave demo"](){
        system.registerWidget(new SineWaveDemonstrator());
    },
    ["helix demo"](){
        // uses a p5.js webgl context to draw a basic vector helix which
        // can be cached and used as bitmap input by other widgets
    },
    ["new connector..."](){
        // connect what to what and how?
        system.todo("connect what to what, and how?")
    },
    ["new oscilloscope"](){
        system.registerWidget(new OscilloscopeWidget());
    },
    ["new pie chart"](){
        system.registerWidget(new PieChart())
    },
    ["new donut chart"](){
        system.registerWidget(new DonutChart())
    },
    ["new spark line"](){
        system.registerWidget(new Sparkline())
    },
    ["new moon phase widget"](){
        system.registerWidget(new MoonPhaseWidget())
    },
    ["new minimap widget"](){
        system.registerWidget(new MiniMapWidget())
    },
    ["new zoom dependent widget"](){
        system.registerWidget(new ZoomDependentWidget())
    },
    ["new sticky note"](){
        system.registerWidgetInstance(new StickyNoteWidget())
    },
    ["new text viewer widget"](){
        system.registerWidgetInstance(new TextViewerWidget())
    },
    ["view welcome message"](){
        system.registerWidgetInstance(new WelcomeMessage())
    },
    ["question of the day"](){
        system.registerWidgetInstance(new QuestionWidget())
    },
    ["hello my name is..."](){
        system.registerWidgetInstance(new WhatIsYourName())
    },
    ["text me..."](){
        system.registerWidgetInstance(new WhatIsYourPhoneNumber())
    },
    ["i'm feeling feelings..."](){
        system.registerWidgetInstance(new HowAreYouFeeling())
    },
    ["view ChangeLog"](){
        system.registerWidgetInstance(new ChangeLogViewer())
    },
    new_refactor_plan(){
        system.todo("!!! NotYetImplemented !!!")
    },
    new_sandbox(){
        system.todo('low priority')
    },
    todo_fix_word_wrap(){
        system.todo('med')
    },
    todo_fix_todos_to_use_omnibar(){
        system.todo("one input to rule them all!")
    },
    todo_fix_cmd_prompt_rendering_order_incorrect(){
        system.todo("i'll get there!")
    },
    // todo_add_analytics_tracking_code(){
    //     system.todo('yeah yeah yeah')
    // },
    todo_ability_to_remember_todo_DONE_status_locally(){

    },
    todo_ability_to_remember_todo_DONE_status_remotely(){

    },
    ["track thing"](){},
    ["graph thing over time"](){},
    ["new sparkline tracker"](){},
    ["new stream"](){},
    ["new stream event"](){},
    ["new event stream"](){},
    ["new metadata cluster"](){},
    ["view metadata"](){},
    ["remove metadata"](){},
    // public, private, protected
    ["set protection level to Public"](){}, 
    ["set protection level to Private"](){}, 
    ["set protection level to Protected"](){}, 
    ["load all things tagged {tag}"](){}, 
    ["add tag to thing {tag} {thing}"](){},
    ["remove tag from thing {tag} {thing}"](){},
    ["add tag(s) to thing(s)"](){},
    ["remove tag(s) from thing(s)"](){},
    ["hide all things tagged {tag(s)}"](){},
    ["tokenized inputs (like discord commands for midjourney)"](){},
    ["self-symbol viewer"](){},
    ["new force-directed graph"](){},
    ["handle pasted dotviz input"](){
        system.todo("parse graphviz dotlang to our ast for viewing and modification and enhancement")
    },
    ["export graph as graphviz dotlang"](){},
    ["set graphviz dotlang export settings"](){},
    ["recall user graphviz dotlang export settings"](){},
    ["new settings group"](){},
    ["new setting profile template"](){},
    ["new notion widget"](){},
    ["new obsidian widget"](){},
    ["new trello widget"](){},
    ["new google sheets widget"](){},
    ["new google slides widget"](){},
    ["new google drawing"](){},
    // private bookmarks
    ["PRIVATE open mortgage website"](){},
    ["PRIVATE open personal checking website"](){},
    ["PRIVATE open quick books self employed :<"](){},
    ["PRIVATE open turbotax :<"](){},
    ["PRIVATE open mint :<"](){},
    ["PRIVATE did the mortgage payment go through?"](){},
    ["PRIVATE did the truck payment go through?"](){},
    ["PRIVATE did the credit card(s) {x,y,z} payment(s) go through?"](){},
    ["PRIVATE what is my business checking account balance?"](){},
    ["PRIVATE what is my business savings account balance?"](){},
    ["PRIVATE what is my personal savings account balance?"](){},
    ["PRIVATE what is my retirement account balance?"](){},
    ["PRIVATE how is saving for disneyland going?"](){},
    ["PRIVATE how close are we to paying off the HVAC repairs?"](){},
    ["PRIVATE what's our total unsecured debt?"](){},
    ["PRIVATE what's our options for debt reconsolidation (debt securitization)?"](){},
    ["PRIVATE what's our payoff on the truck?"](){},
    ["PRIVATE how long until the truck is paid off?"](){},
    ["PRIVATE open google keep"](){},
    ["PRIVATE open workflowy"](){},
    ["new whisper session"](){
        //startWhisperSession() {
            // Create a new MediaRecorder instance
            let mediaRecorder;
            let audioChunks = [];
            const audioType = 'audio/webm';
            const constraints = { audio: true };

            system.mediaRecorder = mediaRecorder;

            // Request access to the microphone
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                system.mediaRecorder = mediaRecorder;

                // Start recording
                mediaRecorder.start();

                // On data available, push it to our array
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                // On stop, send the audio data to the server
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: audioType });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);

                    // Send the audio data to the server
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', '/api/audio', true);
                    xhr.send(audioBlob);

                    // Clear the audio chunks
                    audioChunks = [];
                };
            });

            // Stop recording after 5 seconds
            // setTimeout(() => {
            //     mediaRecorder.stop();
            // }, 5000);
        //}
    },
    ["start recording to whisper"](){
        system?.mediaRecorder?.start?.();
    },
    ["stop recording to whisper"](){
        system?.mediaRecorder?.stop?.();
    },
    todo_add_user_account_system(){
        system.todo('yeah yeah yeah')
    },
    todo_add_code_editor(){
        system.todo('med')
    },
    todo_normalize_suggestion_list_dedupe(){
        system.todo('low priority')
    },
    ["new widget..."](){
        system.todo("!!! NotYetImplemented !!!")
    },
    ["new command..."](){
        system.todo("!!! NotYetImplemented !!!")
    },
    ["new wizard..."](){
        system.todo("!!! NotYetImplemented !!!")
    },
    ["new poll..."](){
        system.todo("!!! NotYetImplemented !!!")
    },
    ["new quiz..."](){
        system.todo("!!! NotYetImplemented !!!")
    },
    ["todo: convert and clean up old wizard code"](){
        system.todo("how much space is dead code %-wise?")
        system.todo("TRACK IT OVER TIME!")
    },
    ["new trivia"](){
        system.todo("!!! NotYetImplemented !!!")
    },
    // ["hide debug cursor"](){}
    // ["show debug cursor"](){}
    ["toggle debug cursor"](){
        store.showDebugCursor = !store.showDebugCursor;
    },
    // 
    ["toggle debug widget info"](){
        store.showWidgetPositions = !store.showWidgetPositions;
    },
    // alias
    ["toggle widget debug info"](){
        InvokableCommands["toggle debug widget info"]();
    },
    ["new alias..."](){
        let results = prompt("alias a word or phrase to another word or phrase","Key...","Value...")
        if(!results){
            return;
        }
        system.todo("!!! NotYetImplemented !!!")
    },
    ["Toggle Dashboard Collapsed"](){
        system.dashboard.toggleCollapsed();
    },
    // { name: "New Basic Command" },

    // ["youtube bookmarks:"]:
    // ["https://www.youtube.com/user/huygensoptics"],

    /*
    { name: "Send a Tweet", command: "NotYetImplemented" },
    { name: "Post to Facebook", command: "NotYetImplemented" },
    { name: "Post to Instagram", command: "NotYetImplemented" },
    { name: "Get Share Link", command: "NotYetImplemented" },
    { name: "Enter Bulk Widget Editor Mode", command: "NotYetImplemented"},
    { name: "Group Widgets into Substack", command: "NotYetImplemented"}
    */
    ["Shuffle Widget Positions"](){
        system.dashboard.shuffleWidgetPositions();
    },

    ["Netflix"](){
        system.registerWidget(new iFrameWidget(
            "https://www.netflix.com/",
            {
                widgetSize:{
                    width:600,height:400
                }
            }
        ))
        // return "https://www.netflix.com/"
    },

    ["Check Temperature"](){
        // if has fever...
    },

    ["Get Coffee"](){
        // start a 5 min timer
    },

    ["New Input Recognizer"](){
        // spawn a LLM that is multi-modal
        // and can work with input data
        // in one-shots or streaming meta-data connection details (lazy evaluation of async resources as a deep intrinsic and performance tuning hook point)

        // talks to a singleton backing instance like a vector processor

        // based on url input, it pipes / branches to the appropriate input recognizer preamble like:
        /*
            For youtube urls, it would be a youtube video input recognizer
            
            For shortened urls, unshorten them (ugh analytic-syphoning url shorteners)

            For image urls, it would be an image input recognizer

            For gestural data or motion vector data, it would be a gesture input recognizer

            It can generate multi-modal output as needed:
            > code, text, audio, video, image, gesture, motion, etc...

            It can access on-the-fly backing cache pools, which will later be cleaned up (on last access + time)
        */
    },

    ["New REPL"](){
        // spawn a new REPL
        system.registerWidget(new REPLWidget());
    },

    // check heart rate
    // check blood pressure
    // check blood sugar,

    // record blood sugar, oxygen, heart rate, blood pressure, weight, height, etc...

    // prostate health
    // check cholesterol

    // sleep, wake, usage, behavior, trends
    // life expectancy
    // lifestyles
    // meta data reflected instead of sold back to the highest paying advertiser

    ["Study Greek Alphabet Flashcards"](){
        // spawn a new flashcard widget
        system.registerWidget(new GreekAlphabetWidget());
    },
    ["simulate resize event"](){
        window.dispatchEvent(new Event("resize"));
    },
    ["refresh the page"](){
        window.location.reload();
    },
    ["reflow"](){
        window.dispatchEvent(new Event("resize"));
    },
    FocusWidget(id){
        system.get("Dashboard")
            ?.focusWidget?.(id);
    },
    NotYetImplemented(){
        console.warn('NotYetImplemented!')
    },
    // [
    //     "Play N64"
    // ]: [
    //     "Star Fox",
    //     "Yoshi's Story",
    // ],

    ["todo: add daily progress bar of time"](){},
    ["todo: more themes / time of day stuff"]:"",

    // alias
    new_toy_train: "new_train_toy",
    new_train_toy(){
        system.registerWidget(new TrainToyWidget());
    },

    ["new p5 js web gl context demo"](){
        system.registerWidget(new P53DLayer()) 
    },

    ["New Mix Tape"](){},
    ["New Compilation Album"](){},
    ["New Best Hits List"](){},
    ["New Top 10 List"](){},

    ["New Journal Entry"](){},
    ["New Experiment"](){},
    ["New Analysis"](){},
    ["New Comparison"](){},
    ["New Description"](){},
    ["New Mood Board"](){},
    ["New Text Chat"](){ system.todo("So do it already!") },
    ["New Video Chat"](){ system.todo("So do it already!") },
    ["New Voice Chat"](){ system.todo("So do it already!") },
    ["New Screen Grab"](){ system.todo("So do it already!") },
    ["New Tutorial"](){ system.todo("So do it already!") },
    ["New Onboarding Help Reference Guide"](){
        system.todo("So do it already!")
    },
    ["Open P5.js Documentation"](){
        // NOTE: we check the width/height in our own parser to know the default size :)
        // we can add other optional params like md:width, lg:width, etc
        return "https://p5js.org/reference/?width=800&height=600"
    },
    ["Open P5.js Playground"](){
    },
    ["New Notebook..."](){

    },
    ["Play N64 > Starfox"](){
        //return new N64EmulatorWidget
        //return new iFrameWidget
        system.registerWidgetInstance(new iFrameWidget("https://www.retrogames.cc/embed/32822-star-fox-64-usa-rev-a.html"))
    },
    ["Play N64 > Super Mario 64"](){
        system.registerWidgetInstance(new iFrameWidget("https://www.retrogames.cc/embed/43416-super-mario-64-sky-stories.html"),{
            // widgetSize:{width:600,height:450}
            widgetSize:{width:1920,height:1080}
        })
    },
    // charmeleon, quest 64, 
    ["Play SNES > Super Mario World"](){
        system.todo("paste iframe url!")
    },
    ["Play SNES > Pac Attack"](){
        system.registerWidgetInstance(new iFrameWidget("https://www.retrogames.cc/n64-games/super-mario-64-sky-stories.html"))
    },
    // ["Play N64 > ..."](){

    // },
    ["Play N64 Yoshi's Story"](){
        /*
        <iframe src="https://www.retrogames.cc/embed/32546-yoshi-s-story-usa-en-ja.html" width="600" height="450" frameborder="no" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" scrolling="no"></iframe>
        */
        system.registerWidget(new iFrameWidget(
            "https://www.retrogames.cc/embed/32546-yoshi-s-story-usa-en-ja.html",
            {
                //widgetSizeArr:[800,600],
                widgetSize:{width:800,height:600}
            }
        ))
    },
    ["Play SNES Yoshi's Island"](){
      system.registerWidget(new iFrameWidget(
        "https://www.retrogames.cc/embed/44541-yoshis-island-no-crying-improved-sfx-and-red-coins.html",
        {
            widgetSize:{
                width:800,
                height:600
            }
        //fullTag:`<iframe src="https://www.retrogames.cc/embed/44541-yoshis-island-no-crying-improved-sfx-and-red-coins.html" 
        // width="600" 
        // height="450" 
        // frameborder="no" 
        // allowfullscreen="true" 
        // webkitallowfullscreen="true" 
        // mozallowfullscreen="true" 
        // scrolling="no"></iframe>`
      }))
    },
    ["cue up..."](){},
    ["Play SNES Super Mario Kart"](){

    },
    // ["Play SNES Pac Attack"]
    ["Play Battle Tetris - Jstris (from Gather.town)"](){
        system.registerWidget(new iFrameWidget(
            "https://jezevec10.com"
        ))
        system.registerWidget(new iFrameWidget(
            "https://jstris.jezevec10.com/",{
                widgetSize:{width:800,height:600}
            }
        ))
    },
    ["3"](){
        // 3 toggles 3 js mode
        InvokableCommands["Load THREE.js"]()
    },
    ["Load THREE.js"](){
        if(window.three_mode_initialized){
            window.disableTHREEMode();
        }else{
            window.initTHREEMode();
        }
    },
    ["Play DJ Shadow Nobody Speak ft. Run The Jewels RTJ"](){
        return "https://www.youtube.com/watch?v=NUC2EQvdzmY?width=640&height=480";
    },
    // TODO: the suggestion should show as "Play Aesop Rock - Mindful Solutionism"
    ["dehydrated onion dip"](){
        return "https://www.youtube.com/watch?v=T7jH-5YQLcE&width=800&height=600";
    },
    ["Aesop Rock - Kyanite Toothpick (feat. Hanni El Khatib) [Official Video]"](){
        // // offer up the lyrics on rap genius
        // // https://genius.com/Aesop-rock-kyanite-toothpick-lyrics => <div id='rg_embed_link_9519850' class='rg_embed_link' data-song-id='9519850'>Read <a href='https://genius.com/Aesop-rock-kyanite-toothpick-lyrics'>“Kyanite Toothpick” by Aesop Rock</a> on Genius</div> <script crossorigin src='//genius.com/songs/9519850/embed.js'></script>
        // system.registerWidget(new iFrameWidget(
        //     "https://genius.com/Aesop-rock-kyanite-toothpick-lyrics"
        // ))

        // render the lyrics in a text viewer
        // TODO: make the song appear when lyrics are recognized?
        system.registerWidget(new TextViewerWidget(
            "Hello! I'm a text viewer widget! I can render text, markdown, and html!",
        ))

        // Aesop Rock - Kyanite Toothpick (feat. Hanni El Khatib) [Official Video]
        // Rhymesayers Entertainment
        return "https://www.youtube.com/watch?v=1ogz-QzaCQ8"
    },
    ["Play Mindful Solutionism"](){
        return "https://www.youtube.com/watch?v=T7jH-5YQLcE&width=800&height=600"
    },
    ["Play Symphony of Science - We Are All Connected"](){
        return "https://www.youtube.com/watch?v=XGK84Poeynk";
        // blocked :/
        // return "https://www.youtube.com/watch?v=-qUj3A3Yl1E";
    },
    ["Play Glorious Dawn"](){
        // ~> new YoutubePlayerWidget
        return "https://www.youtube.com/watch?v=zSgiXGELjbc";
    },
    ["Play Run The Jewels"](){ 
        return "https://www.youtube.com/watch?v=AfuCLp8VEng";
    },
    ["Play Lovely Day"](){
        return "https://www.youtube.com/watch?v=A7SOY2M2jC0";
    },
    ["Play Powers of Ten"](){
        return "https://www.youtube.com/watch?v=0fKBhvDjuy0";
    },
    ["Play The Mother of All Demos"](){
        return "https://www.youtube.com/watch?v=yJDv-zdhzMY";
    },
    ["Paste from Clipboard"](){
        // access the clipboard and see if there's an image (base64 encoded)
        navigator.clipboard.read().then(data => {
            if (!data || !data.items) {
                console.log("No data found on clipboard");
                return;
            }
            for (let i = 0; i < data.items.length; i++) {
                if (data.items[i].type.indexOf("image") === -1) {
                    continue;
                }
                const blob = data.items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function(event) {
                    console.log(event.target.result); // This is the base64 image
                };
                reader.readAsDataURL(blob);
            }
        }).catch(err => {
            console.error("Error reading clipboard contents: ", err);
        });
    },
    ["Set Command Icon"](){},
    ["New Icon"](){},
    ["open photopea"]:"https://www.photopea.com/",
    ["open piskel"]:"new_pixel_art",
    // you don't have to invent something if someone has iframes and import/export already
    ["new pixel art"]:"https://www.piskelapp.com/p/create/sprite",
    ["New Resource"](){},
    //["New Stream"](){},
    // ["New Goal"](){},
    ["New Promise"](){},
    ["Bucket List Item Completed"](){},
    ["New Bucket List Item"](){},
    ["Play with Splines"](){},
    ["Play with signed distance fields"](){},
    ["Play with marching cubes"](){},
    ["Play Pure Imagination"](){
        return "https://www.youtube.com/watch?v=4qEF95LMaWA";
    },
    ["Play Charlie and the Chocolate Factory (19XX)"](){},
    ["Play Inside - TJ Mack"](){
        return "https://www.youtube.com/watch?v=evwGhEyjIRs";
    },
    ["Play Rick Roll"](){
        return "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    },
    ["Send Message To Server"](){
        let response = prompt("What would you like to say to the server?")
        // Check if the message is empty
        if (!response.trim()?.length) {
            alert('Message cannot be empty');
            return;
        }
        let sanitized = response
        // Sanitize the input to make it safe for RPC
        sanitized = sanitized.replace(/[^a-zA-Z0-9 ]/g, "");
        if (!sanitized.trim()?.length) {
            alert('no valid chars given');
            return;
        }
        socketIO.emit('message', sanitized);
    },
    ["stream PCM Audio Data from microphone to server..."](){
        system.todo("DO IT ALREADY");
    },
    /* async suffix means it returns a promise */
    ["Send Image To Server Async"](){
        let file = arguments[0]; /* from a Drop Event */
        let formData = new FormData();
        formData.append('file', file);
        return fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Image sent to server!",data);
        })
        .catch((error) => {
            system.error("Error:", error);
        });
    },
    ["DEV: Toggle Clear BG Flag(s)"](){
        // clear the cmd palette first, wait a tick THEN unset the flag
        store.CmdPromptVisible = false;
        
        // blank out the bg
        mctx.fill("black")
        mctx.background("black")

        setTimeout(()=>{
            store.clearMode = !store.clearMode;
        },1000)
    },
    
    ["Play (Youtube): Haddaway - What Is Love [Official]"](){
        return "https://www.youtube.com/watch?v=OFNrN_6Ta5I";
        // when AI guesses right?!
        // return "https://www.youtube.com/watch?v=HEXWRTEbj1I";
    },

    ["Play: The Avalanches > Frontier Psychiatrist"](){
        return "https://www.youtube.com/watch?v=qLrnkK2YEcE";
    },

    ["Open Chrome Experiments"]:"https://experiments.withgoogle.com/",
    
    ["Chrome Experiments > Chrome Music Lab - Song Maker"]:"https://musiclab.chromeexperiments.com/Song-Maker",
    
    // save, remember, share, fave -> T{x}
    [`like song "x"`](x){
        console.warn('TODO: like song: x: ',{x})
    },
    // reccomend (( remember # plays, skips, likes, dislikes, etc... ))
    // dislike, forget, block, hide ~> T{x}
    [`dislike song "x"`](x){
        console.warn('TODO: dislike song: x: ',{x})
    },
    ...(
        [
            "enter the lock screen", 
            "enter lock screen", 
            "lock the screen", 
            "lock screen",
            "enter screensaver", 
            "start screensaver", 
            "enter screensaver mode"
        ].reduce((acc, alias) => ({ 
            ...acc, [alias]: () => system.invoke("LOCK_THE_SCREEN") 
        }), {})
    ),
    ["lock the screen"](){
        // puts the system in lock screen, screen save mode
        InvokableCommands["CLOSE_ALL_WIDGETS"]()

        // center the view
        system.invoke("CENTER_VIEW")

        system.invoke("ENABLE_DEEP_RENDERER")
        system.invoke("ENABLE_SPRITES")
        // display the lock screen widget
        system.invoke("NEW_CLOCK_WIDGET")
        system.invoke("NEW_TIME_TO_SUNSET_WIDGET")

    },
    // BG Effects
    ["disable sprites"](){
        store.disableSprites = true;
    },
    ["enable sprites"](){
        store.disableSprites = false;
    },
    // ["enable deep renderer"](){
    //     store.disableDeepCanvas = false;
    // },
    // ["disable deep renderer"](){
    //     store.disableDeepCanvas = true;
    // },
    ["toggle deep renderer"](){
        store.disableDeepCanvas = !store.disableDeepCanvas;

        // clear the canvases anytime we change rendering options
        deepCanvasManager.canvases.forEach((c)=>{
            c.clear();
        })
        mainCanvasContext.clear();

        this.getLabel = function(){
            return `${!bool ? 'Enable' : 'Disable'} Deep Canvas Renderer`
        }
    },
    ["set zoom"](){
        store.zoom = parseFloat(parseFloat(prompt("what level? (number)", store.zoom) ?? 0).toFixed(2))
    },
    ["new test runner"](){
        //system.invokeWith(TestRunnerWidget)
        //system.registerWidget(new TestRunnerWidget());
        system.todo("instance a test runner widget!")
    },
    // lizard, pig, lion, what else? dinosaurs?!
    // snail, camel, moose, deer, elk, ...
    ["new bird"](){
        system.registerWidgetInstance(new BirdWidget());
    },
    ["new fish"](){
        system.registerWidgetInstance(new FishWidget());
    },
    ["new dog"](){
        // reminders to take care of your pet!
        system.registerWidgetInstance(new DogWidget());
    },
    ["new cheshire cat"](){
        system.registerWidget(new ImageViewerWidget("cheshire-cat.gif"))
    },
    ["new clock"](){
        system.registerWidgetInstance(new ImageViewer("clock.webp"))
    },
    ["new cat"](){
        InvokableCommands["new cheshire cat"]();
        system.registerWidgetInstance(new CatWidget());
    },
    ["New sketchpad"](){
        system.registerWidgetInstance(new SketchpadWidget());
    },
    // workflows
    ["new workflow"](){},
    ["new flow field"](){},
    ["new idea"](){},
    // start a random favorite or similar youtube video
    ["enter chore mode"](){},
    ["enter vacuuming mode"](){},
    new_tab: "new_browser_bubble",
    ["new synthesizer"](){
        // spawn a Synth Widget :D
        alert("Todo: spawn a synthesizer widget on the intergalactic hyperdimensional breadboard!")
    },
    ["new youtube player"](){
        system.registerWidgetInstance(new YoutubePlayerWidget(prompt("what video?", "https://www.youtube.com/watch?v=Z0hDnmQPH4g")));
    },
    ["TODO: make it remember when deep rendering and three rendering were last on when you restart the page"](){
        // maybe just add it to the url continually?
    },
    ["add song"](){
        let response = prompt("Which song?! (youtube urls for now, soon: NLP)")
        //system.invokeWith(YoutubePlayerWidget, response)
        system.registerWidgetInstance(new YoutubePlayerWidget(null,{
            tracks:[response]
        }));
    },
    ["play next"](){
        alert("todo: skip to next media")
    },
    ["undo"](){
        alert("todo: undo")
    },
    ["redo"](){
        alert("todo: redo")
    },
    ["select all"](){
        alert("todo: select all")
    },
    ["de-select all"](){
        alert("todo: de-select all")
    },
    ["invert selection"](){
        alert("todo: invert selection")
    },
    // alias("new iframe", "new iframe widget")
    // ["new iframe"]: aliasInvoke("new iframe widget")
    // invokeAliasTarget("")
    ["new iframe"](){
        InvokableCommands["new iframe widget"](...arguments)
    },
    ["new iframe widget"](){
        if(typeof arguments?.[0] === "string"){
            system.registerWidgetInstance(new iFrameWidget(...arguments))
            return this;
        }
        // todo: PinnedIFrameWidgetInstantiator / factory?
        let response = prompt("what url? (most dont work sadly, look for iframe-embed friendly urls and share links) \n you can paste a whole iframe html snippet here","http://iframesafe.url")
        system.registerWidgetInstance(new iFrameWidget(response))
    },
    ["split bubble"](){},
    ["duplicate widget"](){},
    // multicursor.js
    ["select next occurance"](){},
    ["select all occurances"](){},
    ["select previous occurance"](){},
    ["new browser bubble"](){
        InvokableCommands["new iframe widget"]()
    },
    ["new mind map"](){
        alert('TODO!')
    },
    ["new todo"](){
        alert('TODO! get current most recent focused todo list, or create a new one, and add the item')
    },
    ["new grid of things"](){
        system.registerWidgetInstance(new GridOfThingsWidget())
    },
    ["open calendar"](){
        system.registerWidgetInstance(new CalendarWidget())
    },
    ["new timer"](){
        system.registerWidgetInstance(new TimerWidget())
    },
    ["new pomodoro timer"](){
        system.registerWidgetInstance(new PomodoroWidget())
    },
    ["new stopwatch"](){
        //system.registerWidgetInstance(new StopwatchWidget())
    },
    ["new countdown"](){
        //system.registerWidgetInstance(new CountdownWidget())
    },
    ["new daily task"](){
        system.todo("new daily task!")
    },
    ["new goal"](){},
    ["boomerang thought"](){},
    ["conversation freefall"](){},
    ["new conversation map"](){},
    ["new mind map"](){},
    ["new timeline"](){},
    ["new project"](){},
    ["new sketchfab viewer"](){
        system.invokeWith(SketchfabEmbedWidget)
    },
    ["hello"](){
        system.get("toastManager").showToast("🐶 HHH WOOOAHW!", {pinned: false, important: true});
    },
    ["set deep canvas blur level"](){
        // {
        //     type: "number",
        //     default: 0.9,
        //     min: 0,
        //     max: 1,
        //     step: 1
        // }
        let response = prompt("Set Deep Canvas Blur Level",store.deepCanvasBlurLevel ?? 10)
        //(value)=>{
            store.deepCanvasBlurLevel = response;
        //}
    },
    ["New Egg Timer"](){
        //return "https://e.ggtimer.com/5";
        system.registerWidget(new iFrameWidget("https://e.ggtimer.com/5",300,300))
        return;
    },
    ["New Calculator Widget"](){
        system.registerWidgetInstance(new CalculatorWidget())
    },
    ["New Time To Sunset Widget"](){
        system.registerWidget(new TimeToSunSetWidget());
    },
    ["Embed Tweet"](){
        // return "<blockquote class="twitter-tweet" data-dnt="true" data-theme="dark"><p lang="en" dir="ltr">copy that <a href="https://t.co/cNI0UDfPtt">pic.twitter.com/cNI0UDfPtt</a></p>&mdash; Jacob Downs (@jakedowns) <a href="https://twitter.com/jakedowns/status/1724611135209455721?ref_src=twsrc%5Etfw">November 15, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>"

        // <iframe border=0 frameborder=0 height=250 width=550
        //  src="https://twitframe.com/show?url=https%3A%2F%2Ftwitter.com%2Fjack%2Fstatus%2F20"></iframe>
        // https://twitter.com/jakedowns/status/1724611135209455721
        // https%3A%2F%2Ftwitter.com%2Fjakedowns%2Fstatus%2F1724611135209455721
        let urlSafeUrl = 
        encodeURIComponent("https://twitter.com/jakedowns/status/1724611135209455721");
        system.registerWidget(new iFrameWidget(`https://twitframe.com/show?url=${urlSafeUrl}`,550,800))
    },
    ["UI Inspiration > Minority Report UI"](){
        return "https://www.youtube.com/watch?v=NwVBzx0LMNQ"
    },
    ["UI Inspiration > HER Game"](){
        return "https://www.youtube.com/watch?v=c8zDDPP3REE"
    },


    ["new todo"](){
        let result = prompt("What?","something...")
          if (!store.currentFocusedTodoWidgetID) {
              let newTodoWidget = new TodoWidget();
              system.registerWidget(newTodoWidget);
              store.currentFocusedTodoWidgetID = newTodoWidget.id;
          }
          system.latestTodoWidgetOrNew.addTodo(result);
    },

    ["go to gather"](){
        system.newWidget(new iFrameWidget("https://app.gather.town/"))
    },

    ["new shared piano"](){
        
        system.newWidget(new iFrameWidget("https://musiclab.chromeexperiments.com/Shared-Piano/"))
    },

    // todo: [...aliases] || this.aliases
    ["start pomodoro timer"](){ InvokableCommands["new pomodoro timer"](); },
    ["new pomodoro session"](){ InvokableCommands["new pomodoro timer"](); },
    ["new pomodoro timer"](){
        //system.invokeWith()
        system.registerWidgetInstance(new PomodoroWidget())
    },
    ["toggle widgets stacked"](){
        system.dashboard.toggleCollapsed();
    },
    ["new clock widget"](){
        system.registerWidgetInstance(new ClockWidget())
    },
    ["add bonsai buddy"](){
        return "https://media.tenor.com/7iXm21Nh5VoAAAAM/monke-bonzi-buddy.gif"
    },
    ["add giphy sticker"](){
        return "https://giphy.com"
    },
    // TODO: more "knowledge graph" connections / exploration
    ["Watch Feels Good Man"](){
        return "https://en.wikipedia.org/wiki/Feels_Good_Man"
    },
    ["Play Quad City DJ's - C'Mon 'N Ride It (The Train)"](){
        return "https://www.youtube.com/watch?v=D53M1vVF2N4"
    },
    // TODO: extract metadata and cache it (about youtube and other fetched urls)
    ["Play BAMBOO WATER FOUNTAIN | Relax & Get Your Zen On | White Noise"]: "https://www.youtube.com/watch?v=aJaZc4E8Y4U",

    ["Play Redbone"]:"https://soundcloud.com/childish-gambino/redbone",
        // DRM'd good one:
        //return "https://www.youtube.com/watch?v=Kp7eSUU9oy8"

    play_dido_thank_you: "https://www.youtube.com/watch?v=1TO48Cnl66w",
    samples_dido_thank_you(){
        return InvokableCommands.play_eminem_stan_ft_dido;
    },
    play_eminem_stan_ft_dido: "https://www.youtube.com/watch?v=gOMhN-hfMtY",

    ["Play Bestie"]:"https://www.youtube.com/watch?v=5SH69RyqLA4",

    this_is_fine: "fine.gif",
    feels_good_man: "feelsgoodman.gif",

    "new hand-written digit recognizer": "",
    "new hand-drawn shape recognizer": "",
    "new classifer": "",
    // textual inversion, style transfer
    "new AI training run": "",
    "generate an image of...": "",
    "convert this image to a video": "",
    "combine these images!": "",

    "watch bob ross": "",
    "watch wheel of fortune": "",
    "watch powerpuff girls": "",
    "watch the simpsons": "",

    "play half life": "",
    "play portal 2": "",

    "remember...": "",
    "forget...": "",

    "YouTube - The Coding Train - Coding Challenge 177: Soft Body Physics": "https://www.youtube.com/watch?v=IxdGyqhppis",

    "visit the coding train": "https://thecodingtrain.com/?width=800&height=600",

    "new snake game": "play snake",
    "play snake"(){
        system.registerWidget(new SnakeWidget());
    },
    "play Pipe Game"(){
        system.registerWidget(new PipeGameWidget());
    },
    "play line rider": "https://www.linerider.com/",

    "the spinning top from inception": "https://www.youtube.com/watch?v=pQd1-4tqymo",
    "new research journey"(){

    },
    "resume research journey"(){
    },
    "return to most recent notebook"(){

    },

    "check the weather":"check the forecast",
    "whats it like outside":"check the forecast",
    "check the forecast"(){

    },

    "what do i have going on today?":"check my calendar",
    
    "new shader graph"(){},
    "new shadertoy shader"(){},
    "browse shadertoy"(){},
    "favorite shaders"(){},
    "new sim city"(){},
    "new roller coaster tycoon"(){},
    "play uno"(){},
    "play dos (from the makers of uno)"(){},
    "play sorry"(){},
    "play trouble"(){},
    "play connect four"(){},
    "play chess"(){},
    "mucho party"(){},
    "play crazy eights"(){},
    "maze race"(){},
    "play monopoly"(){},
    "play scrabble"(){},
    "word search"(){},
    "who wants to be a millionaire"(){},
    "you don't know jack"(){},


    "search spotify"(){},
    "search pandora"(){},
    "search soundcloud"(){},

    "toggle fullscreen"(){
        //system.invoke("TOGGLE_FULLSCREEN");
        if(!store.isFullscreen){
            document.documentElement.requestFullscreen().then(() => {
                store.isFullscreen = true;
            }).catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        }else{
            document.exitFullscreen().then(() => {
                store.isFullscreen = false;
            }).catch(err => {
                console.log(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
            });
        }
    },

    "what about > ctrl+z that takes you between CONTEXTS (bubbles) instead of just per-app?":true,
    "what about > seeing your daily digital journeys and being able to zoom out and see loops and trends and topics and news like a little wii town that can be rendered in any style of our choosings! byos-mmo":true,
    "request metadata for url"(){
        let url = prompt("What url?","https://www.youtube.com/watch?v=fc9bYJKNpdQ")
        // we use socket-io to request the server send us some metadata about the url
        if (!socketIO.hasListeners('metadata')) {
            socketIO.on('metadata', (data) => {
                console.log('metadata',data);
            });
        }
        socketIO.emit('request-metadata', url);
    },

    ["Plant a tree"](){
        socketIO.emit('plant-tree');
        system.invoke("NEW_TREE_WIDGET");
    },
    ["new tree widget"](){
        system.registerWidget(new TreeWidget());
    },

    ["toggle youtube playback to repeat"](){
        
    },

    ["meteor shower"](){},
    ["aurora"](){},
    ["rainstorm"](){},

    ["lightning"](){
        system.todo("toggle bg lightning effects")
    },
    // increase lightning
    // decrease lightning
    // increase thunder
    // decrease thunder
    // increase rain
    // decrease rain

    ["light rain"](){},
    "new fireplace":"https://www.youtube.com/watch?v=7s5MdY_VX7A",

    ["smile.png"]:"smile.png",
    ["rotating smile"](){
        system.registerWidget(new ImageRotatorWidget("smile.png"))
    },

    // ["play i'm on everything"]: "https://www.youtube.com/watch?v=q2sn-ULymu8",
    ["play i'm on everything"]:()=>"https://www.youtube.com/watch?v=q2sn-ULymu8",
    ["play with physics"](){},
    ["play with gravity"](){},
    ["disable gravity"](){},
    ["disable friction"](){},

    ["new voice recording"](){},
    ["new voice memo"](){},
    
    ["toggle monochrome mode"](){
        body.classList.toggle("monochrome");
    },
    ["audio only"](){

    },
    ["toggle captions"](){

    },
    ["new conversation map"](){

    },


    ["dark mode"](){},
    ["light mode"](){},
    ["new theme"](){},
    ["new style guide"](){},
    ["new promo materials"](){},
    ["Play Pendulum  Hold your Colour Full Album"](){
        return "https://www.youtube.com/watch?app=desktop&v=RbWeGfcuQNo"
        // the one i want is restricted
        // todo: use python backend to extract
        // playable url from youtube-dl
        return "https://www.youtube.com/watch?v=931PQwTA79k";
    },
    ["show cardbox ideaz"](){
        system.registerWidget("chrome_Eg990Efhut.png")
        system.registerWidget("chrome_SeWUnElI6x.png")
    },
    ["New AI Chat Widget"](){
        system.registerWidget(new AIChatWidget());
    },
    ["Play: Black Sabbath > War Pigs"](){
        return "https://www.youtube.com/watch?v=bc5Nk1DXyEY"
        // blocked:
        // return "https://www.youtube.com/watch?v=PrZFscfJxXc"
        // return "https://www.youtube.com/watch?v=LQUXuQ6Zd9w"
    },
    ["Play chillout study session"](){
        return "https://www.youtube.com/watch?v=tkgmYIsflSU"
    },
    // ["Music Player"](){
    //     //system.registerWidget(new MusicPlayerWidget());
    //     console.warn("TODO!")
    //     // show warning toast
    //     system.get("toastManager").showToast("TODO: Music Player Widget", {pinned: false});
    // },
    // ["Close All Players"](){

    // },
    ["Close All Widgets"](){
        /** @see Dashboard.closeAllWidgets */
        system.dashboard.closeAllWidgets();
    },
    ["Fresh Start"](){ InvokableCommands["CLOSE_ALL_WIDGETS"](); },
    ["Close All"](){ InvokableCommands["CLOSE_ALL_WIDGETS"](); },
    ["Clear"](){ InvokableCommands["CLOSE_ALL_WIDGETS"](); },
    ["TODO: make options sorted by usage, weighted default rankings"](){
        // do it, then
        system.todo("SO DO IT, THEN!")
    },
    ["TODO: soundcloud, vimeo, etc... (generic url embeds / paste support)"](){
        system.todo("Do it then!");
    },
    ["stumbleupon"](){
        system.todo("show some random content!")
    },
    ["Say..."](){
        system.todo(prompt("What would you like to say?"))
    },
    // TODO: make aliases and weighting/ranking easier
    ["Clear Dashboard"](){ InvokableCommands["Close All Widgets"]() },
    ["Open All Players"](){
        let returns = []
        // show a toast of the number of InvokableCommands that start with "play"
        let filtered = Object.entries(InvokableCommands).filter(([key, value])=>{
            return key.toLowerCase().startsWith("play")
        });
        console.warn("open all players",filtered.length,"players",filtered)
        filtered.forEach(([key, value])=>{
            if(key.toLowerCase().startsWith("play")){
                let urls = value();
                console.log("urls",urls)
                system.registerWidget(new YoutubePlayerWidget({
                    widgetSize:{
                        width: windowWidth * 0.25,
                        height: windowWidth * 0.25 * (9 / 16)
                    },
                    autoPlay: true,
                    tracks: typeof urls === 'string' ? [urls] : urls
                }))
            }
        })
        return;
    },
    /*
        type: "number",
        default: 0.9,
    */
    ["Set Dashboard Friction"](){
        console.warn("Set Dashboard Friction...");
    },
    ["recenter"](){
        system.invoke("CENTER_VIEW");
    },
    ["sign up"](){},
    ["register..."](){},
    ["learn more..."](){},
    ["new account"](){},
    ["create account"](){},
    ["log in"](){},
    ["log out"](){},
    ["focus"](){
        InvokableCommands["Center View"]();
    },
    // center field
    // center plane
    // return to origin again...
    ["Center View"](){
        console.warn("Center View...");
        /** @see Dashboard.centerView */
        system.dashboard.centerView();
    },
        // [
        //     "Center {View|Viewport}: Center the current view or viewport",
        //     "Center {View|Viewport} on Origin: Center the current view or viewport on the origin",
        //     "{Center|Move} to {origin|home}: Center or move to the origin or home position",
        //     "{?go} home: Optionally go to the home position"
        // ]
    //],
    ["view/edit p5 webgl spinning cube demo"](){
        system.registerWidgetInstance(new iFrameWidget(
            "https://editor.p5js.org/jakedowns/full/LM0oRxYGt"
        ))
    },
    ["new rubiks cube GL"](){
        system.registerWidget(new RubiksCubeGL());
        cmdprompt.hide();
    },
    ["new rubiks cube 2D"](){
        system.registerWidget(new RubiksCubeWidget());
        cmdprompt.hide();
    },
    ["play pacman"](){
        system.registerWidget(new iFrameWidget("https://www.google.com/logos/2010/pacman10-i.html"));
    },
    // @see tetriswidget
    ["new tetris widget"](){
        console.warn("SPAWNING TETRIS!")
        let instance = new TetrisWidget();
        system.registerWidget(instance);
        // hide the command prompt
        cmdprompt.hide();
    },
    /*
    {
        name: "Set Plax Exp Factor",
        type: "number",
        default: 0,
        min: 0,
        max: 2,
        step: 0.01
    },
    */
    ["Set Plax Exp Factor"](wiz){
        let checkKeys = [
            stepResponses[0].answerStorageKey,
            "value",
            "input"
        ]
        let match, matchKey;
        // aka find, but also with a warning if there are multiple matches
        checkKeys.forEach((key)=>{
            if(isEmptyOrUndefined(wiz?.stepResponses?.[0]?.[key])){
                console.warn('bad key',key,wiz?.stepResponses?.[0])
            }else{
                if(typeof match === 'undefined'){
                    match = wiz?.stepResponses?.[0]?.[key]
                    matchKey = key;
                }else{
                    console.warn('multiple matches',{
                        key,
                        stepResponse:wiz?.stepResponses?.[0],
                        prevMatchKey: matchKey,
                    })
                }
            }
        })
        if(typeof match === 'undefined'){
            console.warn('no match found')
        }else{
            // match value
            console.warn('match found',{match})
            store["currentPlaxExpFactor"] = match;
        }
    }
}
function machineize(str){
    // make the string "machine-y"
    // replace spaces with underscores
    return str.replace(/ /g, "_").replace(/[^\w\s]/gi, '').toUpperCase();
}
Object.entries(InvokableCommands).forEach(([key, val]) => {
    // console.log(`setup cmd: key: ${key}, val: ${val}`);
    // remap all commands to a normalized format that makes
    // all of the key names upper cased and spaces replaced with `_` underscores
    // panic on any collisions
    let normalizedKey = machineize(key);
    if (normalizedKey !== key) {
        // console.warn(`remapping ${key} to ${normalizedKey}`);
        if (normalizedKey in InvokableCommands) {
            console.error(`collision! ${normalizedKey} already exists!`);
            throw new Error(`collision! ${normalizedKey} already exists!`);
        }
        InvokableCommands[normalizedKey] = val;
        // delete InvokableCommands[key];
    }
})
const BasicBools = [
    "DISABLE_PARALLAX"
]
class Solitaire {}
class Gizmo extends Widget {
    onDraw(){
        super.onDraw(...arguments)
        console.warn('todo draw'+this.constructor.name)
    }
}

class MarchingCubesDemoWidget extends Widget {}
class AStarPathfindingDemoWidget extends Widget {}
class BasicPlatformerDemoWidget extends Widget {}

class WidgetForge extends Widget {}
class WizardForge extends WidgetForge {}
class GiphyWidget extends Widget {}
class MandlebrotWidget extends Widget {}
class FileBrowserWidget extends Widget {}
class WebBrowserWidget extends Widget {}
class IFTTTWidget extends Widget {}
class ShaderToyWidget extends Widget {}
class PixelArtWidget extends Widget {}
class VectorArtWidget extends Widget {}
class TextEditorWidget extends Widget {}
class P5JSSketchWidget extends Widget {}
class DrawIOWidget extends Widget {}
class FigJamWidget extends Widget {}
class ChessWidget extends Widget {}
class WorkflowyWidget extends Widget {}
class CreditsWidget extends Widget {}
class JSONViewer extends Widget {}
class GraphVizDotLangViewer extends Widget {}

class GlobeWidget extends Widget {}
class TimezoneClocksWidget extends Widget {}
class SplineEditorWidget extends Widget {}
class TimelineWidget extends Widget {}
class ColorPickerWidget extends Widget {
    // TODO
    onDraw(){
        super.onDraw(...arguments)
        this.ctx.fill("red")
        this.ctx.rect(0,0,100,100)
        this.ctx.fill(0)
        this.ctx.text("TODO: Color Picker Widget",0,0)
    }
}
class NestedDragAndDropSortingWidget extends Widget {}
class FractalTreeGraphViewerWidget extends Widget {}

// NEW: VISUAL CLIPBOARD! 
// SHOW WHEN THINGS ARE CUT/COPIED
class Clipping extends Widget {
    onDraw(){
        super.onDraw(...arguments)
        // draw the clippings
        fill("pink")
        rect(0,0,100,100)
    }
}
const drawVertex = function(x,y){
    // draw a vertex
    drawCrosshair("red",{x,y})
}
class IsometricPreview extends Widget {
    constructor(){
        super(...arguments)
        this.cubeRotation = Quaternion.FromEulerAngles(Math.PI / 4, Math.PI / 4, 0);
        this.cubePosition = [0, 0, 100]; // Position of the cube
        this.rotationAxis = 0; // 0 = x, 1 = y, 2 = z
        this.rotationProgress = 0; // Progress of the current rotation
        this.rotationSpeed = 1; // Speed of the rotation
    }
    faceColors = [
        "red",
        "green",
        "blue",
        "orange",
        "yellow",
        "purple"
    ]
    verts = [
        [-0.5, -0.5, -0.5],  // 0, 0, 0
        [-0.5, -0.5, 0.5],   // 0, 0, 1
        [-0.5, 0.5, -0.5],   // 0, 1, 0
        [-0.5, 0.5, 0.5],    // 0, 1, 1
        [0.5, -0.5, -0.5],   // 1, 0, 0
        [0.5, -0.5, 0.5],    // 1, 0, 1
        [0.5, 0.5, -0.5],    // 1, 1, 0
        [0.5, 0.5, 0.5]      // 1, 1, 1
    ];
    onDraw(){
        super.onDraw(...arguments)

        // Calculate the rotation amount
        let rotationAmount = this.rotationSpeed * deltaTime / 1000; // deltaTime is the time since the last frame in milliseconds
        this.rotationProgress += rotationAmount;

        // If the rotation is complete, switch to the next axis
        if (this.rotationProgress >= Math.PI / 2) {
            this.rotationProgress -= Math.PI / 2;
            this.rotationAxis = (this.rotationAxis + 1) % 3;
        }

        // Calculate the rotation for this frame
        let rotation = [0, 0, 0];
        rotation[this.rotationAxis] = rotationAmount;

        // Apply the rotation
        this.cubeRotation = this.cubeRotation.multiply(Quaternion.FromEulerAngles(...rotation));
        this.cubeRotation = this.cubeRotation.normalize();

        this.ctx.stroke("yellow")
        this.ctx.strokeWeight(1)
        this.ctx.fill("red")
        this.ctx.rect(0,0,100,100)

        this.ctx.push();
        let size = 100;
        let halfSize = size / 2;
        

        // "faces" for each of the "faces" of the cube, let's draw a polygon
        let faces = [
            [0, 1, 3, 2], // front
            [4, 5, 7, 6], // back
            [0, 1, 5, 4], // left
            [2, 3, 7, 6], // right
            [0, 2, 6, 4], // top
            [1, 3, 7, 5]  // bottom
        ];
        let absoluteVerts = []
        let rotatedVerts = []

        faces.forEach((face,faceIndex)=>{
            face.map((vertexIndex)=>{
                return this.verts[vertexIndex];
            }).forEach((faceVert)=>{
                if(faceVert.length !== 3 || (
                    Number.isNaN(faceVert[0]) ||
                    Number.isNaN(faceVert[1]) ||
                    Number.isNaN(faceVert[2])
                )){
                    throw new Error('bad faceVert')
                }
                // Apply quaternion rotation
                absoluteVerts.push([
                    this.cubePosition[0] + (faceVert[0] * size),
                    this.cubePosition[1] + (faceVert[1] * size),
                    this.cubePosition[2] + (faceVert[2] * size)
                ])
            })
        })


        faces.forEach((face,faceIndex)=>{
            let faceVertices = face.map((vertexIndex)=>{
                return this.verts[vertexIndex];
            })
            this.ctx.fill(this.faceColors[faceIndex])
            // draw the face
            this.ctx.beginShape();
            faceVertices.forEach((faceVert, vertIndex)=>{
                if(faceVert.length !== 3 || (
                    Number.isNaN(faceVert[0]) ||
                    Number.isNaN(faceVert[1]) ||
                    Number.isNaN(faceVert[2])
                )){
                    throw new Error('bad faceVert')
                }
                // Apply quaternion rotation
                let translatedVert = absoluteVerts[vertIndex];/* [
                    this.cubePosition[0] + (faceVert[0] * size),
                    this.cubePosition[1] + (faceVert[1] * size),
                    this.cubePosition[2] + (faceVert[2] * size)
                ]*/
                //let rotatedVertex = this.cubeRotation.multiplyVector(faceVert);
                let rotatedVert = this.cubeRotation.multiplyVector(translatedVert);
                // if any are nan, throw
                if(Number.isNaN(rotatedVert[0]) || Number.isNaN(rotatedVert[1]) || Number.isNaN(rotatedVert[2])){
                    console.error('bad value',{rotatedVert,faceVert,faceVertices,faceIndex,translatedVert,position:this.position})
                    throw new Error('bad value')
                }
                    // Project into screen space
                let scale = fov / (fov + rotatedVert[2]);
                let x2d = rotatedVert[0] * scale;
                let y2d = rotatedVert[1] * scale;
                rotatedVerts.push([x2d,y2d,rotatedVert[2]])
                // add point to shape
                this.ctx.vertex(x2d,y2d)
            })
            this.ctx.endShape(CLOSE);
        })

        //console.warn("ABSOULTE VERTS",absoluteVerts)

        // Apply the rotation to the vertices in screenspace
        let minZ = Math.min(...absoluteVerts.map(v => v[2]));
        let screenSpaceVertices = absoluteVerts.map((_vert) => {
            let offsetVec = [
                    this.cubePosition[0] + _vert[0] * size,
                    this.cubePosition[1] + _vert[1] * size,
                    minZ + this.cubePosition[2] + _vert[2] * size
            ]
            // Apply quaternion rotation
            let rotatedVertex = this.cubeRotation.multiplyVector(offsetVec,true);

            // Project into screen space
            let scale = fov / (fov + rotatedVertex[2] + Math.abs(minZ));
            let x2d = rotatedVertex[0] * scale;
            let y2d = rotatedVertex[1] * scale;

            // if any of the 3 are NaN, panic
            if(Number.isNaN(x2d) || Number.isNaN(y2d) || Number.isNaN(rotatedVertex[2])){
                console.error('bad value',{x2d,y2d,rotatedVertex,offsetVec,_vert})
                throw new Error('bad value')
                return [0,0,0]
            }

            return [x2d, y2d, rotatedVertex[2]];
        });

        if(!screenSpaceVertices.length){
            throw new Error("not enough verts!");
        }

        // sort into depth order
        screenSpaceVertices.sort((a, b) => {
            return a[2] - b[2]
        });


        absoluteVerts.forEach((vert)=>{
            this.ctx.stroke("red")
            this.ctx.strokeWeight(3)
            this.ctx.ellipse(vert[0],vert[1],10,10)
        })

        // for (let i = 0; i < screenSpaceVertices.length; i+=3) {
        //     //vertex(screenSpaceVertices[i][0], screenSpaceVertices[i][1]);
        //     if(i+2 >= screenSpaceVertices.length - 1){
        //         line(screenSpaceVertices[i][0],
        //             screenSpaceVertices[i][1],
        //             screenSpaceVertices[0][0],
        //             screenSpaceVertices[0][1])
        //         line(screenSpaceVertices[i][0], 
        //             screenSpaceVertices[i][1], 
        //             screenSpaceVertices[1][0], 
        //             screenSpaceVertices[1][1]);
        //         line(screenSpaceVertices[i][0], 
        //             screenSpaceVertices[i][1], 
        //             screenSpaceVertices[2][0], 
        //             screenSpaceVertices[2][1]);
        //     }else{
        //         line(
        //             screenSpaceVertices[i][0],
        //             screenSpaceVertices[i][1],
        //             screenSpaceVertices[i+1][0],
        //             screenSpaceVertices[i+1][1]
        //         )
        //         line(screenSpaceVertices[i][0], screenSpaceVertices[i][1], screenSpaceVertices[i+2][0], screenSpaceVertices[i+2][1]);
        //         line(screenSpaceVertices[i][0], screenSpaceVertices[i][1], screenSpaceVertices[i+3][0], screenSpaceVertices[i+3][1]);
        //     }
        //     ellipse(
        //         screenSpaceVertices[i][0], 
        //         screenSpaceVertices[i][1], 5, 5);
        //     if(screenSpaceVertices[i+1]){
        //         ellipse(
        //             screenSpaceVertices[i+1][0], 
        //             screenSpaceVertices[i+1][1], 5, 5);
        //     }
        //     if(screenSpaceVertices[i+2]){
        //         ellipse(
        //             screenSpaceVertices[i+2][0], 
        //             screenSpaceVertices[i+2][1], 5, 5);
        //     }
        // }
        // draw vertex
        //endShape(CLOSE);
        this.ctx.pop();
    }
}

class VisualClipboard extends Widget {
    clippings = [] // todo: add getter that casts to Clipping[]

    onDraw(){
        super.onDraw(...args)
        // draw the clippings
        this.clippings.forEach((clipping)=>{
            clipping.draw();
        })
    }
}


// represents a TimerManager and capable 
// of rendering multiple Timer instances in a single widget
class TimerWidget extends Widget {
    widgetSize = {
        width: 200,
        height: 200
    }
    constructor(){
        super(...arguments)
        // automatically generates a timerManager.timers[0]
        this.timerManager = new TimerManager(); 
    }
    onDraw(){
        super.onDraw(...arguments)
        /** @property timer @see Timer */
        this.timerManager.timers.forEach((timer,index)=>{
            // draw the timer
            textAlign(LEFT,TOP);
            // text(
            //     `${timer.id} ${timer.timeElapsedFormatted}`, 
            //     this.smartPosition.x + 20, 
            //     this.smartPosition.y + (index * 20)
            // )
            // draw the time elapsed vs. time remaining
            fill("red")

            text(
                `Timer ${index+1} \n elapsed: ${timer.timeElapsedFormatted} \n remaining: ${timer.timeRemainingFormatted}`,
                20,
                40
            )

            strokeWeight(1)
            stroke("blue");
            fill("black")
            text(timer.timeElapsed, 0,0)
            text(timer.timeRemaining, 0,20)

            // draw a circular progress bar on a white circle
            // draw a white circle
            strokeWeight(10);
            fill(0);
            ellipse(100, 100, 180, 180);
            // draw a circular progress bar
            noFill();
            stroke(255, 0, 0);

            // console.warn({
            //     a: typeof timer.timeElapsed,
            //     b: typeof timer.duration,
            // })
            

            // Ensure timer.timeElapsed and timer.duration are numbers
            if (typeof timer.timeElapsed === 'number' && typeof timer.duration === 'number') {
                let end = map(timer.timeElapsed, 0, timer.duration, 0, 360);
                end = 360 - end
                //console.warn('end',end);
                // Ensure end is a number that can be converted to radians
                if (!isNaN(end)) {
                    arc(100, 100, 180, 180, -HALF_PI, radians(end) - HALF_PI);
                } else {
                    console.error('Invalid end value:', end);
                }
            } else {
                //console.error('Invalid timer values:', timer.timeElapsed, timer.duration);
            }
        })
    }
}
class TimerWizardConfig extends WizardConfig {
    name = "New Timer..."
    steps = [
        {
            question: "What is the name of the timer?",
            subQuestions: [
                {
                    question: "What is the duration",
                    suggestions: [
                        {
                            name: "1 Minute",
                            value: "1m"
                        },
                        {
                            name: "5 Minutes",
                            value: "5m"
                        },
                        {
                            name: "Custom",
                            inputType: "number"
                        }
                    ]
                }
            ]
        },
    ]
}

class CommandWizardConfig extends WizardConfig {
    name = 'New Command'
    constructor(name){
        super(name ?? this.name)

        this.steps = [
            {
                question: "What is the name of the command?",
                answerStorageKey: "name",
                answerValidationRules: 'required:unique:string'
            },
            {
                question: "What is the description of the command?",
                answerStorageKey: "description",
                answerValidationRules: 'required:string'
            },
            {
                question: "What are the aliases for the command?",
                answerStorageKey: "aliases",
                answerValidationRules: 'optional:csv:string'
            },
            {
                question: "What are the key bindings for the command?",
                answerStorageKey: "keyBindings",
                answerValidationRules: 'optional:csv:string'
            },
        ]
    }
}

function isEmptyOrUndefined(thing){
    // console.warn(
    //     "isEmptyOrUndefined",
    //     {
    //         thing,
    //         type: typeof thing,
    //         len: (typeof thing === 'string' ? thing : "").trim()
    //     }
    // )
    return (
        typeof thing === 'undefined' 
        || thing === null 
        || !(typeof thing === 'string' ? thing : "")
            .trim().length
    ) ? true : false;
}

const vertexShaderSource = `
attribute vec4 aVertexPosition;
varying vec4 vColor;
varying vec2 vTexCoord;
void main(void) {
    gl_Position = aVertexPosition;
    vColor = vec4(1.0, 0.0, 0.0, 1.0); // example color
}
`

const doAfterWaitReturnTrue = function(check,timeout=1000,interval=100){
    return new Promise((resolve,reject)=>{
        let start = Date.now();
        setTimeout(function checkCondition() {
            try {
                if (check()) {
                    resolve(true)
                } else if (Date.now() - start < timeout) {
                    setTimeout(checkCondition, 100);
                } else {
                    reject(new Error('timed out for ' + check + ': ' + arguments));
                }
            } catch (e) {
                console.error(e);
                reject(e)
            }
        }, interval);
    })
}

// domready
document.addEventListener('DOMContentLoaded', (event) => {
    // TODO: await Peer to become available...

    doAfterWaitReturnTrue(()=>typeof window?.Peer !== 'undefined').then(()=>{
        // call the server and try to establish a p2p webrtc connection with another client
        const peer = new Peer({key: 'your_api_key_here'});

        peer.on('open', function(id) {
            console.log('My peer ID is: ' + id);
        });
    
        peer.on('connection', function(conn) {
            conn.on('data', function(data){
                console.log('Received', data);
            });
        });
    
        let conn = peer.connect('another-peers-id');
        conn.on('open', function(){
            conn.send('hi!');
        });
    })
    
});



class CanvasCompositor {
    canvases = []
    constructor(canvases, shaderProgramSource, topCanvas) {
        // this.canvases = canvases.sort((a, b) => {
        //     // Normalize for the fact that some "a" or "b" may have .elt sub key
        //     let getZIndex = obj => obj.elt?.style?.zIndex || obj.style?.zIndex || 0;
        //     return getZIndex(a) - getZIndex(b);
        // }); // Sort by z-index
        let gl = topCanvas.getContext('webgl');

        // Create a shader program
        let _shaderProgram = gl.createProgram();

        // Create a vertex shader
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        // Check if the vertex shader compiled successfully
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the vertex shader: ' + gl.getShaderInfoLog(vertexShader));
            return null;
        }

        // Create a fragment shader
        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, shaderProgramSource);
        gl.compileShader(fragmentShader);

        // Check if the fragment shader compiled successfully
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the fragment shader: ' + gl.getShaderInfoLog(fragmentShader));
            return null;
        }

        // Attach the shaders to the program
        gl.attachShader(_shaderProgram, vertexShader);
        gl.attachShader(_shaderProgram, fragmentShader);

        // Link the program
        gl.linkProgram(_shaderProgram);

        this.shaderProgram = _shaderProgram;

        // Check if the program linked successfully
        if (!gl.getProgramParameter(_shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(_shaderProgram));
            return null;
        }
        this.topCanvas = topCanvas// || this.createTopCanvas();
        this.glContexts = this.canvases.map(canvas => this.getContext(canvas));
        this.framebuffers = this.glContexts.map(gl => this.createFramebuffer(gl));
    }

    getContext(canvas) {
        if (canvas instanceof p5) {
            //return canvas.drawingContext;
            return canvas.getContext('2d', { willReadFrequently: true })
        } else if (canvas instanceof THREE.WebGLRenderer) {
            return canvas.getContext('webgl', { willReadFrequently: true });
        } else {
            return canvas.getContext('webgl', { willReadFrequently: true });
        }
    }

    createTopCanvas() {
        let topCanvas = document.createElement('canvas');
        document.body.appendChild(topCanvas);
        return topCanvas;
    }

    createFramebuffer(gl) {
        let framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.drawingBufferWidth, gl.drawingBufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        return { framebuffer, texture };
    }

    captureCanvasState(gl, canvas, i) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[i].framebuffer);
        if (canvas instanceof p5) {
            canvas.drawingContext.drawImage(canvas.canvas, 0, 0);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(canvas.drawingContext.getImageData(0, 0, canvas.width, canvas.height).data), gl.STATIC_DRAW);
        } else if (canvas instanceof THREE.WebGLRenderer) {
            // Capture THREE.js canvas state
            // This will depend on your specific THREE.js setup
        } else {
            // Capture WebGL canvas state
            // This will depend on your specific WebGL setup
        }
    }

    compositeCanvases() {
        this.glContexts.forEach((gl, i) => {
            this.captureCanvasState(gl, this.canvases[i], i);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, this.framebuffers[i].texture);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.canvases[i].drawingContext.getImageData(0, 0, this.canvases[i].width, this.canvases[i].height).data));
        });
    }

    applyShaderAndRender() {
        let gl = this.topCanvas.getContext('webgl');
        gl.useProgram(this.shaderProgram);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    render() {
        // debugger;
        window.myMainDrawFN()
        // TODO: re-enable this:
        // this.compositeCanvases();
        // this.applyShaderAndRender();
        // // display the output on the top canvas
        // let outputCanvas = document.getElementById('outputCanvas');
        // let ctx = outputCanvas.getContext('2d');
        // ctx.drawImage(this.topCanvas, 0, 0);
    }
}

// ToastMessage
class ToastNotification {
    message = ''
    options = {}
    get level() {
        return this?.options?.level ?? 'info';
    }
    constructor(message, options){
        this.options = options ?? {}
        this.message = message;
        if(!options?.pinned){
            this.sent_at = Date.now();
            this.leaveTime = this.sent_at + 3000;
            this.destroyTime = this.leaveTime + 1000;
            this.leaveTimer = setTimeout(()=>{
                this.leave();
            },this.leaveTime - this.sent_at)
            this.destroyTimer = setTimeout(()=>{
                this.destroy();
            },this.destroyTime - this.sent_at)
        }
    }
    leave(){
        this.state = 'leaving';
    }
    destroy(){
        this.state = 'destroyed';
        this.options.manager.destroyToast(this);
    }
    importantCloneCount = 0;
    importantCloneAnimationSequenceFrame = 0;
    // drawToast renderToast
    // todo extend Widget?
    // TODO: levels (info, warn, error, success)
    draw(index){
        if(this.state === 'destroyed'){
            return;
        }

        let ctx = deepCanvasManager.uiContext;

        // if it's "important" we step through
        // a one-time animation which clones
        // the message and renders it's clones in a diagonal line towards the center of the screen

        let targetCloneCount = 1;
        let speedFactor = .05; // .1 ~ 10% ~ 2 waves per second 
        if(this.options.important){
            if(this.importantCloneAnimationSequenceFrame < 3000){
                this.importantCloneAnimationSequenceFrame++;

                // use rounded sin wave to define number of clones (int)
                // and their position (float)
                targetCloneCount = Math.abs(Math.round(Math.sin(this.importantCloneAnimationSequenceFrame * speedFactor) * 10));
            }
        }
        this.targetCloneCount = targetCloneCount;
        
        for(let i = 0; i < targetCloneCount; i++){
            // shift the drawing context with each i
            ctx.translate(0, 50);

            this.drawOneInstance(index+i,ctx)
        }
        
    }

    drawOneInstance(index,ctx){
        // NOTE: in here, we're in a translated instance,
        // DONT PUSH IT AWAY!
        //ctx.push()
        ctx.rectMode(CORNER)
        let offsetY = 30 * index;
        let leavingAlpha = this.state === 'leaving' 
            ? (255 - ((Date.now() - this.leaveTime) / (this.destroyTime - this.leaveTime)) * 255)
            : 255;
        leavingAlpha = Math.floor(leavingAlpha);
        ctx.stroke(0, 0, 0, leavingAlpha);
        
        let bubbleColor = color("#2b124a");
        // if this.level === 'success' color should be green
        if(this.level === 'success'){
            bubbleColor = color("darkgreen");
        }else if(this.important){
            bubbleColor = color("darkred");
        }

        const clampedAlpha = Math.min(200, leavingAlpha);
        bubbleColor.setAlpha(clampedAlpha); 
        ctx.fill(bubbleColor);
        
        const tBoxW = 300;
        const cornerRadius = 20;

        ctx.rect(
            windowWidth - 10 - tBoxW, 
            20 + offsetY, 
            tBoxW, 
            100, 
            cornerRadius
        );
        ctx.fill(255, 255, 255, clampedAlpha);

        // string, x, y, lineHeight, fitWidth, ctx
        drawStringWordWrapped(
            this.message,
            windowWidth - tBoxW + 10,
            20,
            40, // line height
            tBoxW - 20,
            ctx
        )

        // darken by the lowest index so shadow effect
        // let shadowEffect = map(index, 0, this.options.important ? this.targetCloneCount : 1, 0, 50);
        // ctx.fill(0, 0, 0, shadowEffect);
        // ctx.rect(windowWidth - 10 - tBoxW, 20 + offsetY, tBoxW, 100, cornerRadius);
        // ctx.alpha(255);

        // ctx.pop();
    }
}


// const Decorate_Autorun = function(baseClass){
    
//     return function(){
//         let extended = new baseClass(...arguments);
//         return extended;
//     }
// }






class FeatureTest_ToastLevels
extends FeatureTest {
    name = "Toasts with Levels Feature"
    scenarios = {
        "Show Toast with specified level": {
            __type: "ScenarioOutline",
            // name: "",
            // steps: {
            given: "A Toast Notification Manager",
            when: "I call the ShowToast method with the level option set to {level}", // <- {level} === variable injected by Examples
            then: "I expect a toast to appear with the {level} level",
            // },
            examples: Object.entries(TOAST_LEVELS)
                .map(([key, value]) => ({ level: value }))
        }
        
    }
}

autorunFeatureTests.push(FeatureTest_ToastLevels);

// AutorunningSelfTest pre-registers the feature definition
// to make sure it runs on startup
// class FeatureTest_Toasts
// extends AutorunningSelfTest(
//     FeatureTest, 
//     ToastFeatureTest
// ) {}

// ToastNotificationManager.toasts = ToastMessage[]
class ToastNotificationManager {
    /**
     * This class is responsible for managing toast notifications.
     * It can create, display, and destroy toast notifications.
     * @type {ToastMessage[]}
     */
    toasts = []
    constructor(){

    }
    get latestToast(){
        return this.toasts.at(-1);
    }
    showSuccess(message, options){
        this.showToast(message, {
            ...options,
            level: 'success'
        })
    }
    showToast(message, options){
        // console.warn('showToast',{message,options})
        // console.warn(`if we're mocking ToastNotificationManager during a test run, we should be able to configure where the toasts are "rendered"`)
        options = options ?? {}
        options.level = options.level ?? 'info'; // DEFAULT_TOAST_LEVEL = 'info'
        let toast = new ToastNotification(message, {
            manager: this, 
            ...options
        });
        // console.warn('showToast',{
        //     message,
        //     options,
        //     _this: this,
        //     this_toasts: this.toasts,
        // })
        this.toasts.push(toast);
        // note, if we don't return anything,
        // the step mapped to this function for automated test coverage,
        // won't know if it should assume success or failure
        return toast;
    }
    dismissLatestToast(){
        // TODO: need to account for the fact that 
        // they need to remain in the list to have their exit animation play
        const popped = this.toasts.pop();
        // TODO: support dismissing a specific toast by id
        return popped;
    }
    destroyToast(toast){
        this.toasts = this.toasts.filter((t)=>{
            return t !== toast;
        })
    }
    draw(){
        this.toasts.forEach((toast,index)=>{
            toast.draw(index);
        })
    }
}

class SetMaxSuggestionsCommandWizardConfig extends Config {
    name = "Set Max Visible Suggestions"
    steps = [
        {
            question: "How many suggestions would you like to see per page?",
            description: "Please answer in a number between 1 and 100",
            answerValidationRules: "required:number:range[1-100]",
        }
    ]
    finalCallback(wizardInstance){
        store.maxVisibleOptionsCount = parseInt(wizardInstance.stepResponses[0].input);
        CmdPromptInput.value('');
        cmdprompt.hide();
        system.get("toastManager").showToast(`Set Max Suggestions: ${store.maxVisibleOptionsCount}`);
    }
}

class SetMaxSuggestionsCommand 
extends BaseCmds(Command, new SetMaxSuggestionsCommandWizardConfig()) {}

const TAGS = {
    RUNS_ON_STARTUP: 'runs_on_startup',
}
class SaveStateToLocalStorageWizardConfig extends Config {

    name = "Save State To Local Storage"
    tags = [TAGS.RUNS_ON_STARTUP]
    // possible to flag a command 
    // as a higher level to be given priority in the boot sequence
    // by default, the boot loader tries to execute all registered boot commands in as parallel a fashion as possible, by using a job queue and a dynamically instanced pool of queue workers
    // which, dynamically scale up both local and remote workers as a commands compute requirements increase
    startupImportanceLevel = 0
    steps = [
        {
            questionTitle: "Saving",
            question: "Saving State To Local Storage...",
            onStepLoaded: async function(wizardInstance){
                console.warn('Literally writing state to local storage as json now..')

                console.warn('Extend any class objects that appear in our store to have a callback available to a function that allows them to override their default stringified version. OnSerialization(value) or something like that...')

                const stringifiedState = JSON.stringify(store);
                localStorage.setItem('state',stringifiedState);

                // then proceed when ready...
                // setTimeout(()=>{
                    wizardInstance.tryCompleteStep();
                // },1000);
            }
        }
    ]

    finalCallback(wizardInstance){
        console.warn('Save State To Local Storage: Final Callback');
        toastManager.showSuccess(`Saved State To Local Storage`);
    }
}

class NewTodoCommand
extends BaseCmds(Command, new TodoWizardConfig()){}

class NewRepeatingTodoCommand
extends BaseCmds(Command, new RepeatingTodoWizardConfig()){}

function hydrateStore(store){
    // need to make sure all the objects in the store are instances of
    // their desired classes
    // if they are plain objects, we hydrate them by passing them as configuration
    // into their respective constructor
    // based on a mapping between a typeName and a typeConstructor
    console.warn('In Progress: hydrate store', {store})
}

// TODO: bind this command to happen on all mutations
class SaveStateToLocalStorage 
extends BaseCmds(Command, new SaveStateToLocalStorageWizardConfig()) 
{}
class LoadStateFromLocalStorageWizardConfig extends Config {
    name = "Load State From Local Storage"
    steps = [
        {
            notice: "Loading State From Local Storage...",
            // need to standardize: [OnSelected, onStepLoaded, execute, callback, finalCallback]
            // we could replace with Promise[when,then,catch,finally]
            onStepLoaded: function(wizardInstance){
                console.warn('Literally Loading State from Local Storage...')
                const stringifiedState = localStorage.getItem('state');
                let parsedState = null;
                try {
                    parsedState = JSON.parse(stringifiedState);
                }catch(e){
                    console.error('Failed to parse state from local storage',{e,stringifiedState});
                }
                parsedState = parsedState ?? {};
                mergeStateFromLocalStorage(parsedState);
            }
        }
    ]
    finalCallback(wizardInstance){
        toastManager.showSuccess(`Loaded State From Local Storage`);
    }
}
class LoadStateFromLocalStorage 
extends BaseCmds(Command, new LoadStateFromLocalStorageWizardConfig()){}

// Mode Switching Commands
class ModeSwitch_SELECT 
extends BaseCmds(Command, {
    name: "Select Mode",
    OnSelect(){
        new SwitchModeCommand(MODES.SELECT).execute();
    }
}){}
class ModeSwitch_ADD_NODE
extends BaseCmds(Command, {
    name: "Add Node Mode",
    OnSelect(){
        new SwitchModeCommand(MODES.ADD_NODE).execute();
    }
}){}
class ModeSwitch_ADD_EDGE
extends BaseCmds(Command, {
    name: "Add Edge Mode",
    execute: function(){
        new SwitchModeCommand(MODES.ADD_EDGE).execute();
    }
}){}
class ModeSwitch_PAN
extends BaseCmds(Command, {
    name: "Pan Mode",
    execute: function(){
        new SwitchModeCommand(MODES.PAN).execute();
    }
}){}
class ModeSwitch_DELETE
extends BaseCmds(Command,{
    name: "Delete Mode",
    callback: function(){
        new SwitchModeCommand(MODES.DELETE).execute();
    }
}){}

const TYPENAME_TO_CONSTRUCTOR_MAP = {
    // Graph related
    Graph,
    GraphNode,
    Edge,
    AddGraphNodeWizardConfig,
    AddGraphNodeCommand,

    // // Household
    // Chore,
    // Bill,

    // // Family
    // Pickup,
    // Dropoff,
    // Appointment,

    // // Work
    // Meeting,
    // Task,
    // Project,
    // Coworker,

    // Todo related
    TodoNode,
    TodoWizardConfig,
    NewTodoCommand,
    RepeatingTodoWizardConfig,
    NewRepeatingTodoCommand,

    // Command related
    Command,
    CommandWizardConfig,
    ShowNewToastCommand,
    StartChatGPTSessionCommand,
    //ShowCmdPromptCommand,
    // HideCmdPromptCommand,
    // ToggleCmdPromptCommand,
    SetCommandIconCommand,

    // Config related
    Config,
    WizardConfig,
    SetMaxSuggestionsCommandWizardConfig,
    SaveStateToLocalStorageWizardConfig,
    LoadStateFromLocalStorageWizardConfig,
    NewToastWizardConfig,

    // Mode related
    ModeSwitch_SELECT,
    ModeSwitch_ADD_NODE,
    ModeSwitch_ADD_EDGE,
    ModeSwitch_PAN,
    ModeSwitch_DELETE,

    // State related
    SaveStateToLocalStorage,
    LoadStateFromLocalStorage,

    // Timer related
    TimerWizardConfig,
};

// similarity is a number between 0 and 1
function levenshteinDistance(a, b) {
    const matrix = [];

    let i;
    for (i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    let j;
    for (j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }

    return matrix[b.length][a.length];
};

// TODO: need to update the z-index of the canvas ui to be ABOVE any iframes
/** @see CmdPrompt.draw */
/** @see CmdPrompt.renderCommandPrompt */
/** @see CmdPrompt.renderSuggestedCommands */
/** @see SuggestionList.draw */
/** @see SuggestionList.drawSuggestedOptions */
/** @see SuggestionList.renderSuggestionOption */
class CmdPrompt extends Widget {
    // the current "Command" being constructed
    currentCommand = null; 
    // the list of available commands
    availableCommands = []; 
    // the list of contextually recommended commands
    filteredCommands = []; 

    toggle(){
        if(store.CmdPromptVisible){
            this.hide();
        }else{
            this.show()
        }
    }
    show(){
        this.showCmdPrompt()
    }
    showCmdPrompt(){
        // Show Command Prompt
        store.CmdPromptVisible = true;

        // focus the command palette input element
        CmdPromptInput.elt.focus();
    }
    hide(){
        this.hideCmdPrompt();
    }
    hideCmdPrompt(){
        store.CmdPromptVisible = false;
        CmdPromptInput.elt.blur();

        // clear the command palette input
        CmdPromptInput.value('');
        // reset the command buffer
        store.commandBuffer = {
            name: ''
        };
        // reset the selectedd  index to 0
        //this.commandSuggestionList.selectedOptionIndex = 0;
        this.selectedSuggestionIndex = 0;
    }

    get visible(){
        return store.CmdPromptVisible;
    }

    getTimeStamp(){
        const currentDateTime = new Date();
        const formattedDate = `${currentDateTime.getMonth() + 1}/${currentDateTime.getDate()}/${currentDateTime.getFullYear()}`;
        const formattedTime = `${currentDateTime.getHours().toString().padStart(2, '0')}:${currentDateTime.getMinutes().toString().padStart(2, '0')}:${currentDateTime.getSeconds().toString().padStart(2, '0')}`;
        return `${formattedDate} ${formattedTime}`;
    }

    afterSetup(){
        // TODO: draw the command prompt instead of using html el
        CmdPromptInput = mctx.createInput('');
        CmdPromptInput.parent(document.body);
        CmdPromptInput.elt.style.backgroundColor = 'transparent';
        CmdPromptInput.elt.style.color = 'white';
        CmdPromptInput.elt.style.zIndex = 9999;
        CmdPromptInput.elt.id = 'cmdprompt-input';
        //CmdPromptInput.class('z-index-9999');
        //CmdPromptInput.elt.style.filter = 'blur(10px)';

        CmdPromptInput.style('border', 'none');


        
        
        CmdPromptInput.attribute('placeholder', `${this.getTimeStamp()}`);

        setInterval(()=>{
            CmdPromptInput.attribute('placeholder', `${this.getTimeStamp()}\n What are you working on? undefined`);
        },350)
        
        CmdPromptInput.style('font-size', '66px');

        CmdPromptInput.size(windowWidth - 20);
        CmdPromptInput.position(10, 130);
        // focus the command palette input
        CmdPromptInput.elt.focus();

        CmdPromptInput.elt.addEventListener('focus', (e)=>{
            // store.focusedField = CmdPromptInput.elt;
            store.focused = true
        })
        CmdPromptInput.elt.addEventListener('blur', (e)=>{
            // store.focusedField = null;
            store.focused = false;
        })
        
        // Listen for the 'keydown' event
        CmdPromptInput.elt.addEventListener('keypress', function(e) {
            // Check if the Enter key was pressed
            // if (e.key === 'Enter') {
                // Call the onCmdPromptInput method
                cmdprompt = system.cmdprompt;
                if(!cmdprompt){
                    system.warn("cmdprompt not ready");
                }
                cmdprompt?.onCmdPromptInput(e);
            // }

            // If you 
        });
    }

    // draw(){
    //     super.draw(...arguments)
    // }

    // use update() instead if you want to ignore draw method culling
    // use beforePhysics or afterPhysics to add artistic control and influence / art-direction over simulations and behaviors at runtime
    onDraw(){
        CmdPromptInput.attribute('placeholder', `${this.getTimeStamp()}`);

        mctx = mainCanvasContext;
        // when visible and being drawn...
        // super.draw() already happened here

        // Draw the command prompt as a 16 bit or 8 bit or even 1 bit input box with chunky rounded borders using squares in a grid layout
        // mctx.push();
        // mctx.strokeWeight(2);
        // mctx.stroke(255);
        // mctx.fill(0);
        // mctx.rectMode(mctx.CENTER);
        // let gridSize = 16; // Change this to 8 or 1 for different bit styles
        // let baseWidth = mctx.windowWidth * .80
        // let baseHeight = mctx.windowHeight * .80
        // let gridWidth = baseWidth / gridSize;
        // let gridHeight = (baseHeight - 130) / gridSize;
        // for (let i = 0; i < gridSize; i++) {
        //     for (let j = 0; j < gridSize; j++) {
        //         mctx.rect(i * gridWidth, 130 + j * gridHeight, gridWidth, gridHeight);
        //     }
        // }
        // mctx.pop();
    }

    registerCommand(
        name,
        description,
        stepText
    ){
        // generate a new command from Wizard responses
        let newCommand = new Command(name, {
            description,
        })
        this.availableCommands.push(newCommand);
        system.get("toastManager").showSuccess(`Registered Command: ${name}`);
    }

    //selectedSuggestionIndex = null;
    get selectedSuggestionIndex(){
        return this.commandSuggestionList.selectedOptionIndex;
    }
    set selectedSuggestionIndex(value){
        this.commandSuggestionList.selectedOptionIndex = value;
    }
    
    constructor(){
        super(...arguments)
        cmdprompt = this;
        this.commandSuggestionList = new SuggestionList();
        this.addDefaultCommands();
        this.commandSuggestionList.bindOnEnterPressed(this.OnPressEnter.bind(this));
        this.commandSuggestionList.bindOnEscapePressed(this.OnPressEscape.bind(this));
        let _this = this;
        this.commandSuggestionList.bindGetFilteredOptions(()=>{
            // console.warn('bound get filtered CMDP',{
            //     len: this.filteredCommands.length,
            //     len2: _this.filteredCommands.length
            // })
            return this.filteredCommands;
        })
        this.commandSuggestionList.bindGetAllOptions(()=>{
            return this.availableCommands;
        })

        
        
    }

    addDefaultCommands(){
        // let cmds = [
        //     "new song",
        //     "new music widget",
        //     "new widget widget",
        //     "widget designer widget",
        // ]
        // cmds.forEach((cmd)=>{
        //     this.availableCommands.push(new Command(cmd))
        // })

        // let cmds2 = [
        //     SoftReloadCommand,
        //     HardReloadCommand,
        // ];
        // cmds2.forEach((cmd)=>{
        //     this.availableCommands.push(new cmd())
        // })
        // EVEN NEWER
        // [
        //     SoftReloadCommand
        // ].forEach((CommandClass)=>{
        //     // Config here should probably be extended to CommandConfig
        //     // and there needs to be special consideration for serializing it
        //     this.availableCommands.push(new Config({
        //         name: CommandClass.name,
        //         type: "CallCommandByStringName"
        //     }))
        // })
        // console.warn("soft reload command",[
        //     SoftReloadCommand
        // ])


        baseCmds.forEach((cmd)=>{
            this.availableCommands.push(cmd);
        })
        // NOTE: need to re-class these
        // we should not be pushing new Command instances i don't think?
        // we should push a lightweight object that can be used to instantiate a Command
        // availableCommands should just be a hashtable, with no
        // real logic or behavior
        // once commands are instanced at call time, we call execute on the instance
        // for now, we've kept the definitions combined since the class instances do have the capability to be lazyily executed,
        // and if the Command definitions are responsible, no big CPU spike
        // will result in registering lots of available commands,
        // but if this becomes and issue, we need a classless, static datatype we can rely on as a replacement for near-zero-over Command availability registration


        // TODO: this should default to a value, but also let you pick a duration
        // this.availableCommands.push(new Command("Start Pomodoro",{
        //     execute: function(){
        //         console.warn("starting pomodoro...");
        //         setTimeout(()=>{
        //             alert('DONE!');

        //         },1000)
        //     }
        // }))

        /* TODO: re-intro as we define these 
        this.availableCommands.push(new Command("New REPL"))
        this.availableCommands.push(new Command("New Sandbox"))
        this.availableCommands.push(new SetMaxSuggestionsCommand());
        this.availableCommands.push(new Command("Help",{
            wizardConfig: new WizardConfig("Help Wizard",{
                // searchable tags
                altnames: ["What is this thing?"],
                steps: [
                    {
                        question: "What would you like help with?",
                        suggestions: [
                            {
                                name: "Commands",
                                value: "commands"
                            },
                            {
                                name: "Graphs",
                                value: "graphs"
                            },
                            {
                                name: "About This App...",
                                value: "show_about_info"
                            }
                        ]
                    }
                ]
            })
        }))
        this.availableCommands.push(new Command("New Timer",{
            wizardConfig: new TimerWizardConfig("New Timer Wizard")
        }))
        
        // this.availableCommands.push(new Command("New Error",{}))
        // this.availableCommands.push(new Command("New Graph",{}))
        // this.availableCommands.push(new Command("New Node Type",{}))
        this.availableCommands.push(new Command("New Requirement",{}))
        this.availableCommands.push(new Command("New FeatureTest",{}))
        this.availableCommands.push(new Command("New SystemTemplate",{}))
        this.availableCommands.push(new Command("New SystemInstance",{}))
        // this.availableCommands.push(new Command("New Enum",{}))
        // this.availableCommands.push(new Command("New Action",{}))
        // this.availableCommands.push(new Command("New Event Type",{}))
        // this.availableCommands.push(new Command("New Storage Field",{}))
        // this.availableCommands.push(new Command("New Class",{}))
        // this.availableCommands.push(new Command("New Command",{
        //     wizardConfig: new CommandWizardConfig("New Command Wizard")
        // }));

        */

        // List Self Tests
        // this.availableCommands.push(new Command("List Self Tests",{
        //     callback: function(){
        //         console.warn('listing self tests...')
        //         system.dump({
        //             FEATURE_TESTS,
        //             autorunFeatureTests,
        //             autorunFeatureTestResults
        //         })
        //     }
        // }))

        // Run Self Test
        // this.availableCommands.push(new Command("Run Self Test",{
        //     keyBindings:[
        //         // {
        //         //     key: "cmd+shift+t",
        //         // }
        //     ],
        //     aliases: [
        //         "/test",
        //         // "/t"
        //     ],
        //     callback: function(){
        //         console.warn('running self test...')
        //         cmdprompt.hide();
        //     }
        // }))
        
        // Clear Graph
        this.availableCommands.push(
            new Command("Clear Graph",{
                keyBindings:[
                    {
                        key: "cmd+shift+c",
                    }
                ],
                aliases: [
                    "/clear",
                    "/c"
                ],
                callback: function(){
                    console.warn('clearing graph...')
                    // TODO: only warn if unsaved changes
                    // if(!confirm('Are you sure?')){
                    //     return;
                    // }
                    store.currentGraph = null;
                    // hide the command palette
                    //cmdprompt.hide();
                    cmdprompt.hide();
                }
            })
        )

        // Load Graph
        this.availableCommands = this.availableCommands.concat([
            // new Command("Toggle Debug Cursor",{
            //     //executeAsString: "window.store.debugCursor = !window.store.debugCursor"
            //     callback: function(){
            //         window.store.debugCursor = !(window.store?.debugCursor ?? false);
            //     }
            // }),


            new Command("Load Graph...",{
                wizardConfig: {
                    name: "Load Graph Wizard",
                    skippable: true,
                    required: false,
                    finalCallback: function(wizardInstance){
                        console.warn('Load Graph Wizard: Final Callback', {
                            t:this,
                            wizardInstance
                        });
                        system.get("toastManager").showToast(`Loaded Graph: ${wizardInstance.stepResponses[0].selectedSuggestionValueOrLabel}`);
                        let prevStepResponse = wizardInstance.stepResponses[0];
                        // it's loading by name / label here instead of value?
                        console.warn("its loading by name instead of value?",
                        {
                            prevStepResponse,
                        })
                        // if the dashboard is un-collapsed, collapse it
                        // TODO: just broadcast an event the dashboard can subscribe to
                        // or raise an event the system can handle
                        system.get("Dashboard").collapse();
                        loadGraph(prevStepResponse.selectedSuggestionValueOrLabel)
                        // close the command palette
                        //cmdprompt.hide();
                        cmdprompt.hide();
                    },
                    steps: [
                        {
                            question: "Which graph would you like to load?",
                            suggestions: [
                                {
                                    name: "Empty Graph",
                                    value: "empty"
                                },
                                {
                                    name: "MVC Example",
                                    value: "mvc"
                                },
                                {
                                    name: "Flux Example",
                                    value: "flux"
                                },
                                {
                                    name: "Ajax Flux Example",
                                    value: "ajaxFlux"
                                },
                                
                            ]
                        }
                    ]
                }
            }),
            //new ShowCmdPromptCommand(),
            //new HideCmdPromptCommand(),
            //new ToggleCmdPromptCommand(),
        ])
    }

    renderCommandPrompt(){
        let ctx = deepCanvasManager.uiContext;
        ctx.push();
        const cmdpPosY = 0;
        ctx.fill(0,0,0,255*.9)
        ctx.strokeWeight(1)
        ctx.stroke("white")
        ctx.rectMode(CORNER);
        ctx.rect(0, cmdpPosY, windowWidth, windowHeight, 20);

        // draw a large text input in the command palette
        ctx.fill(0,0,0,200)
        ctx.strokeWeight(0)
        ctx.stroke("black")
        ctx.rectMode(CORNER);
        ctx.rect(10, cmdpPosY + 10, windowWidth - 20, 100);
        ctx.fill("black")
        ctx.pop();

        // if there's no wizard active,
        // fallback to our default command suggestion list
        if(!store.activeWizard){
            cmdprompt.renderSuggestedCommands();
        }
        
    }

    renderSuggestedCommands(){
        /* pass the drawing responsibility on to the SuggestionList class instance */
        /** @see SuggestionList.draw */
        this.commandSuggestionList.draw(deepCanvasManager.uiContext);
    }

    /*
    renderSuggestedCommands(){
        const offsetY = 100;
        const limit = 10;
        // render the list of the top LIMIT suggestions
        for(let i = 0; i < limit && i < this.filteredCommands.length; i++) {
            let command = this.filteredCommands[i];
            let x = 10;
            let y = offsetY + 10 + (i * 50);
            let w = 200;
            let h = 50;
            let label = command.name;
            let selected = this.selectedSuggestionIndex === i;
            this.renderSuggestedCommand(x,y,w,h,label,selected);
        }
    }
    renderSuggestedCommand(x,y,w,h,label,selected){
        strokeWeight(selected ? 3 : 1);
        // draw box
        fill(selected ? "rgb(255,255,0)" : 255)
        rect(x,y,w,h);
        strokeWeight(1);
        // draw label
        fill(0)
        textAlign(CENTER,CENTER);
        text(label, x + (w/2), y + (h/2));
    }
    */

    // onCmdPromptInput -> filterCommands

    // TODO: need to trigger on backspace TOO!
    onCmdPromptInput(event){
        // shift focus to "deep" canvas 0
        deepCanvasManager.focusedIndex = 0;

        //console.log({event});
        this.processingInputEvent = event

        //console.warn('onCmdPromptInput',{event})
        // update the command buffer
        store.commandBuffer = {
            name: CmdPromptInput.value()
        }

        if(this.currentCommand?.constructor?.name === "Config"){
            // turn it into an executable command instance
            this.currentCommand = new Command(this.currentCommand.config.name,this.currentCommand.config);
        }

        if(this.currentCommand === null){
            this.initCommand();
        }else if(this.currentCommand.updateFromBuffer){
            this.currentCommand.updateFromBuffer();
        }else{
            system.panic(`unknown command type: ${this.currentCommand.constructor.name}`)
        }

        // console.warn(
        //     'OnCmdPromptInput, buffer is now:',
        //     {
        //         currentCommand: JSON.parse(JSON.stringify(this.currentCommand))
        //     }
        // )

        // filter the list of available commands
        this.filterCommands();

        //console.warn('sanity check filtered count: ',this.filteredCommands.length);

        // if the cmd palette is not visible, show it
        if(store.focused && !store.CmdPromptVisible && /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(event.key)){
            //cmdprompt.show();
            cmdprompt.show();
        }

        // if there's an active wizard, we need to handle the input differently
        if(store.activeWizard){
            store.activeWizard.handleWizardInput(event);
            return;
        }

        try{
            this.commandSuggestionList.handleInput(event)
        }catch(e){
            console.error(e)
        }

        
        // console.log({
        //     cb:store.commandBuffer,
        //     fc:cmdprompt.filteredCommands
        // });
    }

    checkDidClickASuggestion(){
        system.todo("cmdprompt: check did click a suggestion")
        return false    
    }

    OnPressEscape(){
        // if there's an active wizard, we need to handle the input differently
        if(store.activeWizard){
            store.activeWizard.OnPressEscape.call(store.activeWizard);
            //return;
        }
        // escape was pressed
        this.hideCmdPrompt()
        
        // need to decide when the current command is deselected
        // --- 
        // this.currentCommand = null;
    }

    OnPressEnter(){

        // system.success("ON PRESS ENTER! we will invoke!",{
        //     // previously selected command
        //     prevCommand: this.currentCommand,
        // })

        // if we have a command selected, mark it as the current command
        if(
            this.selectedSuggestionIndex !== null
            && this.filteredCommands.length
            && this.selectedSuggestionIndex < this.filteredCommands.length
        ){
            if(!this.filteredCommands[this.selectedSuggestionIndex]){
                system.panic("Command Not Found",{
                    index: this.selectedSuggestionIndex,
                })
            }
            if(!this.filteredCommands[this.selectedSuggestionIndex]?.clone){
                this.currentCommand = this.filteredCommands[this.selectedSuggestionIndex];
            }else{
                // clone the command so we don't mutate the original
                this.currentCommand = this.filteredCommands[this.selectedSuggestionIndex].clone();
            }
        }
        console.log('CmdPrompt.OnPressEnter', {
            currentCMDConstructorName: this.currentCommand.constructor.name,
            currentCMDName: this.currentCommand.name,
            selectedSuggIdx: this.selectedSuggestionIndex,
            filteredCommandsLength: this.filteredCommands.length,
            currentCMD: this.currentCommand,
            currentCMDOptions: this.currentCommand.options,
        })
        try{
            // enter was pressed
            // execute the current command
            //this.currentCommand.tryExecute.call(this.currentCommand);
            if(this.currentCommand.__type === "Config"){
                // turn it into an executable command instance
                let cmd = new Command(this.currentCommand.config.name,this.currentCommand.config);
                cmd.tryExecute();
            }else if(typeof this.currentCommand.tryExecute === 'function'){
                this.currentCommand.tryExecute();
            }else{
                system.panic("bad current command!")
            }
        }catch(e){
            console.error("CmdPrompt OnPressEnter Error executing command:",this.currentCommand)
            console.error(e)
        }
        // TODO: step the undo/redo history
        // reset the command buffer
        store.commandBuffer = {
            name: ''
        };
        // hide the command palette
        //store.CmdPromptVisible = false;
        // clear the command palette input
        CmdPromptInput.value('');
        // need to decide when the current command is deselected
        // --- 
        // this.currentCommand = null;
    }

    initCommand(){
        this.currentCommand = new Command();
        this.currentCommand.updateFromBuffer();
    }
    

    // fires on input changed in the command palette...
    // when no wizard is active
    filterCommands(){
        // filter the list of available commands based on the current command buffer
        let recommended_order = [];
        let currentInputBufferText = store.commandBuffer?.name
        // if the last character of string doesn't match
        // the key letter or number or symbol that was just entered,
        // add it to the buffer early:
        // if(
        //     currentInputBufferText.length
        //     && currentInputBufferText.at(-1) 
        //         !== this.processingInputEvent.key
        // ){
        //     // only append the key to the buffer if it's alphanumeric or symbolic
        //     // ignore non-printable key events like Enter, etc...
        //     if (this.processingInputEvent.key.match(/^[0-9a-z]+$/i)) {
        //         currentInputBufferText += this.processingInputEvent.key;
        //     }
        // }
        const currentInputBufferTextLC = (currentInputBufferText??"")?.toLowerCase();

        // URL-Pasting Check
        // if the input contains :// and no spaces, let's assume it's a url and add a suggestion to paste it as an embedded WebObject
        if(currentInputBufferText.includes('://') && !currentInputBufferText.includes(' ')){
            recommended_order.push({
                command: new Command("Embed URL WebObject",{
                    name: `Embed URL: "${currentInputBufferText}"`,
                    execute: function(){
                        //console.warn("TODO: if it was a tweet, make it a fancy iframe!");
                        //system.todo("implement url embeds for various well-known iframe friendly sites which provide a consistent url structure for embedding")
                        console.warn('pasted a url! argument:currentInputBufferText:',currentInputBufferText)

                        // if the url has a //twitter.com || //x.com domain,
                        // embed it as an iframe widget
                        let urlSafeUrl = encodeURIComponent(currentInputBufferText.split('/x.com').join('/twitter.com'));
                        system.registerWidget(new iFrameWidget(`https://twitframe.com/show?url=${urlSafeUrl}`,550,800))
                    }
                })
            })
        }


        // todo: pull available commands from system-wide list
        this.filteredCommands = this.availableCommands.filter(command => {
            if(!command){
                return false;
            }
            let checkName = command?.name;
        
            if(command.__type === "Config"){
                checkName = command?.config?.name ?? checkName
            }
        
            if(!checkName){
                // console.error("checkName failed",{command,checkName})
                return false;
            }
            if(!checkName.toLowerCase){
                console.error('checkName is not a string?', {command,checkName})
                return false;
            }
            let compare = checkName.toLowerCase();
        
            let match1 = compare.includes(currentInputBufferTextLC);
        
            // Allow up to N character differences
            let levDist = levenshteinDistance(compare, currentInputBufferTextLC);
            let levenshteinMatch = levDist <= 5; 
            let levDistanceWeight = 1 - (levDist / 5);

            command.levenshteinMatch = levenshteinMatch;
        
            let matches = 0;
            if(match1){
                matches++;
            }
            if(levenshteinMatch){
                matches+=levDistanceWeight;
            }
        
            if(matches){
                recommended_order.push({
                    command,
                    matches
                })
            }
        
            return 
        });

        let filteredCommandsSorted = recommended_order.sort((a,b)=>{
            return b.matches - a.matches;
        }).map((item)=>{
            return item.command;
        })
        this.filteredCommands = filteredCommandsSorted;

        // if there are no suggestions,
        // add a suggestion at the bottom to have the user define the command!
        this.filteredCommands.push({
            name: `${((!this.filteredCommands.length) ? "No matches. " : "") }New Command: "${currentInputBufferText}"?`,
            execute: function(){
                // call new command wizard
                // NOTE the first step by providing a name
                // and then the wizard will take over
                // and prompt for the rest of the details
                let wiz = new NewCommandWizardConfig()

                // if wiz.start is not a function, system.debug it
                if(typeof wiz.start !== 'function'){
                    system.debug({wiz,NewCommandWizardConfig});
                }

                wiz.start(); // sets store.activeWizard = wiz;
                wiz.programmaticResponseToCurrentStep(currentInputBufferText);
                
            }
        })
        //     new Command({
        //     name: `No matches. New Command: "${currentInputBufferText.split(" ").join("")}"?`
        // }))

        //console.warn('!!! FilteredCommands count:', this.filteredCommands.length);

        const _curSelIndex = this.selectedSuggestionIndex;

        function boundsCheck(index, length){
            // we had selected an index higher than the new length
            return (
                index !== null 
                && index >= length
            ) 
            ||
            // no longer any valid options 
            (
                !length
                && index !== null
            )
        }
        const wasOutOfBounds = boundsCheck(
            // NOTE: make sure this accounts for the new "offset" of the SuggestionList
            _curSelIndex, 
            this.filteredCommands.length
            );

        // clear the selected suggestion index if it's out of bounds
        if(!this.filteredCommands.length){
            this.selectedSuggestionIndex = null;
        }
        else if(
            _curSelIndex !== null 
            && _curSelIndex >= this.filteredCommands.length
        ){
            // set to first available suggestion
            this.selectedSuggestionIndex = 0;
            this.commandSuggestionList.selectionOffset = 0;
        }

        const stillOutOfBounds = boundsCheck(
            this.selectedSuggestionIndex, 
            this.filteredCommands.length);

        // assert we clipped the OOB stuff
        if(wasOutOfBounds && stillOutOfBounds){
            throw new Error('selected suggestion index is still out of bounds. bounds check failed');
        }

        // console.warn('Bounds Check Applied to ', {

        //     _curSelIndex,
        //     vs: this.selectedSuggestionIndex,

        //     filteredLengthCurrently: this.filteredCommands.length,
        // } );
    }
}



class Field {
    makesClass = null; //DefaultFieldConstiuentClass;
    objectPool = [] 
    instancePool = []
    constructor(MyFieldConstituentClass){
        this.makesClass = MyFieldConstituentClass;
    }
}

class FieldView extends Widget {
    // isometric perspective is commonly implemented at:
    // 30 degrees from the horizontal plane
    // 45 degrees from the vertical plane
    // 0 degrees from the depth plane

    modes = ["isometric", "orthographic"]
    renderZModes = ["wireframe","solid","shaded_solid","shaded_wireframe"]
    viewMode = "isometric"

    fieldOfViewAngle = 30;

    showOrientationGrid = true;
    showPerspectiveGrid = true;
    gridOpts = {
        spacing: 50,
        color: "rgba(255,255,255,0.1)",
        strokeWeight: 1,

        // let different segments of the grid have a lighter value indicating a half step
        alternateBrightness: 0.2,

        renderZMode: "wireframe" 
    }

    // currently viewing fields is a cursor into the graph structure
    // it is not the graph structure itself, think of it like a pagination DTO
    // the server guarentees to send information about how many pages remain, what page your on,
    // maybe even configurable options like, how many items per page, sorting, filtering, etc
    // all these adjustable parameters represent a "place" 
        // a specific location within the "Execution space" of the application
        // when we don't define our behaviours thoroughly and consistently, we are doomed to deal with undefined behaviors
        // if we slowly collect and define all the behaviors, we can start to see the patterns and commonalities
        // then, we can create abstractions, simplifications, and common sense defaults to apply (meta-patterns)
        // we can apply these meta-patterns to the pattern itself, and the patterns _it's_ capable of generating
    // 


    switchViewMode(next){ this.viewMode = next }

    draw(){
        super.draw(...arguments);
        // draw the grid
        push()

        //
        // Set grid color
        stroke(this.gridOpts.color);
        strokeWeight(this.gridOpts.strokeWeight);

        // Draw horizontal lines
        for(let i = 0; i < height; i += this.gridOpts.spacing) {
            line(0, i, width, i);
        }

        // Draw vertical lines
        for(let i = 0; i < width; i += this.gridOpts.spacing) {
            line(i, 0, i, height);
        }
        pop()
    }
}
const FieldOf = function(MyFieldConstituentClass){
    let myClass = MyFieldConstituentClass;
    return function(){
        return new Field(myClass)
    }
}

class Star extends Widget {
    //fillColor = "white"
    position = {x:0,y:0,z:0}
    brightness = 255;
    temperature = 5000;
    get fillColor(){
        // return early if we've already memoized the color
        if(this._fillColor){
            return this._fillColor;
        }

        // Convert temperature from Kelvin to RGB
        let temp = this.temperature / 100;
        let red, green, blue;

        // Calculate Red
        red = temp <= 66 ? 255 : Math.max(0, Math.min(255, temp - 60, 329.698727446 * (temp - 60) ^ -0.1332047592));

        // Calculate Green
        green = temp <= 66 ? Math.max(0, Math.min(255, 99.4708025861 * Math.log(temp) - 161.1195681661)) : Math.max(0, Math.min(255, 288.1221695283 * (temp - 60) ^ -0.0755148492));

        // Calculate Blue
        blue = temp >= 66 ? 255 : (temp <= 19 ? 0 : Math.max(0, Math.min(255, 138.5177312231 * Math.log(temp - 10) - 305.0447927307)));

        // return a memoized evaluation of temperature => p5.js color
        return this._fillColor ?? (this._fillColor = color(red, green, blue));
    }
    constructor(){
        super(...arguments)
        // todo: random color temp -> hex color
    }
    draw(){
        super.draw(...arguments);

        // draw a circle
        fill(this.fillColor);
        strokeWeight(0);
        circle(0,0,10);
    }
}

class StarField extends FieldOf(Star){
    // a Field of Stars
    dimensions = {x: 10, y: 10, z: 10}
    // A field for now has 3 dimensions by default
    // other extensions support more

    // in this case we _know_ (are bound) that
    // the field will generate Star-class objects
    // other fields might have / support other Constituents
    objectPool = [
        {
            // built-in state serialization/hydration helper
            // binds to Classname
            // todo look into reading this.makesClass.constructor.name dynamically
            type: "Star", 

            temperature: ()=>{
                // Generate random color temperatures in the range of real stars (3000K - 10000K)
                return Math.random() * (10000 - 3000) + 3000;
            }


        }
    ]
    
    // MaxInstancesPerObjectType int[]
    // 
}



class StarFieldWidget extends Widget {
    get widgetSize(){
        return {
            x: windowWidth,
            y: windowHeight
        }
    }

    // placeholder Class data to be abstracted...
    // this is a "Field" of "Stars"
    stars = []
    maxStars = 100;
    constructor(){
        super(...arguments);

        for(let i = 0; i < this.maxStars; i++){
            this.stars.push(new Star());
        }
    }

    draw(){
        super.draw(...arguments);

    }
}

// while the pan momentum vector magnitude is greater than 0.1
// keep applying the momentum vector to the pan
// otherwise, we stop animating
const STOP_THRESHOLD = 0.001;
function stepPanMomentum(){
    if(
        panMomentumVector.x < STOP_THRESHOLD 
        && panMomentumVector.y < STOP_THRESHOLD
    ){
        panMomentumVector.x = 0;
        panMomentumVector.y = 0;
        return;
    }

    panX += panMomentumVector.x;
    panY += panMomentumVector.y;
    // apply friction
    panMomentumVector.x *= store.panFriction;
    panMomentumVector.y *= store.panFriction;
    requestAnimationFrame(stepPanMomentum);
}



function __checkDidClickAVisibleSuggestion(){

}

function checkDidClickASuggestion(){
    // if a wizard is active, have IT check
    if(store.activeWizard){
        return store.activeWizard.checkDidClickASuggestion();
    }else if(store.CmdPromptVisible){

        // otherwise, only check if the command prompt 
        // is active and has visible suggestions
        return cmdprompt.checkDidClickASuggestion();
    }
    return false;
}

function checkDidClickAModeSwitcherButton(){
    if(!modeSwitcherButtons){
        console.warn('modeSwitcherButtons not ready yet')
        return false;
    }
    // if(!modeSwitcherButtons[store.interactionMode]){
    //     console.error('interaction mode not found',{
    //         available:Object.keys(modeSwitcherButtons),
    //         interactionMode: store.interactionMode
    //     })
    //     return false;
    // }
    // loop through modeSwitcherButtons until we find the one we clicked (if any)
    // todo: we use find instead of forEach cause we want to stop
    // checking when we find the clicked button
    let adjustedMouseX = (mouseX - panX) / zoom;
    let adjustedMouseY = (mouseY - panY) / zoom;
    const entries = Object.entries(modeSwitcherButtons);
    let foundClickedIndex = entries.findIndex(([key,value], index)=>{
        let [x,y,w,h] = value;
        // console.warn('checkDidClickAModeSwitcherButton',{
        //     x,y,w,h,
        //     adjustedMouseX,
        //     adjustedMouseY,
        //     gtX: adjustedMouseX > x,
        //     ltX: adjustedMouseX < x + w,
        //     gtY: adjustedMouseY > y,
        //     ltY: adjustedMouseY < y + h,
        // })
        if(
            adjustedMouseX > x 
            && adjustedMouseX < x + w 
            && adjustedMouseY > y 
            && adjustedMouseY < y + h
        ){
            return true;
        }
        return false;
    });
    if(foundClickedIndex !== -1){
        let found = entries[foundClickedIndex][0];
        store.interactionMode = found;
    }
    return foundClickedIndex !== -1 ? true : false;
}



const max_blur = 100;
let bgEl;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
zoomStepSize = (MAX_ZOOM - MIN_ZOOM) / 8;

const DefaultKeyBindings = {
    "cmd+/": "ToggleCommandPromptCommand",
    "-": {
        // need to make sure no elements are focused
        // otherwise, ignore
        zeroFocus: true,
        calls: "StepZoomOutCommand"
    },
    "=": {
        // this should be opt-out
        zeroFocus: true,
        calls: "StepZoomInCommand" 
    }
}

// cursor debugger
// debug cursor
// debugcursor
class DebugPath {
    points = []
    constructor(){
    }

    averageWindowOffset = 0
    averageWindowSize = 9
    averageIfDistSmallerThan = 50

    stepPruner(){
        this.averageNearbyPoints();
    }

    averageNearbyPoints(){
        // if we don't have enough points to average, bail
        if(this.points.length < this.averageWindowSize){
            return;
        }

        // if the oldest point is older than 3 seconds, remove it
        // if(Date.now() - this.points[0].t > 3000){
        //     this.points.shift();
        // }

        // if the averageWindowOffset + the avgWinSize extends beyond the bounds of the points,
        // reset it back to the beginning
        let points = this.points.slice(this.averageWindowOffset, this.averageWindowOffset + this.averageWindowSize);
        let avgX = 0;
        let avgY = 0;
        let avgZ = 0;
        let avgT = 0;
        let avgA = 0;
        for(let i = 0; i < points.length; i++){
            avgX += points[i].x;
            avgY += points[i].y;
            avgZ += points[i].z;
            avgT += points[i].t;
            avgA += points[i].a;
        }
        avgX /= points.length;
        avgY /= points.length;
        avgZ /= points.length;
        avgT /= points.length;
        avgA /= points.length;
        if(Math.sqrt(Math.pow(avgX - this.points[this.points.length - 1].x, 2) + Math.pow(avgY - this.points[this.points.length - 1].y, 2)) < this.averageIfDistSmallerThan){
            // Remove the points that are being averaged / combined
            this.points.splice(this.averageWindowOffset, this.averageWindowSize);
            // Add the new averaged point
            this.points.push({x: avgX, y: avgY, z: avgZ, t: avgT, a: avgA});
        }
        // step the window
        this.averageWindowOffset++;
        // if we've stepped the window beyond the bounds of the points,
        // reset it back to the beginning
        if(this.averageWindowOffset > this.points.length){
            this.averageWindowOffset = 0;
        }
    }

    addPoint(x,y,z){
        // if the most recent point is nearby, don't bother
        // adding a new point
        if(this.points.length){
            let lastPoint = this.points[this.points.length - 1];
            if(
                Math.abs(lastPoint.x - x) < 10
                && Math.abs(lastPoint.y - y) < 10
            ){
                return;
            }
        }
        this.points.push({x,y,z,t:Date.now(),a:255});
        // prune as we add points
        //this.stepPruner();
    }

    // todo convert to Widget and use onDraw
    draw(_color){
        // disable ze gizmo
        if(!store.showDebugCursor){
            return;
        }
        this.stepPruner();
        let ctx = deepCanvasManager.uiContext;
        ctx.push()
        ctx.translate(
            -1 * (windowWidth/2 + panX), 
            -1 * (windowHeight/2 + panY)
        );
        ctx.scale(zoom, zoom);
        let adjustedLineColor = color("red");
        for(let i = 0; i < this.points.length - 1; i++) {
            if(this === DebugPathInstance){
                adjustedLineColor = color("orange")
            }else{
                adjustedLineColor = color("blue")
            }

            // based on the points age, trend it's .a alpha to 0
            this.points[i].a = map(Date.now() - this.points[i].t, 0, 3000, 255, 0);
            adjustedLineColor.setAlpha(this.points[i].a);

            ctx.stroke(adjustedLineColor);
            ctx.strokeWeight(3);
            ctx.line(
                this.points[i].x, 
                this.points[i].y,
                this.points[i+1].x, 
                this.points[i+1].y
            );
        }
        ctx.pop()
    }
}
const DebugPathInstance = new DebugPath();
const DebugPathTwo = new DebugPath();

// we cache key bindings => methods in here for fast lookup
// since we use magic strings for static configuration
const runtimeKeymapLookup = {}

let zoomChanged = false;

// User defined input mappings handle routing input to UI feedback.
// This is fully customizable at runtime.
const InputSourcesAndDrains = [
    "WheelDelta", "WheelDeltaX", "WheelDeltaY",
    "MouseX", "MouseY", "MouseDraggedX", "MouseDraggedY",

    // drains
    "PanX", "PanY", "zoom"
]
// we check for startswith neg to flip sign on the value
const InputMap = {
    wheel: {
        delta: "null",
        deltaX: "negPanX",
        deltaY: "zoom",
    }
}

const sprites = [];
class Sprite {
    x = 0; 
    y = 0;
    radius = 20;
    blur = 2;
    // render to the back layer of the "deep canvas"
    deepCanvasID = -1;
    drawSimple(){
        fill(this.getRelativeColor())
        let scaledRad = this.radius * zoom * (50 - this.z / 100);
        const {x,y} = this.getRelativePosition()
        ellipse(x, y, scaledRad, scaledRad);
    }
    getRelativePosition(){
        // apply parallax based on depth
        // impart pan and zoom to the sprite as well
        let x = this.x + panX * (1 / this.z) * zoom;
        let y = this.y + panY * (1 / this.z) * zoom;

        // NOTE: we need to give the illusion of a lens, so we want outside to move faster than inside relative to the center of the viewport (this gives the illusion of a wider field of view)
        // x += (windowWidth / 2) * (1 - (1 / this.z)) * zoom;
        // y += (windowHeight / 2) * (1 - (1 / this.z)) * zoom;
        return {x,y}
    }
    getRelativeColor(){
        // let startColor =  color(0, 0, 255); // Blue
        // let middleColor = color(255, 255, 0); // Yellow
        // let endColor = color(255, 0, 255); // Pink

        let startColor =  color("#9b59b6"); // Desaturated Purple
        let middleColor = color("#8e44ad"); // Deep Purple
        let endColor = color("#663399"); // Aesthetic Purple

        // Normalize the z value to a range between 0 and 1
        if(this.z < store.minZ){
            store.minZ = this.z;
        }
        if(this.z > store.maxZ){
            store.maxZ = this.z;
        }
        let normalizedZ = map(this.z, store.minZ, store.maxZ, 0, 1);
        if(Number.isNaN(normalizedZ)){
            normalizedZ = 0;
        }

        // if(Number.isNaN(normalizedZ)){
        //     console.error({
        //         z: this.z,
        //         minZ: store.minZ,
        //         maxZ: store.maxZ,
        //         normalizedZ
        //     })
        //     throw new Error("bad normalizedZ")
        // }

        // Use lerpColor to interpolate between the start, middle, and end colors based on z
        let gradientColor;
        if (normalizedZ < 0.5) {
            gradientColor = lerpColor(startColor, middleColor, normalizedZ * 2);
        } else {
            gradientColor = lerpColor(middleColor, endColor, (normalizedZ - 0.5) * 2);
        }
        return gradientColor;
    }
    draw(){
        // draw a circle
        if(!store.cachedSprite){
            // draw a circle to an offscreen buffer,
            // blur it
            // cache the blurred sprite for future use
            store.cachedSprite = createGraphics(100,100);
            store.cachedSprite.strokeWeight(0);
            //store.cachedSprite.fill("red")
            // center mode: center
            store.cachedSprite.ellipseMode(CENTER);
            store.cachedSprite.ellipse(this.radius,this.radius, this.radius, this.radius);
            store.cachedSprite.filter(BLUR, this.blur);
        }

        const {x,y} = this.getRelativePosition()

        // if we're out of viewports bounds, don't draw
        if(
            (x < 0 && y < 0)
            || (x > windowWidth * zoom && y > windowHeight * zoom)
        ){
            return;
        }

        // scale the sprite based on z depth
        let scale = map(1 / this.z, 0, 1, 1, 30);
        // tint the image based on a gradient based on depth (nearer, bluer, mid white, far red)
        // Define the start and end colors of your gradient
        let gradientColor = this.getRelativeColor()

        let drawTarget = this.deepCanvasID === -1 ? deepCanvasManager.canvases[0] : mctx;
        deepCanvasManager.canvasSettings[0].clearFlag = 0; // disable clear

        if(store.disableDeepCanvas){
            // force back onto the main canvas
            drawTarget = mctx;
        }

        // Apply the gradient color
        drawTarget.tint(gradientColor);
        drawTarget.image(
            store.cachedSprite, 
            x, y, 
            store.cachedSprite.width * scale, 
            store.cachedSprite.height * scale
        );
        drawTarget.noTint(); // reset tint
        
    }
}

let oldZoom = zoom;


function updateBlur(){
    const minBlur = 10;
    const maxBlur = 100;
    const blur = mctx.map(zoom, MIN_ZOOM, MAX_ZOOM, minBlur, maxBlur)
    bgEl.style.filter = `blur(${blur}px)`;
}



// Define the deleteSelectedNode function
function deleteSelectedNode() {
    console.warn('TODO: put this in Graph class');
    // if (selectedNode !== null) {
    //     this.edges = this.edges.filter(edge => edge.from !== selectedNode && edge.to !== selectedNode);
    //     this.nodes.splice(selectedNode, 1);
    //     selectedNode = null;
    // }
}

let mouseShifted = {
    x: 0,
    y: 0
}

const ImplementationOf = function(things){
    return function(){
        // The fact you can "decorate" Classes with other Classes
        // graphed on the axis of : cool, scary, confusing, useful
        // most ideas chart a course through that plane

        return new Implementer(things).postConstructor();
    }
}
class Interface {
    get name(){
        return this.constructor.name + " Interface"
    }
}
class DraggableInterface extends Interface {

}
class DrawableInterface {

}
class ResizableInterface {

}
class SelectableInterface {

}
class TabbableInterface {

}
class SortableInterface {

}
class SortingContextInterface {

}
class TodosInterface {

}
const WidgetInterface = function(classConstructor){
    let backingWidget = new Widget();
    return class extends classConstructor {
        proveIsWidget(){
            alert("yuuuup i'm a widget!")
        }
        setTargetPosition(x,y){
            return backingWidget.setTargetPosition(x,y);
        }
        render(){
            return backingWidget.render();
        }
    }
}



// MethodGroups, Mixins, Decorators, Interfaces, Traits, etc...
// It's like a way of "tagging" a class,
// like [Attributes]
const Interfaces = {
    "Draggable": DraggableInterface,
    "Drawable": DrawableInterface,
    "Resizble": ResizableInterface,
    "Selectable": SelectableInterface,
    "Tabbable": TabbableInterface,
    "Sortable": SortableInterface,
    "SortingContext": SortingContextInterface,
    "Todos": TodosInterface,
    "Widget": WidgetInterface,
}
// TODO: make all methods chainable by default
// make it opt out
class Implementer {
    /*
    ["Todos",{configurableImplementations: true}],
    ["Todos",[/* Webpack Style *-/"FlexibleArguments"]]
    */
    constructor(ArrayOfInterfaces){
        this.interfaces = ArrayOfInterfaces;
        // this.interfaces.forEach((trait)=>{
        //     if(!window?.Interfaces?.[trait]){
        //         throw new Error("Interface not found: " + trait);
        //     }
        //     this.___rawInstance = window?.Interfaces[trait](this);
        // })
        return this; // chainable
    }
    // "applyMixins"
    postConstructor(){
        // loop over the mixin instances and...
        // well... mix them in
        this.interfaces.forEach((trait)=>{
            if(!Interfaces?.[trait]){
                throw new Error("Interface not found: " + trait);
            }
            // hot-swap wrapped instance with the mixed-in version
            this.__instance = Interfaces[trait](this.constructor);
        })
        return new this.__instance; // chainable
    }
}


// class MiniMapWidget extends ImplementationOf([
//     "Widget",
//     // PinnedWidget, Pinnable
    
//     // // Draggable/Droppable
//     // "Draggable",
//     // // register for draw callback
//     // "Drawable",
//     // // implements common handlers
//     // // and callbacks hooks
//     // // for objects in SortingContexts 
//     // "Sortable",
//     // // ["Todos",{
//     // //     configurableImplementations: true
//     // // }],
//     // // ["Todos",[
//     // //     /* Webpack Style */
//     // //     "FlexibleArguments"
//     // // ]]
// ]) {
class MiniMapWidget extends Widget {
    widgetSize = {
        width: 300,
        height: 300
    }
    pinned = true
    // top left for now
    // TODO: let the user move it
    fixedPosition = {
        x: 0,
        y: 0
    }
    onDraw(){
        super.onDraw();

        this.ctx.strokeWeight(3);
        this.ctx.stroke(255,0,0);
        this.ctx.fill(20);

        // pinned
        this.ctx.rect(
            this.fixedPosition.x,
            this.fixedPosition.y,
            this.widgetSize.width,
            this.widgetSize.height
        )
        //this.endDraw()
    }
}

class GraphViewer extends ImplementationOf([
    "Drawable",
    "Draggable",
    "Resizable",
    "Selectable",
    "Tabbable"
]) {
    
}

function handleAnalogStickInput(){
    // Calculate the distance of the mouse position from the center
    let distanceFromCenter = Math.sqrt(Math.pow(mouseX - windowWidth / 2, 2) + Math.pow(mouseY - windowHeight / 2, 2));

    // apply a scaling factor to the distance as Gain
    distanceFromCenter *= store.tStickGain;

    // filter the signal so it drops to 0 near the center (deadzone)
    distanceFromCenter = distanceFromCenter < store.tStickDeadzone ? (distanceFromCenter - store.tStickDeadzone) * store.tStickGain : distanceFromCenter;
    
    // Calculate the direction of the momentum
    let directionX = (mouseX - windowWidth / 2) / distanceFromCenter;
    let directionY = (mouseY - windowHeight / 2) / distanceFromCenter;
    
    // Calculate the momentum based on the distance from the center, with a maximum value
    let momentumX = Math.min(distanceFromCenter * Math.abs(directionX), store.maxThumbstickMomentum);
    let momentumY = Math.min(distanceFromCenter * Math.abs(directionY), store.maxThumbstickMomentum);
    
    // Update the thumbstick position
    store.thumbstickPosition.x += directionX * momentumX;
    store.thumbstickPosition.y += directionY * momentumY;
    
    // Add the current reading to the thumbstick readings and calculate the average
    store.thumbstickReadings.push({x: store.thumbstickPosition.x, y: store.thumbstickPosition.y});
    if (store.thumbstickReadings.length > 10) store.thumbstickReadings.shift();

    // update the average thumbstick reading
    store.averageThumbstickReading.x = store.thumbstickReadings.reduce((sum, reading) => sum + reading.x, 0) / store.thumbstickReadings.length;
    store.averageThumbstickReading.y = store.thumbstickReadings.reduce((sum, reading) => sum + reading.y, 0) / store.thumbstickReadings.length;

    // Update the thumbstick position with the momentum
    store.thumbstickPosition.x += store.thumbstickMomentum * directionX;
    store.thumbstickPosition.y += store.thumbstickMomentum * directionY;

    store.thumbstickMomentumX = momentumX;
    store.thumbstickMomentumY = momentumY;
    
    // Apply the decay factor to the thumbstick momentum
    store.thumbstickMomentumX *= store.tStickMomentumDecay;
    store.thumbstickMomentumY *= store.tStickMomentumDecay;

    // influence pan: store.averageThumbstickReading
    // panX += store.averageThumbstickReading.x * store.thumbstickMomentumX;
    // panY += store.averageThumbstickReading.y * store.thumbstickMomentumY;
}






let FPS;
let frameTimes = [];
let lastFrameTime;
const getCurrentDebugTexts = function(){
    return [
        { text: `FPS: ${FPS.toFixed(2)}` },
        { text: `current widget count ${Object.keys(system.dashboard.widgets).length}` },
        { text: `DrawCalls: ${store.frameDrawCount}` },
        { text: `center:{x:${whatTheCenterIs.x.toFixed(2)},y:${whatTheCenterIs.y.toFixed(2)}}` },
        // todo: zoom momentum / z-momentum
        { text: `panMomentumVector: ${panMomentumVector.x.toFixed(2)}, ${panMomentumVector.y.toFixed(2)}` },
        { text: `xy: ${panMomentumVector.x.toFixed(2)}, ${panMomentumVector.y.toFixed(2)}` },
        // { text: `thumbstick: ${store.thumbstickMomentumX.toFixed(2)},${store.thumbstickMomentumY.toFixed(2)}` },
        { text: `scaleFactor ${store.pinchScaleFactor.toFixed(2)}` },
    
        {
            text: `Touch Inputs: ${store.touchInputs.length}`,
        },
    
        {
            text:`fov ${fov}`
        },
        { text: `focusedIndex ${deepCanvasManager.focusedIndex}`},
        { text: `deepRendererEnabled? ${!store.disableDeepCanvas}`}
    ]
};

function renderDebugUI(){

    if(!store.showDebugCursor){
        return;
    }

    let ctx = deepCanvasManager.uiContext;
    // push into rolling frameTimes array
    frameTimes.push(millis());
    // if we have more than 100 frames, remove the oldest one
    if(frameTimes.length > 100){
        frameTimes.shift();
    }
    // update FPS average
    FPS = 1000 / ((frameTimes[frameTimes.length - 1] - frameTimes[0]) / frameTimes.length);
    // draw FPS in red text
    ctx.fill(255, 0, 0);
    ctx.textSize(16);
    ctx.textAlign(RIGHT, BOTTOM);
    //debugstats
    
    const debugTexts = getCurrentDebugTexts();

    ctx.textSize(30);
    let baseOffset = ctx.textSize();
    let offset = 60;
    debugTexts.forEach((debugText) => {
        ctx.fill("red");
        ctx.stroke("black");
        ctx.strokeWeight(3);
        ctx.text(
            debugText.text, 
            windowWidth - ctx.textSize(), 
            windowHeight - offset);
        offset += baseOffset;
    });

    if(store.debugUI_DISABLED){
        return;
    }

    // draw the status lights
    Object.entries(store.status_lights).forEach(([key,light])=>{
        light.draw(ctx);
    });



    // Check if the text color is blending with the background color
    // If so, change the fill color
    ctx.fill(255, 255, 255);
    // Ensure the text size is large enough to be visible
    ctx.textSize(16);
    ctx.textAlign(RIGHT, BOTTOM);
    // Render text that lists the current zoom, panX, panY
    ctx.text(
        `zoom: ${(zoom??0).toFixed(2)} panX: ${panX.toFixed(2)} panY: ${panY.toFixed(2)}`, 
        windowWidth - 20, 
        windowHeight - 10);
    // render red text that shows the current interaction mode
    ctx.fill(255, 0, 0);
    ctx.text(
        `interaction mode: ${store.interactionMode}`, 
        windowWidth - 20, 
        windowHeight - 30);
}

let modeSwitcherButtons = {};

class GraphEvent {
    flowIndex = null
    timerId = null
    stage = null
    positions = []

    constructor(options){
        this.options = options ?? {}
    }

    // TODO: what's a way we can encapsulate the pattern
    // of unwrapping "options" to point to getters and private-backed
    // instance variables (internal state) ?
    // We could do something like Object.keys(this.options).forEach(key => {
    //     Object.defineProperty(this, key, {
    //         get: function () { return this.options[key]; },
    //         set: function (value) { this.options[key] = value; }
    //     });
    // then we wouldn't need to define these getters by hand
    // and we could introduce meta tags for excluding certain keys
    get key () { return this.options?.key; }
    get keyCode () { return this.options?.keyCode; }
    get valueAtEventSent () { return this.options?.valueAtEventSent; }
    get parentGraph () { return this.options.parentGraph; }

    update(){
        this.progress += 0.02;
        if (this.progress > 1) {
            this.progress = 0;
            if (this.flowIndex + 1 < this.parentGraph.eventFlow.length) {
                this.flowIndex++;
            } else {
                let index = this.parentGraph.events.indexOf(event);
                if (index > -1) {
                    store.events.splice(index, 1);
                    return;
                }
            }
            let stage = this.parentGraph.eventFlow[this.flowIndex];
            let delay = stage.delay || 0;
            if(!this.timerId){
                this.timerId = setTimeout(() => {
                    if (Array.isArray(stage.to)) {
                        // If there's a fork, 
                        // create new events for each target node
                        stage.to.forEach(to => {
                            let newEvent = { 
                                ...event, 
                                stage: { from: stage.from, to: to } 
                            };
                            // todo: add a Graph@addEvent method
                            this.parentGraph.events.push(new GraphEvent(newEvent));
                        });
                    } else {
                        // If there's no fork, just update the stage of the current event
                        this.stage = stage;
                    }
                    this.timerId = null;
                }, delay);
            }
        }
    }

    getEventPositions(){
        if(!this){
            throw new Error('event no longer exists');
        }
        if(this.flowIndex === null || this.flowIndex === undefined){
            console.warn('event has no flowIndex?',{event});
            return [[0,0]];
        }
        let {fromNode,toNodes} = nodesForFlowIndex(this.flowIndex);
        if(!fromNode || !toNodes?.length){
            console.warn('event stage has no from/to nodes?',{event})
            return [[0,0]];
        }
    
        let positions = toNodes.map(toNode => {
            let edgeFrom = store.edges.find(edge => edge.from === fromNode.id && edge.to === toNode.id);
            let edgeTo = store.edges.find(edge => edge.to === toNode.id && edge.from === fromNode.id);
            let x1 = fromNode.x + (edgeFrom ? edgeFrom.fromAnchor.x : 0);
            let y1 = fromNode.y + (edgeFrom ? edgeFrom.fromAnchor.y : 0);
            let x2 = toNode.x + (edgeTo ? edgeTo.toAnchor.x : 0);
            let y2 = toNode.y + (edgeTo ? edgeTo.toAnchor.y : 0);
            let x = map(this.progress, 0, 1, x1, x2);
            let y = map(this.progress, 0, 1, y1, y2);
            return [x, y];
        });
    
        return positions;
    }

    drawEvent() {
        // the event can split into multiple events at runtime 
        // when reaching certain points in the graph
        // NOTE: actually it spawns a new event,
        // so there should only be 1 position per event now
        // we'll get back to that as our refactor continues...
        this.positions = this.getEventPositions(); 
        for(var i=0;i<this.positions.length;i++){
            let [x,y] = this.positions[i];
            this.drawEventAt(x,y);
        }
    }
    
    drawEventAt(x,y){
        console.warn('drawEventAt',{x,y,eventObj:this})
        fill(this.key === 'backspace' ? color(255,0,0) : 255); // Change 0 to 255
        ellipse(x, y, 30, 30);
        fill(this.key === 'backspace' ? color(255,255,255) : 0);
        text(this.key === 'backspace' ? '←' : this.key, x, y);
    }
}

function drawModeSwitcher(){
    let i = 0;
    Object.entries(MODES).forEach(([key,value], index)=>{
        //console.warn('drawModeSwitcher',{key,value,index})
        let x = 10 + (i * 100);
        let y = windowHeight - 60;
        let w = 100;
        let h = 50;
        let label = value;
        let selected = store.interactionMode === key;
        drawModeSwitcherBox(x,y,w,h,label,selected);
        // record dimensions for our click test
        modeSwitcherButtons[key] = [x,y,w,h];
        i++;
    });
}

function drawModeSwitcherBox(x,y,w,h,label,selected){
    strokeWeight(selected ? 3 : 1);
    // draw box
    fill(255)
    rect(x,y,w,h);
    // draw label
    fill(0)
    textAlign(CENTER,CENTER);
    text(label, x + (w/2), y + (h/2));
}

// Define the ensureHeadTag function
function ensureHeadTag(){
    var metaTag=document.createElement('meta');
    metaTag.name = "viewport";
    metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
    document.getElementsByTagName('head')[0].appendChild(metaTag);
}

let CmdPromptInput = null;

const CustomFeatureTestDecorator = (BaseClass, definition) => {
    i = null;
    // set the constructor to a dynamic name :D
    var Constructor = new Function("return function " + definition.name + "() { };")();
    // this is kind of like Class.bind to bind some arguments
    // to a class we want to instantiate later
    return function(){
        this.i = new Constructor(definition);
        return this.i;
    }
}

const BUILT_IN_FACTORIES = {
    "CustomCommandFactory": CustomCommandFactory,
    // TODO: normalize or rename FeatureDescrtiption -> FeatureTest 
    "FeatureTest": FeatureTest,
}

// provides singleton at an expected key location
// e.g. "A Toast Notification Manager" => system.get('toastManager') 
const givenLookupTable = {}
const mapGiven = (name, callback)=>{
    givenLookupTable[name] = callback;
}
const whenLookupTable = {}
const mapWhen = (name, callback)=>{
    whenLookupTable[name] = callback;
}
const thenLookupTable = {}
const mapThen = (name, callback)=>{
    thenLookupTable[name] = callback;
}

/**
 * currently unclassed test runner while we do first logical pass
 * will refactor into a class later
 * @param {*} FeatureTestConfigOrInstance 
 */
const runFeatureTest = (FeatureTestConfigOrInstance)=>{
    const shape = typeof FeatureTestConfigOrInstance === 'function' 
        ? "class" //FeatureTestConfigOrInstance
        : typeof FeatureTestConfigOrInstance === 'string'
            ? "string" //FeatureTestConfigOrInstance
            : "object" //Object.keys(FeatureTestConfigOrInstance)
    
    //console.warn("runFeatureTest: Input Type: ", shape)

    // FIRST: do any necessary JSON parsing

    // decode string json to js object that we can build an instance from
    if(typeof FeatureTestConfigOrInstance === 'string'){
        try{
            FeatureTestConfigOrInstance = JSON.parse(FeatureTestConfigOrInstance);
        }catch(e){
            console.error('failed to parse self test definition as JSON',{
                FeatureTestConfigOrInstance
            })
        }
    }
    // NOTE: we still need to do an extra step to hydrate JSON string -> obj -> class instance

    // END JSON PARSING STAGE

    if(Array.isArray(FeatureTestConfigOrInstance)){
        // if there is a non-string value in the array, panic? (What about Numbers?)
        let covertedToFeatDef = FeatureTest.fromArrayOfStrings(FeatureTestConfigOrInstance);
        // swap the check value to our "class-corrected" array of strings
        // this handles munging the input from:
        // INPUT: ["given ... ", "when ... ", "then ... "]
        // OUTPUT: {scenarios:{given:...,when:...,then:...}}
        FeatureTestConfigOrInstance = covertedToFeatDef;
    }



    // if FeatureTestConfigOrInstance is not a constuctor, 
    // we need to hydrate an instance using the provided definition
    let featDescClassToInstance = FeatureTestConfigOrInstance;
    let instance = null;
    if(typeof FeatureTestConfigOrInstance === 'object'){
        // rename variable locally for clear code
        const featDef = FeatureTestConfigOrInstance;
        let {
            __type,
            __targetType,
            name,
            constructorArgs
        } = featDef;
        if(!constructorArgs){
            constructorArgs = [];
        }
        if(!name){
            system.panic("missing name for "+featDef.name)
        }
        if(typeof __type === 'undefined' && Object.keys(featDef?.scenarios ?? {}).length){
            system.dump("featDef",{featDef})
            // it's something we can just instantiate directly
            instance = featDef;
        }else{   
            // we're probably instantiating a FeatureTest right now...
            console.warn('attempting to generate instance',{
                __type,
                __targetType,
                args: constructorArgs
            })
            // making sure to forward the pre-defined constructor args...
    
            console.warn(`should we be making ${__type} or ${__targetType}?`)
            if(BUILT_IN_FACTORIES[__type]){
                instance = new BUILT_IN_FACTORIES[__type](...constructorArgs);
            }
        }

    }else if(typeof FeatureTestConfigOrInstance === 'function'){
        instance = new featDescClassToInstance({
            name: featDescClassToInstance.name,
            scenarios: featDescClassToInstance.scenarios
        });
    }else if(typeof FeatureTestConfigOrInstance === 'string'){
        system.panic("should've handled string decoding earlier!")
    }else{
        system.dump("unrecognized self test definition type: ",FeatureTestConfigOrInstance)
        system.panic(`unrecognized self test definition type: ${typeof FeatureTestConfigOrInstance}`)
    }

    console.warn(
        //'(TODO: parallelize)',
        {
            autoTesting: instance.constructor.name + ": " + instance.name,
            instanceConstructorName: instance.constructor.name,
            instanceName: instance.name,
            instance
        }
    )

    // register any given/when/then callbacks from the instance
    // neat how one feature test can register multiple callbacks
    // and then other downstream features can use them :D
    if(instance.givenMap){
        Object.entries(instance.givenMap).forEach(([name, callback])=>{
            givenLookupTable[name] = callback;
        })
    }
    if(instance.whenMap){
        Object.entries(instance.whenMap).forEach(([name, callback])=>{
            whenLookupTable[name] = callback;
        })
    }
    if(instance.thenMap){
        Object.entries(instance.thenMap).forEach(([name, callback])=>{
            thenLookupTable[name] = callback;
        })
    }

    // if the scenarios are in "array of strings" format,
    // i.e, not in object format, 
    // we need to pre-parse them using the static FeatureTest.fromArrayOfStrings method
    let scenariosAreArrayOfStrings = typeof Object.entries(instance?.scenarios ?? {})[0][0] === 'string';
    console.warn({
        "imLookingForAnArrayOfStrings": instance,
        scenariosAreArrayOfStrings,
    })
    if(scenariosAreArrayOfStrings){
        instance = FeatureTest.fromDenormalizedFeatureDefinition(instance);
    }


    // TODO: see about passing objects instead of class instances
    const parser = new GFDParser(instance);
    const gherkinSeq = parser.parse();
    const executor = new GherkinSequenceExecutor(gherkinSeq,{
        givenMap: givenLookupTable,
        whenMap: whenLookupTable,
        thenMap: thenLookupTable,
    });
    const results = executor.execute();
    autorunFeatureTestResults.push({
        // feature name
        name: instance.name,
        // feature description
        description: instance.description,
        // FeatureTest
        test: instance,
        // results of the execution
        results,
        executor
    });
}

const getBasicSpawnWidgetConfig = function(widget){
    return new Config({
        name: `Spawn Widget: ${widget.name}`,
        description: `Spawns a new ${widget.name} widget`,
        // action: ()=>{}
        execute: ()=>{
            system.registerWidget(widget.name, new widget());
        }
    })
}


// Define the setup function
/** 
 * @class LayereredCanvasRenderer 
 * @see LayereredCanvasRenderer
 * @see LayereredCanvasRenderer.draw
*/
let deepCanvasManager;// = new LayereredCanvasRenderer();
function setupDefaults(){
    // assign a random time to the query params so hard reload is by default
    // this is useful for testing
    // assign a random time to the query params so hard reload is by default
    // this is useful for testing
    let params = new URLSearchParams(window.location.search);
    params.set('time', Math.random());
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);

    // like store.DISABLE_PARALLAX for example
    BasicBools.forEach((boolName)=>{
        console.warn('adding basic bool toggle cmd for boolName: '+boolName)
        // expose a toggle command for most basic bools in the store
        // TODO: loop over definitions and infer from types what commands to expose

        let cmdName = `Toggle ${boolName}`
        baseCmds.push(new Config({
            name: cmdName,
            execute(){
                store[boolName] = !store[boolName];
            }
        }))
    })

    

    // NEW InvokableCommands => baseCmds => availableCommands
            // availableCommands => filteredCommands
            // filteredCommands => selectedCommand
    // define in a config object
    Object.entries(InvokableCommands).forEach(([key, def])=>{
        let cmdName = key.split(' ')
        .map((word, index) => index === 0 
            ? word 
            : word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        const machineizedCmdName = machineize(key);
        // console.warn('key->cmdName',{key,cmdName})

        // TODO: if def is not a function, we have some resolving to do...
        baseCmds.push(new Config({
            name: `${cmdName}`,
            execute(){
                console.log("base cmd execute: ",{
                    cmdName,
                    machineizedCmdName,
                })
                // if(!InvokableCommands[cmdName]){
                //     throw new Error(`Bad Command Name:\n\n \`${cmdName}\`\n\n No Matching InvokableCommand Map Entry Found. Names must resolve to pre-defined Invokable functions we can call in order for a command to exist in the BasicCommands array. If you need to generate a command at runtime, there are other ways to do it. See: ...`)
                // }
                let result;

                // if the cmdName includes https:// or a file extension,
                // we should return a new instance of an appropriate widget
                if(cmdName?.includes?.('youtube.') || cmdName?.includes?.('youtu.be')){
                    return system.registerWidgetInstance(new YoutubePlayerWidget("Youtube"+Date.now()+Math.random,{tracks:[cmdName]}));
                }else if(cmdName?.includes?.('://')){
                    // try an iframe
                    return system.registerWidgetInstance(new iFrameWidget("Iframe"+Date.now()+Math.random,{src:cmdName}));
                }
                // if it's an ARRAY of STRINGS, we need to do ths same check and early return

                try{
                    if(!InvokableCommands[machineizedCmdName] || !InvokableCommands[machineizedCmdName]?.call){
                        console.warn("command must be one of:",Object.keys(InvokableCommands))
                        system.panic("bad command name: "+machineizedCmdName)
                    }
                    result = InvokableCommands[machineizedCmdName].call(this);
                }catch(e){
                    console.error('failed to execute command!',e)
                    // what to do if call can't be 
                    // invoked in this context in strict mode?
                    // Log the error and notify the user
                    console.error(`Command execution failed: ${e.message}`);
                    system.get("toastManager").showToast(`Command execution failed: ${e.message}`, {
                        level: "error"
                    });
                }
                let requestedWidth = null;
                let requestedHeight = null;
                // close the command prompt
                store.CmdPromptVisible = false;
                let tracks = [];
                if(typeof result === 'object' && Array.isArray(result)){
                    tracks = result;
                }
                else if(typeof result === 'string'){


                    // see if the url includes ?width or ?height,
                    // feed that to widgetSize
                    try {
                        const url = new URL(result);
                        requestedWidth = url.searchParams.get('width');
                        requestedHeight = url.searchParams.get('height');
                    } catch (e) {
                        console.error(`Failed to parse URL: ${e.message + ' ' + result}`);
                    }

                    tracks = [result];
                }else{
                    //
                }

                // normalize requestedWidth/height to ints, with defaults based on the current window size
                requestedWidth = requestedWidth ? Math.min(window.windowWidth - 20, parseInt(requestedWidth)) : window.windowWidth / 2;
                requestedHeight = requestedHeight ? Math.min(window.windowHeight - 20, parseInt(requestedHeight)) : window.windowHeight / 2;

                if(tracks.length){

                    // add ?autoplay=1 to the url at tracks[0]
                    try{
                        const url = new URL(tracks[0]);
                        url.searchParams.set('autoplay', 1);
                        tracks[0] = url.toString();
                    }catch(e){
                        console.error(`Failed to parse URL: ${e.message + ' ' + tracks[0]}`);
                    }

                    // if the result is a string youtube. or you.tu.be.
                    system.get("toastManager")
                    // spawned player
                    // now playing widget keeps a playlist
                        ?.showToast("Player Spawned!",{pinned:false})
                    InvokableCommands["Center View"]();
                    // panX = 300;
                    // panY = 300;
                    // zoom = 0.9;

                    system.registerWidget(tracks.length>1?tracks:tracks[0],{
                        widgetSize:{
                            width: requestedWidth,
                            height: requestedHeight
                        },
                        tracks
                    })

                    // system.get("Dashboard")
                    //     ?.registerWidget?.(new YoutubePlayerWidget("Youtube"+Date.now()+Math.random,{
                    //         widgetSize:{
                    //             width: requestedWidth,
                    //             height: requestedHeight
                    //         },
                    //         autoPlay: true,
                    //         tracks
                    //     }))
                }
            }
        }))
    })
    console.warn('setupDefaults:',{
        InvokableCommands,
        baseCmds
    })

    const h1 = "h1";
    const p = "p";
    const ul = "ul";
    let page = [
        [h1,"Hello!"],
        [p,"Uh-oh, I invented HTML + Javascript again!"],
        [p,"Or is this Flash + Actionscript?"],
        [p,"Or is this {Unreal|Unity|Other} => Three.js?"],
        [p,"Flutter? React Native?"],
        [p,"What could modern cross-platform application development look and FEEL like in {currentYear}?!"],
        [ul,"given advancements in:",[
            "AI","NLP","Machine Learning","Quantum Computing",
            "AR","VR","MR","XR","3D","4D","5D","6D","7D","8D","9D","10D"
        ]],
        [p, "If bill gates and steve jobs were jacked up on all this shit, what would they have invented this time instead?!"],
        [p, "The bicycle of the mind just with JET PACKS!"]
    ];
    console.warn({page})
    page.forEach(([tag,text])=>{
        // HAHA, NO, silly AI!...:
        // let el = document.createElement(tag);
        // Where we're going, we don't have a Document, we have an Infinitely Nested Fractal Field Manifold Manipulator!
        // baseCmds.push([tag,{default:text}])
        // simplifies to:
        // console.warn({
        //     tag,
        //     text
        // })
        //baseCmds.push([tag,text])
    })

    CoreWidgets.forEach((widget, key, index)=>{
        // need to generate a basic config for the widget
        // need to register a command to intantiate the widget that is bound to the config class (so spawning the widget shows up in the default command suggestion list)

        if(widget?.classname && window[widget.classname]){
            console.warn("detected widget with classname",{
                widget,
            })

            // make an option for spawning
            // but also (until we get user profiles sorted out)
            // just load all available widget types in the default dashboard
            // TODO: make a WidgetRegistry viewer so we can offer a clean dashboard at startup
            // and Dashboard profiles for switching dashboard instances, (even viewing them side by side OR overlapping)
            baseCmds.push(new Config({
                name: `Spawn Widget: ${widget.name}`,
                description: `Spawns a new ${widget.name} widget`,
            }))

            // now register an instance of the widget since it is a base widget
            system.registerWidget(new window[widget.classname]());
            return;
        }else if(typeof widget === "function"){
            // console.warn("detected widget as function",{
            //     widget,
            // })
            baseCmds.push(widget)
        }else{
            console.error("detected widget as object",{
                widget,
            })
        }
        //system.get("Dashboard").registerWidget(widget.name, new widget());

        
        // register the command
        // console.warn("registering suggested command for widget",{
        //     widget
        // })
        baseCmds.push(getBasicSpawnWidgetConfig(widget));
    })
}

class DOMNode extends Widget {
    get text(){
        return this._text;
    }
    constructor(opts){
        this.opts = opts;
        this._text = opts?.text ?? this.text;
    }
    draw(){
        push();
        fill(255);
        textSize(32);
        textAlign(CENTER,CENTER);
        text(`${this.text}`,0,0);
        pop();
    }
}

class H1Widget extends DOMNode {
    text = "H1 Widget"
    constructor(opts){
        super(...arguments)
        this.text = opts?.text ?? this.text;
        //this.name = this.text.substring(0,10) + "...";
        this.options = opts;
    }
}
class Animation {
    constructor(startValue, endValue, duration, updateCallback) {
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.updateCallback = updateCallback;
        this.startTime = null;
    }

    animate(timestamp) {
        if (!this.startTime) this.startTime = timestamp;
        const elapsed = timestamp - this.startTime;
        if (elapsed >= this.duration) {
            this.updateCallback(this.endValue);
        } else {
            const t = elapsed / this.duration;
            const currentValue = this.startValue + (this.endValue - this.startValue) * t;
            this.updateCallback(currentValue);
            requestAnimationFrame(this.animate.bind(this));
        }
    }
}
const CoreWidgets = [
    // H1Widget,
    // ThreeJSViewer,
    //IsometricPreview,
    // Solitaire,
    // // ya'know, for testing buttons and stuff
    // UIDemoWidget,

    // // display a basic manipulation gizmo cage
    // Gizmo,

    // WizardForge,

    // GiphyWidget,

    // MandlebrotWidget,
    // FileBrowserWidget,
    // WebBrowserWidget, // iframeWidget wrapper
    // IFTTTWidget, // IFTTT Integration

    // ShaderToyWidget,
    // PixelArtWidget,
    // VectorArtWidget,
    // TextEditorWidget,
    // P5JSSketchWidget,
    // DrawIOWidget,
    // FigJamWidget,
    // ChessWidget,
    // WorkflowyWidget,

    // // About, More Info... etc...
    // // Legal, Privacy, Terms, etc...
    // /* a "slideshow" of credits */
    // CreditsWidget,

    // JSONViewer,
    // GraphVizDotLangViewer,
    // ThreeJSViewer,
    // GlobeWidget,
    // TimezoneClocksWidget,
    // SplineEditorWidget,
    // TimelineWidget,

    // NestedDragAndDropSortingWidget,
    // // "Hypercard"
    // FractalTreeGraphViewerWidget,

    // KeyboardWidget
]

class SoundCloudWidget extends iFrameWidget {
}

class SketchfabEmbedWidget extends iFrameWidget {
    /*
    <div class="sketchfab-embed-wrapper"> 
        <iframe title="Robot" 
                frameborder="0" 
                allowfullscreen 
                mozallowfullscreen="true" 
                webkitallowfullscreen="true" 
                allow="autoplay; fullscreen; xr-spatial-tracking" 
                xr-spatial-tracking 
                execution-while-out-of-viewport 
                execution-while-not-rendered 
                web-share 
                src="https://sketchfab.com/models/ff93ae5114ef4beb8c2a1d48ccc9f3a6/embed?camera=0&ui_theme=dark"> 
                </iframe> 
                
                <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;"> 
                <a href="https://sketchfab.com/3d-models/robot-ff93ae5114ef4beb8c2a1d48ccc9f3a6?utm_medium=embed&utm_campaign=share-popup&utm_content=ff93ae5114ef4beb8c2a1d48ccc9f3a6" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> Robot </a> by <a href="https://sketchfab.com/jakedowns?utm_medium=embed&utm_campaign=share-popup&utm_content=ff93ae5114ef4beb8c2a1d48ccc9f3a6" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> jakedowns </a> on <a href="https://sketchfab.com?utm_medium=embed&utm_campaign=share-popup&utm_content=ff93ae5114ef4beb8c2a1d48ccc9f3a6" target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;">Sketchfab</a></p></div>
    */
   // set the iframe src to the sketchfab embed url
   url = "https://sketchfab.com/models/ff93ae5114ef4beb8c2a1d48ccc9f3a6/embed?camera=0&ui_theme=dark";
//    constructor(){
//     super(...arguments)
//     // this.element = mctx.createDiv();
//     // this.element.parent('under-ui-elms')
//     // this.element.style('position:absolute;')
//     // //this.element.size(300,300);
//     // let iframe = document.createElement('iframe');
//     // iframe.title = "Robot";
//     // iframe.allowFullscreen = true;
//     // iframe.mozallowfullscreen = "true";
//     // iframe.webkitallowfullscreen = "true";
//     // iframe.allow = "autoplay; fullscreen; xr-spatial-tracking";
//     // iframe.setAttribute('execution-while-out-of-viewport', '');
//     // iframe.setAttribute('execution-while-not-rendered', '');
//     // iframe.setAttribute('web-share', '');
//     // iframe.src = "https://sketchfab.com/models/ff93ae5114ef4beb8c2a1d48ccc9f3a6/embed?camera=0&ui_theme=dark";
//     // this.element.elt.appendChild(iframe);

    
//    }
//    onDraw(){
//     super.onDraw(...arguments)
//    }
//    onDraw(){
//     super.onDraw(...arguments)
//     this.element.position(
//         this.smartPosition.x,
//         this.smartPosition.y
//     );
//    }
}

let tabHistory = [];
let lastFocusedElement = null;
function focusHandler(e){
    //console.warn('focusHandler',{e})
    // if we're not already in the tab history, add it
    if(tabHistory.indexOf(e.target) === -1){
        tabHistory.push(e.target);
    }
    lastFocusedElement = e.target;
    console.warn('tabHistory',{tabHistory})
    console.warn('lastFocusedElement',{lastFocusedElement})
    console.warn('e.target',{targ:e.target})
}
function blurHandler(e){
    // let index = tabHistory.indexOf(e.target);
    // if(index !== -1){
    //     tabHistory.splice(index, 1);
    // }
    // if(lastFocusedElement === e.target){
    //     lastFocusedElement = tabHistory[tabHistory.length - 1];
    // }
    lastFocusedElement = null;
    console.warn('field blur',{e})
}
function refreshInputBindings(){
    // prevent any double-binding
    document.removeEventListener('focus', focusHandler, true);
    document.removeEventListener('blur', blurHandler, true);

    document.addEventListener('focus', focusHandler, true);
    document.addEventListener('blur', blurHandler, true);
}

const easeOutQuad = (t) => t * (2 - t);

/*
based on 
const panXAnimation = new Animation(panX, 0, 1000, value => panX = value);
const panYAnimation = new Animation(panY, 0, 1000, value => panY = value);
const zoomAnimation = new Animation(zoom, 1, 1000, value => zoom = value);

requestAnimationFrame(panXAnimation.animate.bind(panXAnimation));
requestAnimationFrame(panYAnimation.animate.bind(panYAnimation));
requestAnimationFrame(zoomAnimation.animate.bind(zoomAnimation));
*/
function animateVector(from, to, onUpdate, duration = 1000){
    
    // assume x,y,z for now
    let xAnimation = new Animation(
        from.x, 
        to.x, 
        duration, 
        (value) => {from.x = value; onUpdate(value, 'x'); });
    
    let yAnimation = new Animation(
        from.y, 
        to.y, 
        duration, 
        (value) => {from.y = value; onUpdate(value, 'y'); });
    
    let zAnimation = new Animation(
        from.z, 
        to.z, 
        duration, 
        (value) => {from.z = value; onUpdate(value, 'z'); });

    requestAnimationFrame(xAnimation.animate.bind(xAnimation));
    requestAnimationFrame(yAnimation.animate.bind(yAnimation));
    requestAnimationFrame(zAnimation.animate.bind(zAnimation));
}

let cursor, MainCanvasContextThing = function(p){
    let _onResize = function(){
        mctx.resizeCanvas(windowWidth, windowHeight);
        // document.querySelectorAll('canvas').forEach((canvii)=>{
        //     canvii.width = windowWidth;
        //     canvii.height = windowHeight;
        //     canvii.style.width = windowWidth+'px';
        //     canvii.style.height = windowHeight+'px';
        // })
        // TODO: call resize on DeepCanvasManager
        system.get("Dashboard")?.reflowLayout?.()
    }
    let _onResizeDebounced = debounce(_onResize);
    p.onResize = function(){
        _onResizeDebounced();
    }

    const postSetup = function(){
        setTimeout(()=>{_onResize()},150);
    }

    /* Central Cache for media instances */
    system.PreloadedImages = {
        "icon_NEW_COMMAND.png": null,
    };
    system.PreloadedSVGs = {

    }
    system.PreloadedSounds = {
        "res/Water Plop - Sound Effect (HD) [TubeRipper.com].mp3": null
    };
    // videos, etc...
    p.preload = function() {
        Object.entries(system.PreloadedImages).forEach(([_,imgName])=>{
            system.loadImageAsync(imgName);
        })
        // do we need to distinguish? p5 treats them identical
        // maybe useful for other renderers tho, if we end up having to pre-cache svgs to another format at some point...
        Object.entries(system.PreloadedSVGs).forEach(([_,name])=>{
            system.loadImageAsync(name);
        })
        Object.entries(system.PreloadedSounds).forEach(([_,name])=>{
            system.loadSound(name).then((sound)=>{
                system.PreloadedSounds[name] = sound;
            }).catch((e)=>{
                console.warn('bad sound',name)
                console.error('failed to load sound',e)
            });
        })
    }

    p.setup = function(){

        

        p.resizeCanvas(mctx.windowWidth,mctx.windowHeight)

        window.addEventListener('mouseup', function(event) {
            // if we clicked on or INSIDE of #html-foreground
            // we need to IGNORE the event if it's a click on an input
            // otherwise, we need to let it pass through to the canvas below
            var target = event.target;
            if(target.matches('#html-foreground, #html-foreground *')) {
                if(!target.matches('input, input *')) {
                    event.stopPropagation();
                }
            }
        })

        // when the window loses focus, disable the expensive rendering
        window.addEventListener('blur', function(event) {
            if(event.target === window) {
                store.windowHasFocus = false;
            }
        });
        window.addEventListener('focus', function(event) {
            if(event.target === window) {
                store.windowHasFocus = true;
            }
        });

        window.addEventListener('resize', _onResizeDebounced);

        refreshInputBindings();
        
        // overload mouseX and mouseY to be set to 0 if they're null or undefined (one at a time)
        // this is useful for when we're in a mode where we don't want the mouse to affect the canvas
        // e.g. when we're in a mode where we're typing in a text field


        // load pan,zoom from query params (if any)
        let params = new URLSearchParams(window.location.search);
        panX = parseFloat(params.get('panX')) || 0;
        panY = parseFloat(params.get('panY')) || 0;
        


        /*
            it's a spectrum
        */
        whatTheCenterIs = {
            x: this.windowWidth / 2,
            y: this.windowHeight / 2,
            z: 0
        }
        
        setupDefaults();


        deepCanvasManager = new LayereredCanvasRenderer();
        bgEl = document.getElementById('bg-image');
        // loadImage('bg-1.jpg', img => {
        //     bgImage = img;
        //     // bgImage.filter(BLUR, 10);
        // });

        // offset panX panY to center the graph
        //panX = 0; //windowWidth / 2;
        //panY = 0; //windowHeight / 2;

        ensureHeadTag();
        

        // boot the root system manager & root system
        // search for booting... to jump here :D
        // boot routine
        console.info("booting...");
        manager.boot(); 
        rootSystem = system = manager.systems[0];

        // note: there's a bug where calling the rootSystemManager.boot doesn't actually boot sub-systems
        // kind of makes sense, wouldn't want docker to auto-start all your containers each time
        // in the future, this will be based on user state
        // but for now, we'll just kick-start the rootSystem...
        // needed to defer until rendering was ready for some pre-cache drawing
        rootSystem.boot();

        // note the reduced volume!
        // stat.js
        (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='https://mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()


        system.plopAudioPlayer = mctx.createAudio('res/Water Plop - Sound Effect (HD) [TubeRipper.com].mp3');
        system.plopAudioPlayer.volume(0.1);
        
        console.info("booted");

        let canvases = [
            mctx,
            deepCanvasManager.canvases[0],
            deepCanvasManager.canvases[1],
            deepCanvasManager.canvases[2],
        ]
        const fragmentShaderSource = 
`precision mediump float;
varying vec2 vTexCoord;

void main(void) {
    float stripeWidth = 0.1; // Width of each stripe
    float frequency = 10.0;  // How many stripes there will be
    float pattern = abs(sin(vTexCoord.x * frequency * 3.1415)); // Create a sinusoidal pattern
    bool isStripe = pattern < stripeWidth; // Determine if the current fragment is in a stripe

    if (isStripe) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color for stripes
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black for non-stripes
    }
}
`       ;

        function p5glSetup(pgl){
            pgl.setup = function(){
                pgl.createCanvas(windowWidth, windowHeight, pgl.WEBGL);
            }

            // pgl.id('p5-3d');
            // pgl.parent(document.body);
            // ctxP53D = pgl.drawingContext;
        }

        ctxP53D = new p5(p5glSetup, `p5-3d`)

        let topCanvas = document.createElement('canvas');
        topCanvas.id="topCanvas"; // composited canvas, not really TOP as UI is drawn above this even...
        topCanvas.width = window.windowWidth;
        topCanvas.height = window.windowHeight;
        topCanvas.style.position = 'absolute';
        topCanvas.style.pointerEvents = 'none';
        topCanvas.style.top = 0;
        topCanvas.style.left = 0;
        topCanvas.style.zIndex = 90001; // over 9000
        // topCanvas.style.pointerEvents = 'none';
        document.body.appendChild(topCanvas);
        window.iCanvasCompositor = new CanvasCompositor(canvases, fragmentShaderSource, topCanvas);

        //initTHREEMode();

        // system.get("Dashboard").registerWidget(new IsometricPreview());

        // spawn a bunch of BlurSprite
        for(var i=0;i<20;i++){
            let sprite = new Sprite();
            sprite.x = p.random(-p.windowWidth,p.windowWidth);
            sprite.y = p.random(-p.windowHeight,p.windowHeight);
            sprite.z = p.random(-10,10)
            sprite.radius = p.random(1,10)
            sprites.push(sprite);
        }

        cursor = new Cursor();

        let startZoom = 0.0001;
        let endZoom;// = 1.12;
        endZoom = parseFloat(params.get('zoom')) || 1.12;
        let duration = 3000; // Duration in milliseconds
        let startTime = null;

        zoom = 0.0001;

        // fancy
        // intro animation
        // our nice zoom in effect
        // TODO: camera path recording / playback system (slideshow presentation mode)
        // Intro zoom in
        // NOTE: delayed till images load to bypass choppy animation
        const stepZoomAnimation = (timestamp) => {
            if (!startTime) startTime = timestamp;
            let progress = Math.min((timestamp - startTime) / duration, 1);
            let easedProgress = easeOutQuad(progress);
            zoom = startZoom + (endZoom - startZoom) * easedProgress;
            updateBlur();
            if (Math.abs(zoom - endZoom) > 0.0001) {
                requestAnimationFrame(stepZoomAnimation);
            } else {
                // snap to end value
                zoom = endZoom;
            }

            
        }
        

        // define our lazy singletons
        // will be instantiated upon first access attempt via system.get('toastManager')
        system.lazySingleton('timeManager',     TimeManager);
        system.lazySingleton('toastManager',    ToastNotificationManager);
        system.lazySingleton('cmdprompt',       CmdPrompt);
        system.lazySingleton('Dashboard', Dashboard);
        
        /// === region: Self Test Mode ===
        // TODO: parallelize with Promise.all([])
        // autorunFeatureTestResults.length = 0; // reset results
        // autorunFeatureTests.forEach((FeatureTestConfigOrInstance)=>{
        //     runFeatureTest(FeatureTestConfigOrInstance);
        // })
        // // a different approach
        // Object.entries(FEATURE_TESTS).forEach(([name, definition])=>{
        //     console.warn('instantiating and running feature tests',{
        //         name,definition
        //     })
        //     runFeatureTest(new FEATURE_TESTS[name]());
        // })
        // our alternative attempt at auto-class registration using
        // a decorator:
        // Object.entries(SELF_TEST_CLASSES).forEach(([name, definition])=>{
        //     console.warn('instantiating and running self test classes',{
        //         name,
        //         definition,
        //         stis:Object.keys(SELF_TEST_INSTANCES),
        //         stcs:Object.keys(SELF_TEST_CLASSES)
        //     })
        //     SELF_TEST_INSTANCES[name] = new SELF_TEST_CLASSES[name](SELF_TEST_CLASS_ARGS[name]);
        //     runFeatureTest(SELF_TEST_INSTANCES[name]);
        // });
        /// === endRegion: Self Test Mode ===

        // let testSeq = getTestGherkinSequence();
        // // bootstrap our self-test
        // gherkinRunnerWidget = new GherkinRunnerWidget(testSeq);

        document.addEventListener('keydown',(e)=>{
            // console.warn('keydown',{e})
            if(store.shiftIsMomentary){
                store.shiftIsPressed = e.shiftKey;
            }else{
                // shiftIsToggle, not shiftIsMomentary
                if(e.shiftKey){
                    store.shiftIsPressed = !store.shiftIsPressed;
                }
            }

            document.querySelectorAll('iframe').forEach((iframe)=>{
                // toggle pointerEvents none when shift is pressed
                if(store.shiftIsPressed){
                    iframe.style.pointerEvents = 'none';
                } else {
                    iframe.style.pointerEvents = 'auto';
                }
            });


            // if we're not focused on any fields
            if(store.focusedField === null){

            }

            // if we're focused on the main command prompt input,,
            //if(store.focusedField === CmdPromptInput.elt){
                // arrow key down should cycle through the suggestion list
                // call the input handler
                cmdprompt = system.cmdprompt;
                if(!cmdprompt){
                    system.warn("cmdprompt not ready");
                }
                cmdprompt?.onCmdPromptInput(e);
            //}
        })
        // primary key bindinds...

        document.addEventListener('keydown', (e)=>{
            console.warn('keypress',{e})
            // command or control
            // cmdorcontrol
            // cmdorctrl
            // ctrlorcmd
            // controlorcmd
            // controlOrCommand
            const ctrlOrCmd = e.ctrlKey || e.metaKey;

            // TODO: make this a static command matrix... !!!

            if(ctrlOrCmd && e.key === 'd'){
                system.alert("don't bookmark, just come back.")
                e.preventDefault();
                InvokableCommands["clear"]();
                /** @see CmdPrompt.hideCmdPrompt */
                system.cmdprompt.hideCmdPrompt();
                system.notify("Cleared! 🧘‍♂️")
                return;
            } 

            // Check if Ctrl key is pressed along with P
            if (ctrlOrCmd && e.key === 'p') {
                // ctrl + p, cmd + p, cmd&p||ctrl&p
                // Prevent the default ctrl p ctrl+p print action!
                e.preventDefault();
                //alert("Ctrl+P has been disabled!");
                // toggle the dashboard
                /** @see CmdPrompt.showCmdPrompt */
                system.cmdprompt.showCmdPrompt();
                return;
            }

            // override default ctrlOrCmd + f behavior
            if (ctrlOrCmd && e.key === 'f') {
                e.preventDefault();
                system.todo("Ctrl/Cmd + F behavior overridden, but not yet implemented.");
            }

            // override default ctrlOrCmd + k behavior
            if (ctrlOrCmd && e.key === 'k') {
                e.preventDefault();
                system.todo("Ctrl/Cmd + K behavior overridden, but not yet implemented.");
            }

            // override default ctrlOrCmd + l behavior
            if (ctrlOrCmd && e.key === 'l') {
                e.preventDefault();
                system.todo("Ctrl/Cmd + L behavior overridden, but not yet implemented.");
            }

            // if the key is `f` and we don't have any inputs focused,
            // interpret it as "find" or "fit" and center the pan/zoom back to origin of current space
            if(e.key === 'f' && !store.focusedField){
                system.dashboard.centerView();
                system.alert("focused")   
            }
            // toggle 100% zoom
            // ctrl+0
            // cmd+0
            if(ctrlOrCmd && e.key === '0'){
                /** @see Dashboard.centerView */
                system.dashboard.centerView(true);
            }

            // if pasting 
            if(ctrlOrCmd && e.key === 'v'){
                /** @see System.onPaste */
                system.onPaste(...arguments);
            }
            // copying
            if(ctrlOrCmd && e.key === 'c'){
                /** @see System.onCopy */
                system.onCopy(...arguments);
            }
            
            let KeyboardPanInfluence = { x: 0, y: 0 };
            let KeyboardPanInfluenceTarget = { x: 0, y: 0 };
            let maxInfluence = 100 * (zoom); // 1/zoom?
            let decayFactor = 0.99;
            let lerpFactor = 0.001; // control the speed of lerp
            let ignore = false;
            let baseStepSize = 100;
            let stepSize = baseStepSize * (zoom); // 1/zoom?
            switch(e.key) {
                case 'w':
                    zoom += 0.1;
                    break;
                case 's':
                    zoom -= 0.1;
                    break;
                case 'a':
                case 'ArrowLeft':
                    KeyboardPanInfluenceTarget.x = Math.max(KeyboardPanInfluenceTarget.x - stepSize / zoom, -maxInfluence);
                    break;
                case 'd':
                case 'ArrowRight':
                    KeyboardPanInfluenceTarget.x = Math.min(KeyboardPanInfluenceTarget.x + stepSize / zoom, maxInfluence);
                    break;
                case 'q':
                case 'ArrowUp':
                    KeyboardPanInfluenceTarget.y = Math.max(KeyboardPanInfluenceTarget.y - stepSize / zoom, -maxInfluence);
                    break;
                case 'e':
                case 'ArrowDown':
                    KeyboardPanInfluenceTarget.y = Math.min(KeyboardPanInfluenceTarget.y + stepSize / zoom, maxInfluence);
                    break;
                default:
                    ignore = true;
                    break;
            }

            // Lerp the influence values over time
            KeyboardPanInfluence.x += (KeyboardPanInfluenceTarget.x - KeyboardPanInfluence.x) * lerpFactor;
            KeyboardPanInfluence.y += (KeyboardPanInfluenceTarget.y - KeyboardPanInfluence.y) * lerpFactor;

            // Decay the influence when the keyboard movement stops
            KeyboardPanInfluence.x *= decayFactor;
            KeyboardPanInfluence.y *= decayFactor;

            // Apply the influence to the pan with lerp towards the target
            //if(!ignore){
                panX += (KeyboardPanInfluence.x - panX) * lerpFactor;
                panY += (KeyboardPanInfluence.y - panY) * lerpFactor;
            //}
        })
        document.addEventListener('keyup',(e)=>{
            if(store.shiftIsMomentary){
                store.shiftIsPressed = false
            }
            // console.warn('keyup',{e})
            // if the cmdprompt is active, pipe the event
            if(store.CmdPromptVisible){
                cmdprompt = system.cmdprompt;
                if(!cmdprompt){
                    system.warn("cmdprompt not ready");
                }
                cmdprompt?.onCmdPromptInput(e);
            }
        })

        

        //system.get("cmdprompt")
        system.cmdprompt.afterSetup()

        // const WidgetsToRegister = [
        //     "inspiration/001.png",
        //     "inspiration/signs-of-yesterday.jpeg",
        //     "fine.gif",
        //     "video_731defd5b618ee03304ad345511f0e54.mp4",

        //     MessengerWidget,
        //     TimerWidget,
        //     TodoWidget,
        //     UIDemoWidget,
        //     WeatherWidget,

        //     ImageCubeRotatorWidget,
        //     ImageRotatorWidget,        
        // ]

        // "the big widget registration"
        // NEW: init the widget dashboard
        system.dashboard.init()

        // system.registerWidget(
        //     new ImageViewerWidget("fine.gif")
        // )

        //system.todo("log time til framerate stable (boot seq time)")

        /*
        // it'll be our debug standard output while we workbench the windowing > tabs > panes subsystems
        const grw = new GherkinRunnerWidget();
        grw.centerPosition();
        // attach the results of the self test runner to the widget
        grw.setResults(autorunFeatureTestResults);
        // demo widgets
        system.dashboard.registerWidget(grw);
        */

        // NOT NOW NAUSEA!

       //system.dashboard.registerWidget(new RubiksCubeGL());
       // system.dashboard.registerWidget(new RubiksCubeWidget());
        //system.dashboard.registerWidget(new ClientResolverDebugWidget());

        //system.dashboard.registerWidget(new ImageViewer("cheshire-cat.gif"));
        // system.dashboard.newWidgetInstance(ImageSpinner, "cheshire-cat.gif");

        // current workbench of demo widgets // work bench
        // InvokableCommands["new text viewer widget"]()
        // InvokableCommands["view welcome message"]()
        // InvokableCommands["question of the day"]()
        // InvokableCommands["hello my name is..."]()
        // InvokableCommands["text me..."]()
        // InvokableCommands["i'm feeling feelings..."]()
        // InvokableCommands["view ChangeLog"]()

        // InvokableCommands["new iframe"](`https://editor.p5js.org/jakedowns/full/LM0oRxYGt`,{
        //     widgetSize: {
        //         width: 400,
        //         height: 400
        //     }
        // })
        // InvokableCommands["new grid of things"]();
        // InvokableCommands["open calendar"]();
        // InvokableCommands["new timer"]();
        // InvokableCommands["new oscilloscope"]();
        // InvokableCommands["new pie chart"]();
        // InvokableCommands["new donut chart"]();

        // loadTestWidgets
        if(store.showTestWidgets){
            // add our first widget (todo: load state from dehydrated json)
            // DEFAULT WIDGET SET

            system.registerWidget("colorpickermockup.png")
            system.registerWidget(new ColorPickerWidget())

            // as "let him cook" meme
            system.registerWidget("https://i.kym-cdn.com/photos/images/newsfeed/002/488/659/18a.jpg");

            // Register Some Widgets
            // Spawn Some Widgets
            InvokableCommands["New Time To Sunset Widget"]()
            InvokableCommands["New Calculator Widget"]()
            InvokableCommands["New Egg Timer"]()
            InvokableCommands["Play Glorious Dawn"]()
            InvokableCommands["NEW_STICKY_NOTE"]()
            // InvokableCommands["New Scratch Pad"]()
            //InvokableCommands["New Markdown Editor"]()

            system.invoke("Study Greek Alphabet Flashcards");

            //InvokableCommands["NEW_SKETCHFAB_VIEWER"]()
            //system.invoke("NEW_SKETCHFAB_VIEWER")
            system.registerWidget(new SketchfabEmbedWidget())

            system.invoke("NEW_FISH")
            system.invoke("NEW_DOG")
            system.invoke("NEW_CAT")

            //InvokableCommands["UI Inspiration > Minority Report UI"]()
            system.invoke("EMBED_TWEET")

            // demo widgets
            system.invoke("new zoom dependent widget")
            // aka navigator widget
            system.invoke("new minimap widget")

            system.invoke("new moon phase widget")

            // OnDashboardReady OnDashboardLoaded OnDashboardInit
            // OnDashboardStarted
            system

                // Main Widget Registration Area
                



                
                
                // ~~ TODO: consolidate all other widget registration methods ~~


                // what if you could remote desktop in here?!
                // .registerWidget(new iFrameWidget("https://remotedesktop.google.com/access/"))

                // 5-calls widget:
                .newWidget(
                    new iFrameWidget("https://5calls.org/issue/israel-palestine-gaza-war-hamas-ceasefire/",{
                        widgetSize:{
                            width: 480,
                            height: 640
                        }
                    })
                )

                .newWidget(new iFrameWidget("https://faxzero.com/",{
                    widgetSize:{
                        width: 480,
                        height: 640
                    }
                }))

                .newWidget(new iFrameWidget("https://publishersforpalestine.org/",{
                    widgetSize:{
                        width: 480,
                        height: 640
                    }
                }))

                // dental services in my dental coverage network?!
                // x-ray services that work when i travel a lot for work?
                // good accounting tips for freelancers and quarterly estimated taxpayers
                // ...

                // thomas and friends for SNES: minigame: 
                .newWidget("https://youtu.be/mQcR04RROUQ?si=9kpOTXAd9rQZ_QLa&t=482")

                // dark side of the moon, mario 64 sound font
                .newWidget("https://www.youtube.com/watch?v=KVKtF-i3gK4")

                // recommended related stuff...
                // https://www.reddit.com/r/SuperMario64/

                // can you use chat gpt in an iframe?
                // .newWidget(new iFrameWidget("https://chat.openai.com/",{
                //     widgetSize:{
                //         width:800,
                //         height:600
                //     }
                // }))


                .newWidget(new GithubCardWidget())
                .registerWidget(new ClockWidget())
                .registerWidget(new MarchingCubesDemoWidget())

                .registerWidget(new AStarPathfindingDemoWidget())

                .registerWidget(new MandlebrotWidget())

                    //     .registerWidget(new IsometricPreview())

                    .registerWidget(new AIWidget())
                    // this should be part of deep canvas manager...
                    // .registerWidget(new P53DLayer()) 
                    // disabled by default cause it tanks perf
                    // need to optimize draw routines...
                    // .registerWidget(new ThreeJSViewer())

                    .registerWidget(new KeyboardWidget())


                // TODO THEIR IFRAME IS BLOCKED, HOST A IFRAME FRIENDLY COPY!!!
                .registerWidgetAvailable("Google Color Picker",()=>{
                    system.todo("Googles color picker is iframe-blocked, make or find an iframe friendly one")
                })
                .registerWidget(
                    new ImageViewerWidget("ukraine-flag.jpeg")
                )
                .registerWidget(
                    new ImageViewerWidget("insp.png",{
                        widgetSize:{width:2880,height:1580}
                    })
                )
                .registerWidget(
                    //"SVGViewerWidget:PFlag",
                    new ImageViewerWidget("Flag_of_Palestine.svg")
                )
                .registerWidget(
                    //"milky-way-galaxy.gif",
                    new ImageViewerWidget("milky-way-galaxy.gif")
                )

                
                .registerWidget(
                    //"4SeasonsImg", 
                    new ImageViewerWidget("https://cdn.pixabay.com/animation/2023/08/13/15/26/15-26-43-822_512.gif")
                )

                .registerWidget(
                    new ImageViewerWidget("fine.gif")
                )
                
                // // intentionally on a separate line to make it easier to comment out last chained method
                // ;
                // WidgetsToRegister.forEach((widgetClassName)=>{
                //     let theInstance = null;
                //     const widgetTypes = {
                //         ImageViewerWidget: [".gif",".png",".jpeg",".jpg",".svg"],
                //         VideoPlayerWidget: [".mp4"],
                //         YoutubePlayerWidget: [".youtube."]
                //     };
                //     if(typeof widgetClassName === 'string'){
                //         for (const [widgetType, extensions] of Object.entries(widgetTypes)) {
                //             if (extensions.some(ext => widgetClassName.includes(ext))) {
                //                 if(!window[widgetType]){
                //                     console.warn("missing widget type",{
                //                         widgetType,
                //                         extensions,
                //                         widgetClassName
                //                     })
                //                     continue;
                //                 }

                //                 theInstance = new window[widgetType](widgetClassName);
                //                 break;
                //             }
                //         }
                //         if (!theInstance && (widgetClassName.includes("://") || widgetClassName.split(".").length > 2)) {
                //             theInstance = new iFrameWidget(widgetClassName);
                //         }
                //     }else{
                //         if (!theInstance) {
                //             theInstance = new widgetClassName();
                //         }
                //     }
                //     if(!theInstance){
                //         console.warn(`failed to instantiate widget ${widgetClassName}`)
                //         return;
                //     }
                //     system.registerWidget(theInstance)
                // })

                    // shuffle widget order
                    // system.dashboard.shuffleWidgets()
                    // NO! https://www.youtube.com/watch?v=X5trRLX7PQY&t=527s
            // Additional Widgets
            system.registerWidget(new KeyboardWidget());
            system.registerWidget(new MyMouseEvents());
        }

        // POST-REGISTRATION-WIDGET-MUNGING-OPERATIONS
        // set all widgets to canvasID 1 so they're in the "BG" deep canvas
        // then pick one at random and set it to 0 so it's focused
        // then pick another couple at random and set to -1 so it's in the "FG" deep canvas
        const widVals = Object.values(system.get("Dashboard").widgets);
        let count = widVals.length;
        widVals.forEach((widget,index)=>{
            widget.canvasID = Math.round(mctx.random(-1,1)); //-1;
            // if(index === count -1){
            //     widget.canvasID = 1;
            // }
        })
        // let widgetKeys = Object.keys(system.get("Dashboard").widgets);
        // let randomWidgetKey = widgetKeys[Math.floor(Math.random() * widgetKeys.length)];
        // system.get("Dashboard").widgets[randomWidgetKey].canvasID = 0;
        // let randomWidgetKey2 = widgetKeys[Math.floor(Math.random() * widgetKeys.length)];
        // system.get("Dashboard").widgets[randomWidgetKey2].canvasID = -1;



        const protoLists = {}
        protoLists.about = {
            type: "protoListItem",
            name: "About",
            // tracks own index into parent data struct for fast lookup with no loops
            address: "protoLists.about",
            items: [{
                type: "protoListItem",
            }],
            description: `at the base level of the system, we need something, some data atom, and it could either be literals (fastest) or literals with sugar: protoListItem.
            
            inevitably, a time will come when we don't want to type that out for speed,

            so protoItem > pItem > p 
            who knows, our base class probably shouldn't be "p"
            but we can find a more suitable name later...

            so, from there, you can attach properties, they themselves, also being "p"'s and groups of "p"'s which are in turn, just "p"'s themselves, with pointers that _refer_ to the other "p"'s they're "collecting" or "representing" (think pointers, references)

            the nice thing is, programming has gotten so abstracted away, that programmers no longer need to concern themselves with low level abstractions

            of course, having a working knowledge and healthy appreciation for them goes a long way

            but for the new comer just diving in, or for the person trying to get something done before their newborn wakes up from their nap, the less barriers between "thought" and "application" the better.

            with advanced BCI interfaces, like neuralink coming online in the very near future, it's important to...

            * 
            `
        }

        const todoNames = {
            "AM: shower": 1,
            "AM: walk bear": 1, 
            "AM: feed bear": 1,
            "AM: eat bfast": 1,
            "PM: lunch": 1,
            "PM: dinner": 0,
            "PM: feed bear": 0,
            "PM: walk bear": 0,
            "PM: dishes": 0,
            "PM: brush teeth": 0,
            "---":0,
            "resizable widgets": 0,
            "theme system": 0,
            "kanban viewer": 0,
            "---":0,


            "---[HIGH-PRIORITY]---": -1,

            // repeats daily for ever
            "🚿 AM: shower": -99,
            "🦷 AM: brush teeth": -99,
            "🚶‍♂️ AM: walk bear": -99,
            "🥣 AM: feed bear": -99,
            "🍽️ PM: lunch": -99,
            "🐻 PM: feed bear": -99,
            "🚶‍♂️ PM: walk bear at sunset": -99,
            "🍽️ PM: dinner": -99,

            // -1 === SEPARATOR
            "---[]---": -1, 

            // repeats weekly for ever
            // repeats daily
            "📅 Daily: check bills": -99,

            // repeats weekly
            "📅 Weekly: finance weekly check-in": -99,

            // repeats monthly
            "📅 Monthly: finance monthly check-in": -99,

            // "🌞 AM: study mathematics": 0,
            // "🌞 AM: study physics": 0,
            // "🌞 AM: study engineering": 0,
            // "🌞 AM: power point": 0,
            // "🌤️ NO: study mathematics": 0,
            // "🌤️ NO: study physics": 0,
            // "🌤️ NO: study engineering": 0,
            // "🌤️ NO: power point": 0,
            // "🌆 PM: study mathematics": 0,
            // "🌆 PM: study physics": 0,
            // "🌆 PM: study engineering": 0,
            // "🌆 PM: power point": 0,
            // "🌙 NI: study mathematics": 0,
            // "🌙 NI: study physics": 0,
            // "🌙 NI: study engineering": 0,
            // "🌙 NI: power point": 0,
        }
        const todoWidget = system.get("Dashboard").widgets["TodoWidget"];
        if(!todoWidget){
            console.warn("todo widget missing?")
        }else{
            todoNames.forEach((status,name,index)=>{
                todoWidget.addTodo(name)
                todoWidget.setTodoStatus(todoWidget.todos.length-1, status)
            })
        }

        // Disable the default context menu
        p.canvas.oncontextmenu = function (e) {
            e.preventDefault();
            console.warn('prevent default!');
        };

        postSetup();

        // Post-Post-Setup
        // Post Post Setup
        // kickoff loaded animation
        setTimeout(()=>{
            requestAnimationFrame(stepZoomAnimation);
        },3000)
    }

    p.onMouseDown = function(){
        if(p.mouseButton === p.RIGHT){
            alert("right!")
        }
    }

    

    // Define the mouseWheel function
    p.mouseWheel = function(event) {
        // TODO: if the mouse is over a scroll container,
        // scroll it
        
        if(store.shiftIsPressed){
    
            // IF ZOOM ON SCROLL ENABLED
            zoom -= -event.delta / 1000;
            zoom = constrain(zoom, MIN_ZOOM, MAX_ZOOM);
            newZoom = zoom;
            // make sure we offset the pan to account for the zoom messing with our center
            // we should be passing _towards_ the mouse 
            // panX += (mouseX - windowWidth / 2) * zoom * (oldZoom-zoom > 0 ? 1 : -1);// * (oldZoom - zoom);
            // panY += (mouseY - windowHeight / 2) * zoom * (oldZoom-zoom > 0 ? 1 : -1);// * (oldZoom - zoom);
    
            // // Implementing simple nudge based on logic
            // // If panX > 0, we're panning right, so we need to nudge left
            // let delta = deltaTime * (oldZoom - newZoom);
            // let delta2 = Math.abs(panX) - 0;
            // let delta3 = Math.abs(panY) - 0;
            // delta*=1.0 - (delta2+delta3);
            // let stepFactor = .09; //1.001;
            // if(panX > 0) {
            //     panX -= stepFactor * delta;
            // }
            // // If panX < 0, we're panning left, so we need to nudge right
            // if(panX < 0) {
            //     panX += stepFactor * delta;
            // }
            // // If panY > 0, we're panning down, so we need to nudge up
            // if(panY > 0) {
            //     panY -= stepFactor * delta;
            // }
            // // If panY < 0, we're panning up, so we need to nudge down
            // if(panY < 0) {
            //     panY += stepFactor * delta;
            // }
    
    
        }else{
            // The zoom level affects the pan speed. When zoomed out (zoom = 0.1), we pan further.
            // Conversely, when zoomed in (zoom = 1-3), we pan less far.
            // but we never let it go to 0 incase user wants to pan while fully zoomed in
            let panStepX = Math.max(0.1, (MAX_ZOOM-zoom));
            let panStepY = Math.max(0.1, (MAX_ZOOM-zoom));
            panX -= event.deltaX * panStepX;
            panY -= event.deltaY * panStepY;
        }
        // else{
        //     panX -= event.deltaX;
        //     panY -= event.deltaY;
        // }
        //if(store.shiftIsPressed){
            // X - axis = Z zoom
            //zoom -= event.deltaX / 1000;
            //zoom = constrain(zoom, 0.1, 3);
    
            zoomChanged = oldZoom !== zoom
            if(zoomChanged){
                _onResizeDebounced();
            }
            oldZoom = zoom;
    
        //}else{
            //panX -= event.deltaX;
            
        //}
        event.preventDefault();
    
        if(bgEl){
            /* 
                zoom ranges from | 0.1 - 1 - 3 |
                blur ranges from | max_blur - 0 - max_blur |
            */
            updateBlur();
        }
    
        // offset the pan when zooming
        // we want to make sure we're zooming from the center of the screen
        // so we need to offset the pan to account for the zoom
        // otherwise, it's anchored to the top left corner
        //panX += (windowWidth / 2) * (oldZoom - zoom);
    }

    // Define the draw function
    // Main Draw fn / Root Draw
    // Todo: system manager should loop over active systems,
    // and call draw on systems which have non empty render queues
    p.draw = function(){
        //myMainDrawFN();
        //console.warn('calling compositor render',performance.now())
        window.iCanvasCompositor.render();

        // debug layer, draw raysToVisualize
        // remember raysToVisualize is an array of Raycast
        // annotate it:
        /**
         * @type {Raycast[]}
         */
        if(store.visualizeRays){
            raysToVisualize.forEach((ray)=>{
                let uictx = deepCanvasManager.uiContext;
                uictx.push()
                // Draw a blue dot at the source
                uictx.fill(0,0,255);
                uictx.ellipse(ray.from.x, ray.from.y, 2.5, 2.5);
                // Draw a red dot at the destination
                uictx.fill(255,0,0);
                uictx.ellipse(ray.to.x, ray.to.y, 5, 5);
                // Draw a line from source to destination
                uictx.stroke(0, 255, 0, 0.1);
                uictx.strokeWeight(100);
                uictx.line(
                    ray.from.x, 
                    ray.from.y, 
                    //ray.from.z, 
                    ray.to.x, 
                    ray.to.y //, ray.to.z
                );
                uictx.pop()
            })
        }
    }

    // Define the mouseReleased function
    // TODO: put this on the canvas ui context layer (topmost layer is our interaction target)
    p.mouseReleased = function(){
        if (panningBG) {
            panningBG = false;
            stopDragging(); // ~> stepPanMomentum
        }
    }
    
    window.myMainDrawFN = function() {
        if(!store.windowHasFocus){
            return;
        }
        mainCanvasContext = p;

        


        if(!store.disableDeepCanvas){
            deepCanvasManager.draw();
        }
    
        // check the current pinch scale factor
    
    
        store.frameDrawCount = 0;
        store.frameDrawCount++;
    
        handleAnalogStickInput();

        // if(!window.mainCanvasContext?.clear){
        //     return;
        // }
    
        // this value updates instantly
        // then we lerp our viewport's cursor vec3 torwards it
        whatTheCenterIs.x = mctx.mouseX;
        whatTheCenterIs.y = mctx.mouseY;

        if(!mainCanvasContext){
            system.panic("need mainCanvasContext", {
                mctx
            })
        }
    
        // clear the canvas
        if(store.clearMode){
            mainCanvasContext.clear()
        }
        //background(color(0,0,0,0));
    
        /**
        * @description Iterating over sprites array
        * @type {Sprite[]} sprites - Each sprite is an instance of the Sprite class
        */
        // mainCanvasContext.push();
        store.minZ = 1000;
        store.maxZ = 0;
        
        if(!store.disableSprites){
            sprites.forEach((sprite,index)=>{
                //sprite.drawSimple();
                sprite.draw();
        
                // push sprite in z space
                // once it reaches a certain depth, snap it back to the other end of z space and a random x,y scaled by z
                sprite.z -= 0.01;
                if(sprite.z){
                    if(sprite.z < -10){
                        sprite.z = 10;
                        // sprite.x = Math.random() * windowWidth;
                        // sprite.y = Math.random() * windowHeight;
                    }
                    if(sprite.z > 10){
                        sprite.z = -10;
                        // sprite.x = Math.random() * windowWidth;
                        // sprite.y = Math.random() * windowHeight;
                    }
                }
                if(sprite.z > store.maxZ){
                    store.maxZ = sprite.z;
                }
                if(sprite.z < store.minZ){
                    store.minZ = sprite.z;
                }
        
                return;
        
                // use some perlin noise to perterb the 
                // sprite's position
                // (in the future, we'll convert to flowfield influence)
                let seed = Math.random();
                let offsetX = sprite.x * 0.00001; // Decrease multiplier for smoother noise
                let offsetY = sprite.y * 0.00001; // Decrease multiplier for smoother noise
                let uniqueFactorX = sprite.x * 0.2; // Add offset for unique noise per region
                let uniqueFactorY = sprite.y * 0.2; // Add offset for unique noise per region
        
                // Update sprite's x position with noise-based perturbation
                // noise() generates Perlin noise value at specified coordinates
                // offsetX + frameCount * 0.01 + seed + uniqueFactorX gives unique noise coordinates for each frame and sprite
                // noise() returns value between 0 and 1, so we subtract 0.5 to allow movement in both positive and negative directions
                // Final value is multiplied by 20 to increase the effect and by Math.sin(frameCount * 0.01) for oscillating effect over time
                sprite.x += (noise(offsetX + frameCount * 0.01 + seed + uniqueFactorX) - 0.5) * 2 * Math.sin(frameCount * 0.01);
                
                // Update sprite's y position with noise-based perturbation
                // Similar to x position update, but uses Math.cos(frameCount * 0.01) for oscillation to create perpendicular movement
                sprite.y += (noise(offsetY + frameCount * 0.01 + seed + uniqueFactorY) - 0.5) * 2 * Math.cos(frameCount * 0.01);
                // make sure to keep them within window bounds
                sprite.x = constrain(sprite.x, 0, windowWidth)
                sprite.y = constrain(sprite.y, 0, windowHeight);
            })
        }
        //mainCanvasContext.pop()
    
        // draw our bg image
        if(bgImage){
            p.image(bgImage, 0, 0, windowWidth, windowHeight);
        }
        // center our coordinate system
        // mainCanvasContext.push();
            const halfWidth = p.windowWidth / 2;
            const halfHeight = p.windowHeight / 2;
            mainCanvasContext.translate(halfWidth, halfHeight)
    
            // every second update the url with the current location
            // pan,zoom
            // TODO: put this in the background
            // if(frameCount % 60 === 0){
            //     let url = new URL(window.location.href);
            //     url.searchParams.set("panX", store.panX);
            //     url.searchParams.set("panY", store.panY);
            //     url.searchParams.set("zoom", store.zoom);
    
            //     // update the url
            //     window.history.replaceState({}, '', url);
            // }
            
            // NOTE: there is an issue where when you're zoomed in,
            // it's relative from the top left of the whole screen
            // we want zoom to pull the center towards where the mouse is
            // so 1 we need to calculate where the "center" is by getting
            // the value offset negative of any current pan
            // then find the difference between the mouse position and the center
            // if there's a difference > 0.01 between the center and the mouse
            // AND zoomChanged === true, then shift toward the center by nudging panX and panY
            // by a fraction of the difference between the mouse and the center
            // if(zoomChanged){
            //     let center = {
            //         x: panX * -1 * zoom,
            //         y: panY * -1 * zoom
            //     };
            //     let mouseToCenter = {
            //         x: mouseX - center.x,
            //         y: mouseY - center.y
            //     };
            //     let distance = Math.sqrt(mouseToCenter.x * mouseToCenter.x + mouseToCenter.y * mouseToCenter.y);
            //     const stepSize = -0.005;
            //     if (distance > 0.01) {
            //         panX += mouseToCenter.x < 0 
            //         ? mouseToCenter.x * stepSize 
            //         : mouseToCenter.x * -stepSize;
            //         panY += mouseToCenter.y < 0 
            //         ? mouseToCenter.y * stepSize 
            //         : mouseToCenter.y * -stepSize;
            //     }
            //     zoomChanged = false;
            // }
    
            // lerp mouseShifted towards a target
            let targetX = -p.mouseX + halfWidth;
            let targetY = -p.mouseY + halfHeight;
            if(!panningBG){
                // DISABLED
                // mouseShifted.x = p.lerp(mouseShifted.x, targetX, 0.1);
                // mouseShifted.y = p.lerp(mouseShifted.y, targetY, 0.1);
            }
    
            if(store.showDebugCursor){    
                DebugPathInstance.addPoint(
                    -mouseShifted.x, 
                    -mouseShifted.y, 
                    zoom+0
                );
                if(!store.DISABLE_DEBUG_PATHS){
                    DebugPathInstance.draw();
                }
                DebugPathTwo.addPoint(
                    -targetX, 
                    -targetY,
                    zoom+0
                )
                if(!store.DISABLE_DEBUG_PATHS){
                    DebugPathTwo.draw(40);
                }
            }
            
    
            // mainCanvasContext.translate(
            //     -mouseShifted.x, 
            //     -mouseShifted.y
            // );
            mainCanvasContext.scale(zoom);
            mainCanvasContext.translate(
                panX - (halfWidth*zoom), 
                panY - (halfHeight*zoom)
            );
    
            if(
                store.currentGraph 
                //&& !store.CmdPromptVisible
            ){
                store.currentGraph.renderGraph();
            }
            
            if (panningBG) {
                panX += mctx.mouseX - dragStartX;
                panY += mctx.mouseY - dragStartY;
                dragStartX = mctx.mouseX;
                dragStartY = mctx.mouseY;
            }
    
            if(gherkinStudio && gherkinStudio.draw){
                gherkinStudio.draw();
            }
    
            //drawModeSwitcher();
    
        // render all widgets on the widget dashboard
        system.dashboard.draw();
        
        // jump back to the main canvas context
        
        // reset any transforms
        // mainCanvasContext.pop();
    
        
    
        // ^^^ below the command palette
        if(store.renderNotificationsBelowCommands){
            // render toast notifications
            system.get("toastManager")?.draw?.();
        }
    
        // if the command palette is visible, draw it
        if(store.CmdPromptVisible){
            /** @see CmdPrompt.renderCommandPrompt */
            cmdprompt?.renderCommandPrompt?.();
        }

        /// vvv above the command palette
        if(1 || store.renderNotificationsAboveCommands){
            // render toast notifications
            system.get("toastManager")?.draw?.();
        }
    
        // display the current wizard (if any)
        store.activeWizard?.onDraw?.();
    
        
    
        
    
        renderDebugUI();
    
        // cursor is last to render
        cursor?.draw()    
    }
}
let mainCanvasContext = new p5(MainCanvasContextThing, "main-canvas-context");
window.mctx = mainCanvasContext;
// bind the global api so it can shift contexts
const properties = [
    'alpha', 'BOLD', 'BOTTOM', 'BLUR', 'CENTER', 'CORNER', 'CLOSE', 'LEFT', 'NORMAL', 'RIGHT', 'TOP', 'HALF_PI', 'PI', 'QUARTER_PI', 'TAU',
    'TWO_PI', 'constrain', 'cos', 'deltaTime', 'fill', 'frameCount', 'lerp', 'lerpColor', 
    'loadImage', 'map', 'millis', 'mouseX', 'mouseY', 'noFill', 'noTint', 'pmouseX', 'pmouseY',
    'triangle', 
    'pop', 'push', 'radians', 'rectMode', 'sin', 'stroke', 'strokeWeight', 'tint', 'translate', 
    'windowHeight', 'windowWidth', 'arc', 'beginShape', 'circle', 'color', 'createGraphics', 
    'ellipse', 'endShape', 'image', 'line', 'rect', 'scale', 'text', 'textAlign', 'textFont', 
    'textSize', 'textStyle', 'vertex', 'createElement'
];
function drawShape(name, options, context){
    //'arc', {x: arcX, y: arcY, radius: innerRadius, startAngle: this.arcStart, endAngle: arcEnd}
    //if(name === 'arc'){

    const ctx = context
    switch(name){
        case 'arc':
            ctx.beginShape();
            //ctx.arc(options.x, options.y, options.radius, options.startAngle, options.endAngle);
            let segments = 64;
            let angle = options.startAngle;
            let angleStep = (options.endAngle - options.startAngle) / segments;
            for(let i = 0; i < segments; i++){
                ctx.vertex(
                    options.x + Math.cos(angle) * options.radius,
                    options.y + Math.sin(angle) * options.radius
                );
                angle += angleStep;
            }
            ctx.endShape();
            break;
        default:
            console.warn('unknown shape', name);
            break;
    }
}
properties.forEach(prop => {
        Object.defineProperty(window, prop, {
            get: () => {
                // if it's a function pre-bind it
                if(typeof window.mctx[prop] === 'function'){
                    return window.mctx[prop].bind(window.mctx);
                }
                return window.mctx[prop];
            },
            set: (value) => window.mctx[prop] = value
        });
});


function generateRandomString(){
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 256);
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

class FluxExampleGraph extends Graph {
    constructor(options){
        super(options)

        this.nodes = [
            { id: 0, x: 125, y: 200, shape: 'triangle', label: 'Component' },
            { id: 1, x: 300, y: 50, shape: 'ellipse', label: 'Action' },
            { id: 2, x: 475, y: 50, shape: 'ellipse', label: 'Mutation' },
            { id: 3, x: 500, y: 200, shape: 'rect', label: 'State' }
        ];
        // hydrate the nodes
        this.nodes.forEach((_n,index)=>{
            _n.graph = this;
            this.nodes[index] = new GraphNode(_n);

            // hard-coded data binding example,
            // let's assume there's one input field defined in the Component node
            // so we'll pretend we sniffed it out
            // in the future we'll move this code
            // to the higher-level Graph class
            // so all Graphs can take advantage of the dynamic instantiation
            // of observed fields
            // used when viewing model versions of our Living Graphs / Graph Snapshots / Graph Traversal Debugger / REPL, thing...
            // Codename Status Trees
            if(_n.id === 0){
                const input = mctx.createInput('');
                input.parent('under-ui-elms')
                // name the input element and give it a throw-off autocomplete value too so it doesn't try to auto suggest anything
                input.elt.name = generateRandomString();
                input.elt.setAttribute('autocomplete', generateRandomString());


                // TODO: move position when the node moves / when we pan
                // account for pan and zoom
                input.position(_n.x + 10, _n.y + 10);
                this.nodes[index].addObservedInput(input);
            }
        })
        this.edges = [
            // component -> action
            { 
                from: 0, to: 1, 
                color: 'red', 
                fromAnchor: { x: 0, y: 30 }, 
                toAnchor: { x: 0, y: 30 } 
            },
            // action -> mutation
            {
                from: 1, to: 2,
                color: 'red',
                fromAnchor: { x: 0, y: 30 },
                toAnchor: { x: 0, y: 30 }
            },
            // mutation -> state
            {
                from: 2, to: 3,
                color: 'red',
                fromAnchor: { x: 0, y: 30 },
                toAnchor: { x: 0, y: 30 }
            },
            // state -> component
            {
                from: 3, to: 0,
                color: 'blue',
                fromAnchor: { x: 0, y: 0 },
                toAnchor: { x: 0, y: 0 }
            }
        ];
        this.eventFlow = [
            {from: 0, to: 1}, // component -> action
            {from: 1, to: 2}, // action -> mutation
            {from: 2, to: 3}, // mutation -> state
            {from: 3, to: 0}, // state -> component
        ]
    }
}

// simulate an ajax await'd action
class FluxAjaxExampleGraph extends Graph {
    constructor(options){
        super(options)
        // c -> a -> ajax -> a -> m -> s -> c
        this.eventFlow = [
            { from: 0, to: [1], delay: 0 }, // component -> action
            // note this one splits into two!!!
            { from: 1, to: [4, 2], delay: 0 }, // action -> ajax, action -> mutation (fork)
            { from: 2, to: [3], delay: 0 }, // mutation -> state
            { from: 3, to: [0], delay: 0 }, // state -> component (optimistic update)
            { from: 4, to: [1], delay: 1000 }, // ajax -> action (after 1000ms delay)
            { from: 1, to: [2], delay: 0 }, // action -> mutation
            { from: 2, to: [3], delay: 0 }, // mutation -> state
            { from: 3, to: [0], delay: 0 } // state -> component
        ];
        this.nodes = [
            { id: 0, x: 125, y: 200, shape: 'triangle', label: 'Component' },
            { id: 1, x: 370, y: 50, shape: 'ellipse', label: 'Action' },
            { id: 2, x: 650, y: 110, shape: 'ellipse', label: 'Mutation' },
            { id: 3, x: 424, y: 315, shape: 'ellipse', label: 'State' },
            { id: 4, x: 582, y: -71, shape: 'ellipse', label: 'Ajax' },
        ];
        // hydrate nodes as instances
        this.nodes.forEach((_n,index)=>{
            this.nodes[index] = new GraphNode({
                ..._n,
                graph: this
            });
        })
        this.edges = [
            // Component -{Dispatches}-> Action
            { 
                from: 0, to: 1, color: 'red', 
                label: 'Dispatches',
                fromAnchor: { x: 0, y: 30 }, 
                toAnchor: { x: 0, y: 30 } 
            },
            // Action -{Requests}-> Ajax
            { 
                from: 1, to: 4, color: 'red', 
                label: 'Requests',
                fromAnchor: { x: 0, y: 30 }, 
                toAnchor: { x: 0, y: 30 } 
            },
            // Ajax -{Responds}-> Action
            {
                from: 4, to: 1, color: 'blue',
                label: 'Responds',
                fromAnchor: { x: -30, y: 0 },
                toAnchor: { x: -30, y: 0 }
            },
            // Action -{Commits}-> Mutation
            { 
                from: 1, to: 2, color: 'red', 
                label: 'Commits',
                fromAnchor: { x: 0, y: 30 }, 
                toAnchor: { x: 0, y: 30 },
            },
            // Mutation -{Mutates}-> State
            {   
                from: 2, to: 3, color: 'red', 
                label: 'Mutates',
                fromAnchor: { x: 0, y: 30 }, 
                toAnchor: { x: 0, y: 30 },
            },
            // State -{Updates}-> Component
            {   
                from: 3, to: 0, color: 'red',
                label: 'Updates', 
                fromAnchor: { x: 0, y: 30 }, 
                toAnchor: { x: 0, y: 30 },
            }
        ];
    }
    
}

class EmptyGraph extends Graph {
    constructor(options){
        super(options)
        this.nodes = [];
        this.edges = [];
    }
}

/*

ctx.textAlign(LEFT,TOP);
let words = this.message.split(' ');
let lines = [];
let line = '';
let y = offsetY + 30;
for(let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = mctx.textWidth(testLine);
    let testWidth = metrics.width;
    if (testWidth > tBoxW && n > 0) {
        lines.push({ text: line, y: y });
        line = words[n] + ' ';
        y += metrics.height;
    }
    else {
        line = testLine;
    }
}
lines.push({ text: line, y: y });
lines.forEach(line => ctx.text(line.text, windowWidth - 10 - tBoxW + 10, line.y));
ctx.pop();
*/

function drawStringWordWrapped(string, x, y, lineHeight, fitWidth, ctx) {
    let words = string.split(' ');
    let line = '';
    let yLineOffset = 0;
    let lines = [];

    for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' ';
        let testWidth = ctx.textWidth(testLine);

        ctx.textAlign(LEFT,TOP)
        if (testWidth > fitWidth && i > 0) {
            lines.push({ text: line.trim(), x: x, y: y + (lineHeight / 2) + yLineOffset });
            line = words[i] + ' ';
            yLineOffset += ctx.textSize();
        } else {
            line = testLine;
        }
    }

    // console.warn("drawStringWordWrapped",{
    //     input: string,
    //     x, y, lineHeight, fitWidth, ctx,
    //     line_count: lines.length
    // })

    lines.push({ text: line.trim(), x: x, y: y + yLineOffset });

    lines.forEach(line => ctx.text(line.text, line.x, line.y));
}

// todo: make a multi-select version
class SuggestionList {
    selectedOptionIndex = -1;
    selectionOffset = 0;
    //maxVisibleOptionsCount = 5;
    get maxVisibleOptionsCount(){
        return store.maxVisibleOptionsCount;
    }
    constructor(){
        
    }
    logSelf(){
        console.warn(
            "SuggestionList:LogSelf",
            {
            SuggestionList: this,
            vizSuggestions: this.visibleSuggestions,
            allOptionsLength: this.allOptions.length,
            selectionOffset: this.selectionOffset,
            selectedOptionIndex: this.selectedOptionIndex,
            maxVisibleOptionsCount: this.maxVisibleOptionsCount,
        })
    }
    // get visibleSuggestions(){
    //     store.debug_latest_visible_suggestions_length = this.filteredOptions.length;
    //     return this.filteredOptions;
    // }
    // visually limited cursor view into the current suggestions
    get visibleSuggestions(){
        let output = [];
        let v = this.selectionOffset;
        // console.warn({
        //     'visible suggestions i:':i,
        //     maxVisibleOptionsCount: this.maxVisibleOptionsCount,
        //     allOptionsLength: this.allOptions.length,
        //     selectedOptionIDX: this.selectedOptionIndex,
        // })
        if(
            !this.filteredOptions
            || !this.filteredOptions?.length
        ){
            return output;
        }
        for(let i = 0; i < this.maxVisibleOptionsCount 
            && i < this.filteredOptions.length; i++) {
            let suggestion = this.filteredOptions[i];
            if(!suggestion){
                console.warn('suggestion is null?',{suggestion,i})
                continue;
            }
            let suggestionWidth = mctx.windowWidth * .66;
            let x = ( mctx.windowWidth / 2 ) - (suggestionWidth/2);
            let y = 10 + (i * 50);
            let w = suggestionWidth;
            let h = 50;
            let label = suggestion.name;
            let selected = this.selectedOptionIndex === i;
            output.push({
                x,y,w,h,label,selected
            })
        }
        //store.debug_vizSugLen = output.length;
        return output;
    }
    get filteredOptions(){
        if(!this.onGetFilteredOptionsCallback){
            throw new Error("callback never bound. must call bindGetFilteredOptions(callback)")
        }
        return this.onGetFilteredOptionsCallback();
    }
    // set filteredOptions(value){
    //     this.onSetFilteredOptionsCallback(value);
    // }
    get allOptions(){
        if(!this.onGetAllOptionsCallback){
            throw new Error("callback never bound. must call bindGetAllOptions(callback)")
        }
        return this.onGetAllOptionsCallback();
    }
    bindGetFilteredOptions(callback){
        this.onGetFilteredOptionsCallback = callback;
    }
    bindGetAllOptions(callback){
        this.onGetAllOptionsCallback = callback;
    }
    bindOnEnterPressed(callback){
        this.onEnterPressedCallback = callback
    }
    bindOnEscapePressed(callback){
        this.onEscapePressedCallback = callback
    }
    flagOptionSelected(index){

    }
    handleInput(event){
        // console.warn('suggestion list handleInput',{
        //     keyCode: event.keyCode,
        //     event
        // })
        switch(event.keyCode){
            // NEED TO THINK ABOUT HOW TAB SHOULD WORK...
            // case 9:
            //     // if they pressed tab, select the first suggestion (if any)
            //     if(this.selectedOptionIndex === -1 && this.filteredOptions.length){
            //         // update the command buffer
            //         store.commandBuffer = {
            //             name: this.filteredOptions?.[0]?.name
            //         };
            //         return true;
            //     }
            //     break;
            case 40:
                return this.onPressDown(event)
            case 38:
                return this.onPressUp(event);
            case 27:
                return this.onEscapePressedCallback();
            case 13:
                let result = this.OnPressEnter(event);// this.onEnterPressedCallback()
                //this.selectedOptionIndex = -1;
                return result;
            default:
                // console.warn('input fell through SuggestionsList.handleInput',{
                //     keyCode: event.keyCode,
                //     event
                // })
                // make sure the selected option index is in range
                if(this.selectedOptionIndex >= this.filteredOptions.length){
                    this.selectedOptionIndex = this.filteredOptions.length - 1;
                }
                else if(this.selectedOptionIndex === null
                    || this.selectedOptionIndex === undefined
                    || this.selectedOptionIndex === -1)
                {
                    if(this.filteredOptions.length){
                        this.selectedOptionIndex = 0;
                    }
                }
                break;
        }
    }
    onPressUp(event){
        // ignore keyup events
        if(event.type === 'keyup'){
            return;
        }
        // console.warn('SuggestionList.onPressUp',{
        //     selectedOptionIndex: this.selectedOptionIndex,
        //     allOptionsLength: this.allOptions.length,
        //     maxVisibleOptionsCount: this.maxVisibleOptionsCount,
        //     selectionOffset: this.selectionOffset
        // })
        // up arrow was pressed
        if(this.selectedOptionIndex === -1){
            // NOOP for now
            //this.selectedOptionIndex = this.allOptions.length - 1;
            // TODO: dig into command history once we're storing it
        }else if(this.selectedOptionIndex > 0){
            // still results above the selected one, go to it
            this.selectedOptionIndex--;
        }else{
            // loop back to the last suggestion
            this.selectedOptionIndex = this.allOptions.length - 1;
            // if the selectionOffset is greater than zero, decrement it
            if(this.selectionOffset > 0){
                this.selectionOffset--;
                this.selectedOptionIndex = this.allOptions.length > this.maxVisibleOptionsCount ?
                    this.maxVisibleOptionsCount - 1
                    : this.allOptions.length - 1;
            }
            // else{
            //     // calculate the offset required to show the last result in
            //     // the last spot of the limited view
            //     // NOTE: if the current list is under the max visible count, this will be negative, so we need to only use it if it's positive
            //     if(this.allOptions.length > this.maxVisibleOptionsCount){
            //         this.selectionOffset = this.allOptions.length - this.maxVisibleOptionsCount;
            //     }
            // }
        }
    }
    onPressDown(event){
        // ignore keyup events
        if(event.type === 'keyup'){
            return;
        }

        // console.warn('SuggestionList.onPressDown',{
        //     selectedOptionIndex: this.selectedOptionIndex,
        //     allOptionsLength: this.allOptions.length,
        //     maxVisibleOptionsCount: this.maxVisibleOptionsCount,
        //     selectionOffset: this.selectionOffset
        // })
        if(this.selectedOptionIndex === null){
            // start with the first, topmost one
            this.selectedOptionIndex = 0;
        }else if(this.selectedOptionIndex < this.allOptions.length - 1){
            this.selectedOptionIndex++;
            // if we've gone out over this.maxVisibleOptionsCount, 
            // increment the offset and reset the selectedOptionIndex
            if(this.selectedOptionIndex >= this.maxVisibleOptionsCount){
                this.selectionOffset++;
                this.selectedOptionIndex = 0;
            }
        }else{
            // loop back to the first suggestion
            this.selectedOptionIndex = 0;
            this.selectionOffset = 0;
        }
        //console.warn('selectedOptionIndex',this.selectedOptionIndex)
    }
    OnPressEnter(event){
        // ignore keyup events
        if(event.type === 'keyup'){
            return;
        }
        console.warn('SuggestionList:OnPressEnter');
        event.preventDefault();

        this.onEnterPressedCallback();

        // we handled it
        return true;
    }
    draw(ctx){
        this.drawSuggestedOptions(ctx);
    }
    drawSuggestedOptions(ctx){
        store.rendererStarted = true;
        
        // aka FilteredOptions
        if(!this.visibleSuggestions?.length){
            //this.logSelf();
            //throw new Error("visibleSuggestions is empty!")
            store.rendererHasOptionsToRender = false;
            return;
        }
        store.rendererHasOptionsToRender = true;
        
        const offsetY = 200;

        // render the list of the top maxVisibleOptionsCount suggestions
        this.visibleSuggestions.forEach((suggestion, i) => {
            const {x,y,w,h,label,selected} = suggestion;
            if(
                x === undefined 
                || y === undefined 
                || w === undefined 
                || h === undefined
            ){
                    console.warn({
                        vizSuggestions: this.visibleSuggestions,
                        suggestion
                    })
                throw new Error("BAD VALUES!");
            }
            // console.warn('visibleSuggestion',{
            //     x,y,w,h,label,selected,suggestion
            // })
            this.renderSuggestionOption(
                x,
                offsetY+y,
                w,
                h,
                label,
                selected,
                ctx
            );
        })
    }
    /**
     * 
     * @param {float} x 
     * @param {Number} y 
     * @param {Number} w 
     * @param {Number} h 
     * @param {string} label 
     * @param {boolean} selected 
     * @param {p5.p5jsContext} ctx 
     */
    // searchable words:
    // draw suggested / drawSuggested drawSuggestion
    // drawSuggestedOption / drawSuggestionOption
    renderSuggestionOption(x,y,w,h,label,selected,ctx){
        


        ctx.push();
        ctx.translate(x,y);
        ctx.scale(zoom);
        ctx.rectMode(CORNER);
        ctx.stroke(255,255,255,100)
        ctx.strokeWeight(selected ? 3 : 1);
        // draw box
        ctx.fill(selected ? "purple" : ctx.color(25))
        ctx.translate(x,y)
        ctx.rect(0,0,w,h);
        ctx.fill(255)
        ctx.strokeWeight(3);
        ctx.textSize(40);
        // draw label
        drawStringWordWrapped(
            label,
            10,
            10,
            20,
            w - 20,
            ctx
        )

        // NEW: add an image if we have one for this command
        // if not add a placeholder based on "icon_NEW_COMMAND.png"

        // for now, just draw a cached copy of icon_NEW_COMMAND.png
        // TODO: scale things so the image (no matter its native dimensions) are stretched to fill the provided 50x50 space and make sure it has a rounded corner
        /** @see System.image */
        const img = system.image("icon_NEW_COMMAND.png");
        ctx.imageMode(CORNER);
        ctx.image(img, 10, 10, 50, 50);
        ctx.beginShape();
        ctx.vertex(10, 10);
        ctx.vertex(10 + 50, 10);
        ctx.quadraticVertex(10 + 50, 10 + 50, 10, 10 + 50);
        ctx.endShape(CLOSE);

        

        ctx.pop()

        
    }
}

function stopDragging() {
    stepPanMomentum();

    if(!store.currentGraph){
        return;
    }
    
    store.currentGraph.selectedNodeIDs = [];
}

// TODO: map this to an ObservedTextInputField
// so our graph can properly kick events into the correct graph assigned to the text input
// TODO: allow graphs to continue executing in the background in a headless mode
// TODO: a process manager for showing which graphs are currently running
// function handleInput() {
//     if (keyCode === ENTER) {
//         addNode();
//         return;
//     }
//     let inputValue = input.value();
//     let event = { 
//         id: store.eventId++, 
//         value: inputValue, 
//         progress: 0, 
//         flowIndex: 0, // replaces stage
//     };
//     if (event.keyCode === BACKSPACE) {
//         event.key = 'backspace';
//     } else {
//         event.key = inputValue.slice(-1);
//     }
//     store.events.push(event);
//     store.viewValue = inputValue; // Change inputValue to event.key
//     store.lastReceived = Date.now();
// }

// TODO: refactor addNode to be a method on the Graph class
function addNode() {
    let nodeType = input.value().toLowerCase();
    if ([
        'view', 
        'controller', 
        'model', 
        'action', 
        'mutation', 
        'state'
    ].includes(nodeType)) {
        store.nodes.push(createNewNode(nodeType));
    } else {
        store.nodes.push(createErrorNode());
    }
    input.value(''); // Clear the input after adding a node
}

function createNewNode(type) {
    const typeShapes = {
        controller: 'ellipse',
        view: 'triangle',
        model: 'rect',
        action: 'ellipse',
        mutation: 'rect',
        store: 'rect',
        dispatch: 'ellipse',
        mutate: 'rect',
        state: 'rect'
    }
    // Add logic to position the new node appropriately
    return { id: store.nodes.length, x: 100, y: 100, shape: typeShapes[type], label: type.charAt(0).toUpperCase() + type.slice(1) };
}

function createErrorNode() {
    return { id: store.nodes.length, x: 100, y: 100, shape: 'errorRect', label: 'Invalid Node Type' };
}

function drawErrorNode(node) {
    fill(255, 0, 0);
    rect(node.x, node.y, 150, 50);
    fill(255);
    text('Invalid node type specified', node.x, node.y);
}

function drawShape(x, y, type) {
    const shapeMatchesOppositeEnd = true; //nodeValue === otherNodeValue;
    let borderColor = (Date.now() - store.lastReceived < 300) 
        // yellow (recently changed)
        ? color(255, 255, 0) 
        : (shapeMatchesOppositeEnd) 
            // shape matches opposite end (green)
            ? color(0, 255, 0) 
            // out of sync (red)
            : color(255, 0, 0);
    stroke(borderColor);
    fill(100 + (type === 'rect' ? 0 : 50));
    switch (type) {
        case 'rect':
            rectMode(CENTER);
            rect(x, y, 100, 100, 20);
            break;
        case 'ellipse':
            ellipse(x, y, 100, 100);
            break;
        default:
            if(typeof triangle === 'undefined' || !triangle?.call){
                //console.error("triangle fn missin?")
                return;
            }
            mainCanvasContext.triangle(x - 40, y + 40, x + 40, y + 40, x, y - 40);
    }
    // fill(0);
    // textAlign(CENTER, CENTER);
    //text(nodeValue, x, y);
    // if(type === 'triangle'){
    //     fill(0, 0, 255);
    //     text(otherNodeValue, x, y + 20);
    // }
}

function drawLabel(x, y, label) {
    fill(255);
    textAlign(CENTER, BOTTOM);
    text(label, x, y + 70);
}

// function drawLines() {
//     store.edges.forEach((edge) => {
//         let currentNode = store.nodes[edge.from];
//         let nextNode = store.nodes[edge.to];
//         stroke(edge.color);
//         line(
//             currentNode.x + edge.fromAnchor.x, 
//             currentNode.y + edge.fromAnchor.y, 
//             nextNode.x + edge.toAnchor.x, 
//             nextNode.y + edge.toAnchor.y
//         );
//         if(edge.label){
//             let halfX = (currentNode.x + nextNode.x) / 2;
//             let halfY = (currentNode.y + nextNode.y) / 2;
//             drawLabel(halfX, halfY, edge.label)
//         }
//     });
// }


function nodesForFlowIndex(flowIndex){
    if(flowIndex === undefined || flowIndex === null){
        throw new Error('flowIndex not given');
    }
    if(!store.eventFlow[flowIndex]){
        return {fromNode: null, toNodes: []};
    }
    let stage = store.eventFlow[flowIndex];
    if(!stage){
        throw new Error(`no stage for flowIndex ${flowIndex}`)
    }
    if(stage?.from === null || stage?.from === undefined){
        console.warn('stage has no "from" ? ',{stage})
        throw new Error('stage must have a from node')
    }
    if(!Array.isArray(stage.to)){
        stage.to = [stage.to];
    }
    let fromNode = store.nodes[stage.from];
    let toNodes = []; 
    stage.to.forEach(to => {
        let toNode = store.nodes[to];
        if(!toNode){
            throw new Error(`stage ${stage.from} -> ${to} has no toNode`)
        }
        toNodes.push(toNode);
    })
    return {fromNode, toNodes};
}

class StateMachine {
    currentStateID = null
    states = {}
    transitionMatrix = {}
    defaultStateID = null
    nestedSMs = {}
    constructor({
        states, 
        defaultStateID, 
        transitionMatrix
    }) {
        // Initialize the state
        this.states = states;
        this.transitionMatrix = transitionMatrix;
        this.defaultStateID = defaultStateID;
        this.currentStateID = defaultStateID;
    }

    get state(){
        return this.states[this.currentStateID]
    }

    debugPrintCoverage(){
        let output = "";

        Object.entries(this.transitionMatrix).forEach(([fromStateID, toStateIDs])=>{
            Object.entries(toStateIDs).forEach(([toStateID, transitionAllowedBool])=>{
                output += `${transitionAllowedBool ? 'valid':'invalid'} transition: ${fromStateID} -> ${toStateID}\n`;
            })
        })

        system.warn(
            'StateMachine:debugPrintCoverage output:...',
            {
                output: output.split("\n").join("\n\n")
            }
        )
    }

    // Method to set a new state
    setState(newStateID) {
        //console.warn('StateMachine:setState',{newStateID})
        if(!this.canTransition(newStateID)){
            system.panic(`StateMachine:setState: invalid transition! ${this.currentStateID} -> ${newStateID}`);
            return;
        }

        // based on the "prev" (current) state ID and the "next" (new) state ID,
        // determine which transition to attempt to run
        // const transition = this.transitionMatrix?.[this.currentStateID]?.[newStateID];
        // if(transition){
        //     // nextID, prevID, nextState, prevState
        //     transition.call(
        //         newStateID, 
        //         this.currentStateID, 
        //         this.states[newStateID], 
        //         this.state
        //     );
        // }

        this.currentStateID = newStateID;
    }

    canTransition(newStateID){
        // aka checkValidity
        const tx = this.transitionMatrix?.[this.currentStateID]?.[newStateID];
        if(!tx){
            console.error('FSM: canTransition: Failed valid check', {
                currentStateID: this.currentStateID,
                newStateID,
                transitionMatrix: this.transitionMatrix,
                tx
            })
            //this.debugPrintCoverage();

            // did you forget to allow() the transition between the two states?
            system.panic(`StateMachine:canTransition: invalid transition! ${this.currentStateID} -> ${newStateID}`);
            return false;
        }

        //system.success(`valid transition! ${this.currentStateID} -> ${newStateID}`);
        return true;
    }
}

class VirtualMachine extends StateMachine {
    constructor() {
        super();
        // Initialize the memory
        this.memory = new Map();
        // Initialize the internal clock
        this.clock = 0;
    }

    // Method to get the current time
    getTime() {
        return this.clock;
    }

    // Method to set the time
    setTime(newTime) {
        this.clock = newTime;
    }

    // Method to increment the time
    tick() {
        this.clock++;
    }

    // Method to get a value from memory
    getFromMemory(key) {
        return this.memory.get(key);
    }

    // Method to set a value in memory
    setInMemory(key, value) {
        this.memory.set(key, value);
    }

    // Method to reset the memory
    resetMemory() {
        this.memory = new Map();
    }
}

class REPL extends VirtualMachine {
    constructor() {
        super();
        // Initialize the sandbox
        this.sandbox = {};
    }

    // Method to evaluate a string of code within the sandbox
    evaluate(code) {
        // Use a try-catch block to handle errors
        try {
            // Use the Function constructor to create a new function with the code
            // The sandbox is passed as an argument to provide a controlled environment
            let func = new Function('sandbox', `with(sandbox) { ${code} }`);
            // Call the function with the sandbox as the argument
            let result = func(this.sandbox);
            // Return the result of the evaluation
            return result;
        } catch (error) {
            // If an error occurs during evaluation, log it and return undefined
            console.error('Error during evaluation:', error);
            return undefined;
        }
    }

    // Method to reset the sandbox to an empty state
    resetSandbox() {
        this.sandbox = {};
    }

    // Method to pause the sandbox
    // This is a placeholder as JavaScript doesn't support pausing execution
    // You might replace this with code to set a "paused" state and check it in your evaluate method
    pauseSandbox() {
        console.warn('Pause functionality is not supported in JavaScript');
    }
}

class AnimalWidget extends Widget {
    widgetSize = {
        width: 100,
        height: 100
    }
    onDraw(){
        super.onDraw(...arguments)
    }
}
class DogWidget extends AnimalWidget {
    onDraw(){
        super.onDraw(...arguments)

        this.ctx.fill("brown")
        .stroke("black")
        .strokeWeight(2)
        .circle(0,0,50)
    }
}
class CatWidget extends AnimalWidget {
    onDraw(){
        super.onDraw(...arguments)

        this.ctx.fill("orange")
        .stroke("black")
        .strokeWeight(2)
        .circle(0,0,50)
    }
}
class BirdWidget extends AnimalWidget {
    onDraw(){
        super.onDraw(...arguments)

        this.ctx.fill("green")
        .stroke("black")
        .strokeWeight(2)
        .circle(0,0,50)
    }
}
class FishWidget extends AnimalWidget {
    onDraw(){
        super.onDraw(...arguments)

        this.ctx.fill("blue")
        .stroke("black")
        .strokeWeight(2)
        .circle(0,0,50)
    }
}

class REPLCommand extends Widget {
    onDraw(){
        super.onDraw(...arguments)
        fill("purple")
        rect(0,0,100,100)
        fill("white")
        text("ok")
    }
}

class REPLWidget extends Widget {
    repl = null;
    constructor(){
        super();
        this.repl = new REPL();

        this.commandBuffer.push(new REPLCommand());
    }
    widgetSize = {
        widthViewUnits: 100,
        heightViewUnits: 100,

        // for now
        width: 800,
        height: 600,
    }
    // un-saved buffer for sorting behaviors
    commandBuffer = []

    executionOutputHistory = []

    bufferOrderHistory = []

    onDraw(){
        super.onDraw()
        this.commandBuffer.forEach((command, index)=>{
            command.draw();
        })
        rect(0,0,100,100)
    }


    // // Bare bones REPL to add two numbers
    // addTwoNumbers() {
    //     // Get input from user
    //     let input = prompt("Enter two numbers separated by a comma:");
    //     // Split the input into two numbers
    //     let numbers = input.split(',').map(Number);
    //     // Add the numbers together
    //     let result = numbers[0] + numbers[1];
    //     // Log the result
    //     console.log(result);
    //     // Return the result
    //     return result;
    // }

}

// Feature IDEA: commented code falls to bottom of the code ocean and is "sunk"

// so Find is based on data not text order (hello go to Symbol!!!) @see GotoSymbol

// Show Symbol

// class TimerWidgetConfig {
//     name = "New Timer Widget"
//     steps = [
//         {
//             question: "Loading...",
//             onStepLoaded(wiz){
//                 system.registerWidget(new TimerWidget())
//                 system.hideCmdPrompt();
//             }
//         }
//     ]
//     finalCallback(wiz){

//     }
// }