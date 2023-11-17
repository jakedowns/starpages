/*  
    Free Palestine
    End Imperilism
    Land Back
    Reparations Now
    ---
    TODO: allow system to run headless in node.js env
    TODO: get system headless server version talking to client version
    TODO: get server sending text, email, sms, apn, web push notifications, etc
*/
// Singletons
let gherkinRunnerWidget = null;
let toastManager = null;

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
        console.error(message);
        // show a toast
        toastManager.showToast(message, {
            pinned: true, 
            // TODO: changing level to error could 
            // flip pinned to true by default if we want
            // users could opt-out of a error toast auto-pinning
            // via a config option...
            level:TOAST_LEVELS.ERROR
        });
    }
    // get panic(){
    //     return this._panic;
    // }
}
class System {
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
    innerClockTime = -1; 
    constructor(manager){
        this.manager = manager;
    }
    panic(message){
        this.manager.panic(message);
    }
}
const rootSystemManager = new SystemManager();
const rootManager = rootSystemManager; // alias
const root = rootManager; // alias
const manager = rootManager; // alias
// construct our root system and attach our root manager

// more singletons
let system;
let rootSystem; // alias

// Automatically registers Command classes with the
// Default Command Prompt Suggestions
let defaultSuggestedCommands = []
const DefaultSuggestionDecorator = function(command, wizardConfigInstance){
    if(!wizardConfigInstance || !wizardConfigInstance?.name){
        console.error({
            command,
            wizardConfigInstance
        })
        throw new Error("Bad usage of DefaultSuggestionDecorator, wizardConfigInstance must be defined and have a name")
    }
    // singleton
    let s = new command(wizardConfigInstance.name, {
        wizardConfig: wizardConfigInstance
    });
    // console.log('instance of ',{
    //     command, 
    //     wizardConfigInstance, 
    //     singleton: s
    // })
    // early registration before instance is created
    defaultSuggestedCommands.push(s);
    let index = defaultSuggestedCommands.length - 1;
    // console.warn(
    //     'DefaultSuggestedCommandsArrayLen:',
    //     defaultSuggestedCommands.length
    // )
    return function(...args){
        // hot-swap when the instance is created
        defaultSuggestedCommands[index] = new command(...args);
        return defaultSuggestedCommands[index];
    }
}

class Config
// extends DynamicThingDecorator(DynamicThing)
{
    // TODO: add validation for required fields that
    // all Instances of "Config" must have
    steps = [{
        notice: "Default Wizard Config Step"
    }]
    finalCallback(wizardInstance){
        console.warn("Default Wizard Config Final Callback \n"+
        "override this in your Custom Config class extended definition",
        {wizardInstance});
    }
}

// Define the Command class
class Command {
    name = 'default command';
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
        console.warn('Command.execute:',
        {
            name: this.name,
            hasWizard: this.wizardConfig ? true : false,
            hasCallback: this.options.callback ? true : false,
            hasExecuteFn: this.execute ? true : false,
            options: Object.keys(this.options),
            _options: this.options
        })
        if(this.options.wizardConfig){
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
        // reset command buffer
        store.commandBuffer = {};
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
class GherkinSequenceValidator {
    validationErrors = []
    sequence = null;
    constructor(sequence){
        this.sequence = sequence
    }
    get steps(){
        return this.sequence;
    }
    validateSequence(sequence){
        // reset: clear validation errors
        this.validationErrors = [];
        console.warn('validateSequence',{
            sequence,
            thisSequence: this.sequence
        })
        this.sequence = sequence ?? this.sequence;
        if(!this.sequence){
            system.panic("GherkinSequenceValidator.validateSequence requires a sequence to validate")
        }
        this.sequence.forEach((step,index)=>{
            this.checkStepIsValid(step,this.sequence,index)
        })
        return this.validationErrors.length === 0;
    }
    // TODO: maybe better as:
    // Feature: ""
    // Scenarios: {
    //    scenarioNameOne: Steps[], 
    //    scenarioNameTwo: Steps[], 
    //    scenarioNameThree: Steps[]
    //}
    checkStepIsValid(step,steps,index){
        let prevStep = steps[index-1];
        let prevDifferentStep = this.closestPreviousDifferentStep(steps,index);
        
        // walk backwards until we find a step of a different type
        switch(step.type){
            case 'Feature':
                return prevStep == null;
            case 'Scenario':
                return prevStep == 'Feature' || prevStep == 'Then';
            case 'Given':
                // if the previousDifferentStep is null || Given, it's valid
                return prevStep == null || prevStep?.type === 'Given';
            case 'When':
                return prevStep?.type == 'Given' || prevStep?.type == 'When';
            case 'Then':
                return prevStep?.type == 'When' || prevStep?.type == 'Then';
            default:
                system.panic(`Invalid Step Type In GherkinSequence:\n ${step.type} after a ${prevStep?.type ?? 'null'} at index ${index}`)
                break;
        }
    }
    closestPreviousDifferentStep(steps,index){
        if(!steps[index-1]){
            return null;
        }
        let prevStep = steps[index-1];
        let step = steps[index]
        if(prevStep.type !== step.type){
            return prevStep;
        }
        return this.closestPreviousDifferentStep(steps,index-1);
    }
    
}
class GherkinSequence {
    steps = [];
    constructor(steps){
        // validate sequence 
        // as it's constructed
        steps.forEach((step)=>{
            this.addStep(step);
        })
    }
    addStep(step){
        let seqNext = [...this.steps,step];
        let validator = new GherkinSequenceValidator(seqNext);
        let isValid = validator.validateSequence();
        if(!isValid){
            system.panic("addStep: invalid sequence: " + validator.validationErrors.join(","));
        }
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
    validateSequence(){
        if(!this.sequence || !this.sequence.instanceOf(GherkinSequence)){
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
            if(!this.sequence.instanceOf(GherkinSequence)){
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
        this.name = name;
    }
}
class UndoRedoComponent extends Component {
    // maybe better as a decorator?
}
class Widget extends UndoRedoComponent {
    constructor(name){
        super(name);

        // should we decorate this class with any functionality?
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

class FeatureDescription {

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

class NewTableWizardConfig extends Config {
    name = "New Table..."
    steps = [
        // { question: "What is the name of the table" },
        // { question: "How Many Rows?", answerDefaultValue = 3 },
        // { question: "How Many Columns?", answerDefaultValue = 3 },
    ]
    finalCallback(wiz){
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
extends DefaultSuggestionDecorator(Command, new NewTableWizardConfig()) {}

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

// NOTE: we pre-process these
// and convert them to GherkinFeature objects
// filled with an Object of keyed GherkinScenario objects
// which in turn are filled with GherkinStep objects
class FeatureTestTables extends FeatureDescription {
    background = [
        // alias "given a fresh system" ~ "given a fresh root system"
        "given a fresh, pre-booted sandboxed system instance"
    ]
    scenarios = {
        "system creates a table at boot": [
            // alias "given a fresh system" ~ "given a fresh root system"
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
        "user can save a table": [],
        "user can load a table": [],
        "user can delete a table": [],
        "user can name a table": [],
        "user can rename a table": []
    }
}
// EndRegion: Tables / Nested Tables


class ClockWidget extends Widget {}
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
    async run(){
        await this.gherkinRunner.run();
    }
    // render the widget
    render(){
        // rounded rect with status lights in rows and columns
        // each status light is a circle with a label
        // each status light is a different color
        // each status light represents the status of a passing or 
        // failing part of the current feature run
        let x = 0;
        let y = 0;
        let widgetWidth = 300
        let widgetHeight = 300
        this.gherkinRunner.results.forEach((result,index)=>{
            // remember to increment x and y
            // and fit the lights into the widget
            fill(result.color);
            circle(x,y,10);
            x += 20;
            if(x > widgetWidth){
                x = 0;
                y += 20;
            }
        })
        super.render();
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

const TOAST_LEVELS = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
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

// Add a keyboard listener for cmd shift p
document.addEventListener('keydown', function(event) {
    if (event.code === 'KeyP' && event.shiftKey && event.metaKey) {
        if(!store.commandPaletteVisible){
            new ShowCommandPaletteCommand().execute();
        }else{
            new HideCommandPaletteCommand().execute();
        }
    }
});


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
    constructor({x,y,r,c,s}){
        this.x = x;
        this.y = y;
        this.r = r;
        this.c = c;
        this.s = s;
    }
    draw(){
        fill(this.c);
        circle(this.x,this.y,this.r);
        strokeWeight(this.s);
        stroke(this.s);
        fill(255);
        text(this.name,this.x+this.r+5,this.y-this.r);
    }
}

// Define the initial state of the store
let store = {
    interactionMode: MODES.PAN,

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
    commandPaletteVisible: false,

    activeWizard: null,
    // user defined commands
    // todo: load these from local storage / remote storage
    // todo: cache these to local storage / remote storage
    customCommandFactories: {},
    customCommandInstances: {},

    currentGraph: null,

    maxVisibleOptionsCount: 10,

    dynamicStuff: {},

    status_lights: {
        rendererStarted: new StatusLight({
            name: 'rendererStarted',
            x: 30,
            y: 30,
            r: 15,
            s: 3,
            c: 'red'
        }),
        rendererHasOptionsToRender: new StatusLight({
            name: 'rendererHasOptionsToRender',
            x: 60,
            y: 30,
            r: 15,
            s: 3,
            c: 'red'
        }),
    },

    tables: []
};

console.warn('TODO: 1 store per sandbox');

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

/* Note: due to Gherkin syntax parsing requirements:

    givens CAN be chained onto other givens
    givens CAN also be chained onto whens
    but givens CANNOT be chained onto thens
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

class WizardController {
    name = 'default wizard';
    currentStepIndex = 0;
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
        this.currentStepIndex = stepIndex;
        this.shownSteps.push(this.currentStepIndex);
        // drawSuggestions automatically updates based on the current step
        this.currentStep?.onStepLoaded?.call(this,this);
        
    }
    /** @return bool - did we click a _visible_ suggestion rect? */
    checkDidClickASuggestion(){
        console.warn('TODO: check did click a suggestion')
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
                input: commandPaletteInput.value(),
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
        if(this.currentStep?.onStepUnload){
            this.currentStep.onStepUnload.call(this, this);
        }

        // TODO: make a global cmdprompt.reset() function
        // and a default onStepCompleted -> cmdprompt.reset() call
        // can opt out with wizardConfig.dontResetInputBetweenSteps = true
        if(!this.dontResetInputBetweenSteps){
            commandPaletteInput.value("")
            store.commandBuffer = {name: commandPaletteInput.value()}
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
            fcbString: this.config.finalCallback.toString()
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
        this.wizardSuggestionList.draw();
    }
    drawCurrentStep(){
        const cStep = this.currentStep;
        const questionTitle = cStep?.questionTitle ?? 'Question';
        const question = cStep.question;
        // todo cache interpreted string that replaces {prevResp} with the previous response
        // console.warn('displaying wizard step question',{
        //     currentStepIndex:this.currentStepIndex,
        //     question
        // });

        // render the name of the current command in the top right
        textAlign(RIGHT,TOP);
        textStyle(BOLD)
        text(`${this.name}`, windowWidth - 20, 20);

        // render the question
        let offsetY = 30;
        fill(255)
        textAlign(LEFT,TOP);
        textStyle(BOLD)
        text(`${questionTitle}`, 20, offsetY + 20);
        textStyle(NORMAL)
        text(`${question}`, 20, offsetY + 50);
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
                //this.OnPressEnter.call(this,event);
                break;
            case 38:
                //this.OnPressUp.call(this,event);
                return this.wizardSuggestionList.OnPressUp.call(
                    this.wizardSuggestionList,
                    event
                )
                break;
            case 40:
                //this.OnPressDown.call(this,event);
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
        
        new HideCommandPaletteCommand().execute();

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

/** 
 * this is a dynamic, user-configurable command that can be created at runtime
*/
class CustomCommandFactory {
    name = "My Custom Command Factory"
    // the configuration of the command
    options = {}
    _id = null;
    constructor(options){
        this.options = options ?? {};
    }
    get id(){
        // if(this._id === null){
        //     this._id = this.generateID();
        // }
        return this.options?.id;
    }
    execute(){
        console.warn('OnCustomCommandFactoryExecute')
        if(this.options?.execute){
            this.options.execute.call(this);
        }
    }
}

class CommandStepConfig {

}

class CommandStep {

}

class NewCommandWizardConfig
extends Config {
    name = "New Command..."
    steps = [
        {
            question: "What is the name of the command?",
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
                toastManager.showToast(`Created Custom Command Factory: ${myNewCommandID}`, {pinned: false});
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
    }
}
class NewCommandCommand
extends DefaultSuggestionDecorator(Command, new NewCommandWizardConfig()){}

class RunGherkinCommand
extends DefaultSuggestionDecorator(Command, new RunGherkinCommandWizardConfig()){}

class AddGraphNodeCommand
extends DefaultSuggestionDecorator(Command, new AddGraphNodeWizardConfig()){}

/*
class NewFlashCardGame
extends DefaultSuggestionDecorator(Command, new FlashCardGameWizardConfig()) {}

class NewMatchingCardGame
extends DefaultSuggestionDecorator(Command, new MatchingCardGameWizardConfig()){}

class NewKlondikeSolitaireGame
extends DefaultSuggestionDecorator(Command, new KlondikeSolitaireGameWizardConfig()){}

class NewMatch3Game
extends DefaultSuggestionDecorator(Command, new Match3GameWizardConfig()){}

class NewChatRoom
extends DefaultSuggestionDecorator(Command, new ChatRoomWizardConfig()){}

class LoadMessengerWindowCommand
extends DefaultSuggestionDecorator(Command, new LoadMessengerWindowWizardConfig()){}
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
    //     commandPaletteInput.value("")
    //     commandBuffer = {name: commandPaletteInput.value()}
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

class StartChatGPTSessionCommand
extends DefaultSuggestionDecorator(Command, new GPTChatSessionWizardConfig()){}

class NewToastWizardConfig
extends Config {
    name = "New Toast"
    steps = [{
        question: "What is the message of the toast?",
        answerStorageKey: "message",
        // todo: min / max length
        answerValidationRules: 'required:string'
    }]
    finalCallback(wizardInstance){
        toastManager.showToast(
            wizardInstance.stepResponses[0].input,
            {pinned: false}
        );
        commandPaletteInput.value('');
        new HideCommandPaletteCommand().execute();
    }
}

class ShowNewToastCommand 
extends DefaultSuggestionDecorator(Command, new NewToastWizardConfig()){}

// Define the ShowCommandPaletteCommand class
class ShowCommandPaletteCommand extends Command {
    constructor(){
        super("Show Command Prompt")
    }
    execute(){
        super.execute();

        // Show Command Prompt
        store.commandPaletteVisible = true;

        // focus the command palette input element
        commandPaletteInput.elt.focus();
    }
}

// Define the HideCommandPaletteCommand class
class HideCommandPaletteCommand extends Command {
    constructor(){
        super("Hide CMD Prompt")
    }
    execute(){
        super.execute();

        // clear the command buffer
        store.commandBuffer = {name:''};
        commandPaletteInput.value('');

        // Hide CMD Prompt
        store.commandPaletteVisible = false;
    }
}

// Define the ToggleCommandPaletteCommand class
class ToggleCommandPaletteCommand extends Command {
    constructor(){
        super("Toggle CMD Prompt")
    }
    execute(){
        super.execute();

        // Toggle CMD Prompt
        store.commandPaletteVisible = !store.commandPaletteVisible;
    }
}

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
        let mousePos = createVector(adjustedMouseX, adjustedMouseY);

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

class WizardConfig {
    name = 'WizardConfig'
    steps = []
    constructor(name){
        this.name = name ?? this.name
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

        new HideCommandPaletteCommand().execute();
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
class TimerWizardConfig extends WizardConfig {
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
    return typeof thing === 'undefined' || thing === null || thing?.trim?.() === '' ? true : false;
}

class ToastNotification {
    message = ''
    options = {}
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
    // drawToast renderToast
    // TODO: levels (info, warn, error, success)
    draw(index){
        if(this.state === 'destroyed'){
            return;
        }
        let offsetY = 30 * index;
        let leavingAlpha = this.state === 'leaving' 
            ? (255 - ((Date.now() - this.leaveTime) / (this.destroyTime - this.leaveTime)) * 255)
            : 255;
        leavingAlpha = Math.floor(leavingAlpha);
        stroke(0, 0, 0, leavingAlpha); 
        fill(25, 25, 25, leavingAlpha);
        const tBoxW = 300;
        const cornerRadius = 20;
        rect(windowWidth - 10 - tBoxW, 20 + offsetY, tBoxW, 100, cornerRadius);
        fill(255, 255, 255, leavingAlpha);
        textAlign(LEFT,TOP);
        text(this.message, windowWidth - 10 - tBoxW + 10, offsetY + 30);
        alpha(255);
    }
}
class ToastNotificationManager {
    toasts = []
    constructor(){

    }
    showSuccess(message, options){
        this.showToast(message, {
            ...options,
            level: 'success'
        })
    }
    showToast(message, options){
        options = options ?? {}
        options.level = options.level ?? 'info'; // DEFAULT_TOAST_LEVEL = 'info'
        let {pinned} = options;
        let toast = new ToastNotification(message, {pinned, manager: this});
        this.toasts.push(toast);
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
        commandPaletteInput.value('');
        new HideCommandPaletteCommand().execute();
        toastManager.showToast(`Set Max Suggestions: ${store.maxVisibleOptionsCount}`);
    }
}

class SetMaxSuggestionsCommand 
extends DefaultSuggestionDecorator(Command, new SetMaxSuggestionsCommandWizardConfig()) {}

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
extends DefaultSuggestionDecorator(Command, new TodoWizardConfig()){}

class NewRepeatingTodoCommand
extends DefaultSuggestionDecorator(Command, new RepeatingTodoWizardConfig()){}

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
extends DefaultSuggestionDecorator(Command, new SaveStateToLocalStorageWizardConfig()) 
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
                // TODO: need a replaceStore or replaceState that can do a deep merge
                // For Now, let's see what happens
                store = parsedState;
                hydrateStore(store);
            }
        }
    ]
    finalCallback(wizardInstance){
        toastManager.showSuccess(`Loaded State From Local Storage`);
    }
}
class LoadStateFromLocalStorage 
extends DefaultSuggestionDecorator(Command, new LoadStateFromLocalStorageWizardConfig()){}

// Mode Switching Commands
class ModeSwitch_SELECT 
extends DefaultSuggestionDecorator(Command, {
    name: "Select Mode",
    OnSelect(){
        new SwitchModeCommand(MODES.SELECT).execute();
    }
}){}
class ModeSwitch_ADD_NODE
extends DefaultSuggestionDecorator(Command, {
    name: "Add Node Mode",
    OnSelect(){
        new SwitchModeCommand(MODES.ADD_NODE).execute();
    }
}){}
class ModeSwitch_ADD_EDGE
extends DefaultSuggestionDecorator(Command, {
    name: "Add Edge Mode",
    execute: function(){
        new SwitchModeCommand(MODES.ADD_EDGE).execute();
    }
}){}
class ModeSwitch_PAN
extends DefaultSuggestionDecorator(Command, {
    name: "Pan Mode",
    execute: function(){
        new SwitchModeCommand(MODES.PAN).execute();
    }
}){}
class ModeSwitch_DELETE
extends DefaultSuggestionDecorator(Command,{
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
    ShowCommandPaletteCommand,
    HideCommandPaletteCommand,
    ToggleCommandPaletteCommand,
    // LoadMessengerWindowCommand,
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


class CommandPalette {
    // the current "Command" being constructed
    currentCommand = null; 
    // the list of available commands
    availableCommands = []; 
    // the list of contextually recommended commands
    filteredCommands = []; 

    //selectedSuggestionIndex = null;
    get selectedSuggestionIndex(){
        return this.commandSuggestionList.selectedOptionIndex;
    }
    set selectedSuggestionIndex(value){
        this.commandSuggestionList.selectedOptionIndex = value;
    }
    
    constructor(){
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
        defaultSuggestedCommands.forEach((cmd)=>{
            this.availableCommands.push(cmd);
        })
        this.availableCommands.push(new Command("Start Pomodoro",{
            execute: function(){
                console.warn("starting pomodoro...");
                setTimeout(()=>{
                    alert('DONE!');

                },1000)
            }
        }))
        // TODO: ShowPinnedToast
        this.availableCommands.push(new Command("New REPL"))
        this.availableCommands.push(new Command("New Sandbox"))
        this.availableCommands.push(new SetMaxSuggestionsCommand());
        this.availableCommands.push(new Command("Help",{
            wizardConfig: new WizardConfig("Help Wizard",{
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
        // this.availableCommands.push(new Command("New Timer",{
        //     wizardConfig: new TimerWizardConfig("New Timer Wizard")
        // }))
        // this.availableCommands.push(new Command("New Error",{}))
        // this.availableCommands.push(new Command("New Graph",{}))
        // this.availableCommands.push(new Command("New Node Type",{}))
        // this.availableCommands.push(new Command("New Requirement",{}))
        // this.availableCommands.push(new Command("New Enum",{}))
        // this.availableCommands.push(new Command("New Action",{}))
        // this.availableCommands.push(new Command("New Event Type",{}))
        // this.availableCommands.push(new Command("New Storage Field",{}))
        // this.availableCommands.push(new Command("New Class",{}))
        // this.availableCommands.push(new Command("New Command",{
        //     wizardConfig: new CommandWizardConfig("New Command Wizard")
        // }));

        // List Self Tests
        this.availableCommands.push(new Command("List Self Tests",{
            callback: function(){
                console.warn('listing self tests...')
            }
        }))

        // Run Self Test
        this.availableCommands.push(new Command("Run Self Test",{
            keyBindings:[
                // {
                //     key: "cmd+shift+t",
                // }
            ],
            aliases: [
                "/test",
                // "/t"
            ],
            callback: function(){
                console.warn('running self test...')
                new HideCommandPaletteCommand().execute();
            }
        }))
        
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
                    if(!confirm('Are you sure?')){
                        return;
                    }
                    store.currentGraph = null;
                    // hide the command palette
                    new HideCommandPaletteCommand().execute();
                }
            })
        )

        // Load Graph
        this.availableCommands.push(
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
                        toastManager.showToast(`Loaded Graph: ${wizardInstance.stepResponses[0].selectedSuggestionValueOrLabel}`);
                        let prevStepResponse = wizardInstance.stepResponses[0];
                        // it's loading by name / label here instead of value?
                        console.warn("its loading by name instead of value?",
                        {
                            prevStepResponse,
                        })
                        loadGraph(prevStepResponse.selectedSuggestionValueOrLabel)
                        // close the command palette
                        new HideCommandPaletteCommand().execute();
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
            })
        )

        // Command Palette / Command Prompt Commands
        this.availableCommands.push(new ShowCommandPaletteCommand());
        this.availableCommands.push(new HideCommandPaletteCommand());
        this.availableCommands.push(new ToggleCommandPaletteCommand());
    }

    renderCommandPrompt(){
        const cmdpPosY = 0;
        fill(0,0,0,200)
        strokeWeight(0)
        stroke("white")
        rect(0, cmdpPosY, windowWidth, windowHeight);

        // draw a large text input in the command palette
        fill(0,0,0,200)
        strokeWeight(0)
        stroke("black")
        rect(10, cmdpPosY + 10, windowWidth - 20, 100);
        fill("black")

        // if there's no wizard active,
        // fallback to our default command suggestion list
        if(!store.activeWizard){
            cmdprompt.renderSuggestedCommands();
        }
    }

    renderSuggestedCommands(){
        /* pass the drawing responsibility on to the SuggestionList class instance */
        this.commandSuggestionList.draw();
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

    // onCommandPaletteInput -> filterCommands

    // TODO: need to trigger on backspace TOO!
    onCommandPaletteInput(event){
        //console.log({event});

        //console.warn('onCommandPaletteInput',{event})
        // update the command buffer
        store.commandBuffer = {
            name: commandPaletteInput.value()
        }
        if(this.currentCommand === null){
            this.initCommand();
        }else{
            this.currentCommand.updateFromBuffer();
        }

        // console.warn(
        //     'OnCommandPaletteInput, buffer is now:',
        //     {
        //         currentCommand: JSON.parse(JSON.stringify(this.currentCommand))
        //     }
        // )

        // filter the list of available commands
        this.filterCommands();

        //console.warn('sanity check filtered count: ',this.filteredCommands.length);

        // if the cmd palette is not visible, show it
        if(!store.commandPaletteVisible){
            new ShowCommandPaletteCommand().execute();
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
        console.warn('todo: check did click a suggestion')
        return false    
    }

    OnPressEscape(){
        // if there's an active wizard, we need to handle the input differently
        if(store.activeWizard){
            store.activeWizard.OnPressEscape.call(store.activeWizard);
            return;
        }
        // escape was pressed
        // hide the command palette
        store.commandPaletteVisible = false;
        // clear the command palette input
        commandPaletteInput.value('');
        // reset the command buffer
        store.commandBuffer = {
            name: ''
        };
        // need to decide when the current command is deselected
        // --- 
        // this.currentCommand = null;
    }

    OnPressEnter(){
        // if we have a command selected, mark it as the current command
        if(
            this.selectedSuggestionIndex !== null
            && this.filteredCommands.length
            && this.selectedSuggestionIndex < this.filteredCommands.length
        ){

            this.currentCommand = this.filteredCommands[this.selectedSuggestionIndex].clone();
        }
        console.log('CommandPalette.OnPressEnter', {
            currentCMDName: this.currentCommand.name,
            selectedSuggIdx: this.selectedSuggestionIndex,
            filteredCommandsLength: this.filteredCommands.length,
            currentCMD: this.currentCommand,
            currentCMDOptions: this.currentCommand.options,
        })
        // enter was pressed
        // execute the current command
        this.currentCommand.execute();
        // TODO: step the undo/redo history
        // reset the command buffer
        store.commandBuffer = {
            name: ''
        };
        // hide the command palette
        //store.commandPaletteVisible = false;
        // clear the command palette input
        commandPaletteInput.value('');
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
        this.filteredCommands = this.availableCommands.filter(command => {
            if(!command){
                return false;
            }
            if(!command.name){
                return false;
            }
            if(!command.name.toLowerCase){
                console.error('command name is not a string?', {command})
                return false;
            }
            let compare = command?.name ? command.name.toLowerCase() 
                : (command?.label?.toLowerCase() ?? '');

            let match1 = compare
                .includes(store.commandBuffer?.name?.toLowerCase());

            let compare2 = !command?.altnames ? '' : command.altnames.join(' ').toLowerCase();
            let match2 = compare2
                .includes(store.commandBuffer?.name?.toLowerCase());
            
            // we'll add more match in the future,
            // let's count the number of matches as a rudimentary ranking system
            let matches = 0;
            if(match1){
                matches++;
            }
            if(match2){
                matches++;
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

// Define the initial state of the canvas
let zoom = 1;
let panX = 0;
let panY = 0;
let panningBG = false;
let dragStartX = 0;
let dragStartY = 0;

// Define the mouseDragged function
function mouseDragged(event){
    let blockPan = false;
    if(store.currentGraph){
        store.currentGraph.OnMouseDragged(event);
        blockPan = store.currentGraph.selectedNodeIDs.length > 0;
    }
    if(!blockPan){
        panX += mouseX - pmouseX;
        panY += mouseY - pmouseY;
    }
}

// Define the mousePressed function
function mousePressed(){
    // bail early if one of our other handlers handled the click
    if(checkDidClickASuggestion()){
        return;
    }
    if(checkDidClickAModeSwitcherButton()){
        return;
    }

    // maybe select a node
    if(store.currentGraph && store.currentGraph.OnMousePressed){
        store.currentGraph.OnMousePressed();
    }
    if (
        store.currentGraph 
        && !store.currentGraph.selectedNodeIDs.length
    ) {
        panningBG = true;
        dragStartX = mouseX;
        dragStartY = mouseY;
    } else {
        panningBG = false;
    }
}

function __checkDidClickAVisibleSuggestion(){

}

function checkDidClickASuggestion(){
    // if a wizard is active, have IT check
    if(store.activeWizard){
        return store.activeWizard.checkDidClickASuggestion();
    }else if(store.commandPaletteVisible){

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

// Define the mouseReleased function
function mouseReleased(){
    if (panningBG) {
        panningBG = false;
    } else {
        stopDragging();
    }
}

// Define the mouseWheel function
function mouseWheel(event) {
    let oldZoom = zoom;
    zoom -= event.delta / 1000;
    zoom = constrain(zoom, 0.1, 3);

    // Adjust pan to account for mouse position while zooming
    let mouseWorldX = (mouseX - panX) / oldZoom;
    let mouseWorldY = (mouseY - panY) / oldZoom;
    let newMouseWorldX = (mouseX - panX) / zoom;
    let newMouseWorldY = (mouseY - panY) / zoom;
    panX += (newMouseWorldX - mouseWorldX) * zoom;
    panY += (newMouseWorldY - mouseWorldY) * zoom;
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

// Define the draw function
function draw() {
    background(25);

    push();
    translate(panX, panY);
    scale(zoom);

    if(
        store.currentGraph 
        //&& !store.commandPaletteVisible
    ){
        store.currentGraph.renderGraph();
    }
    
    if (panningBG) {
        panX += mouseX - dragStartX;
        panY += mouseY - dragStartY;
        dragStartX = mouseX;
        dragStartY = mouseY;
    }

    if(gherkinRunnerWidget && gherkinRunnerWidget.draw){
        gherkinRunnerWidget.draw();
    }
    if(gherkinStudio && gherkinStudio.draw){
        gherkinStudio.draw();
    }

    pop();

    
    //drawModeSwitcher();

    // if the command palette is visible, draw it
    if(store.commandPaletteVisible){
        cmdprompt.renderCommandPrompt();
    }

    // display the current wizard (if any)
    store.activeWizard?.onDraw?.();

    // render toast notifications
    toastManager.draw();

    renderDebugUI();

    
}

function renderDebugUI(){
    if(store.debugUI_DISABLED){
        return;
    }

    if(store.status_lights.rendererStarted){
        store.status_lights.rendererStarted.draw();
    }
    if(store.status_lights.rendererHasOptionsToRender){
        store.status_lights.rendererHasOptionsToRender.draw();
    }

    // Check if the text color is blending with the background color
    // If so, change the fill color
    fill(255, 255, 255);
    // Ensure the text size is large enough to be visible
    textSize(16);
    textAlign(RIGHT, BOTTOM);
    // Render text that lists the current zoom, panX, panY
    text(
        `zoom: ${zoom.toFixed(2)} panX: ${panX.toFixed(2)} panY: ${panY.toFixed(2)}`, 
        windowWidth - 20, 
        windowHeight - 10);
    // render red text that shows the current interaction mode
    fill(255, 0, 0);
    text(
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

    get parentGraph () {
        return this.options.parentGraph;
    }

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
                        // If there's a fork, create new events for each target node
                        stage.to.forEach(to => {
                            let newEvent = { ...event, stage: { from: stage.from, to: to } };
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
        // TODO: really it should spwan a new event
        // we'll get back to that as our refactor continues...
        this.positions = this.getEventPositions(); 
        for(var i=0;i<this.positions.length;i++){
            let [x,y] = this.positions[i];
            this.drawEventAt(x,y,event);
        }
    }
    
    drawEventAt(x,y,event){
        console.warn('drawEventAt',{x,y,event})
        debugger;
        fill(event.key === 'backspace' ? color(255,0,0) : 255); // Change 0 to 255
        ellipse(x, y, 30, 30);
        fill(event.key === 'backspace' ? color(255,255,255) : 0);
        text(event.key === 'backspace' ? '←' : event.key, x, y);
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

let commandPaletteInput = null;


// Define the setup function
function setup() {
    ensureHeadTag();
    createCanvas(windowWidth, windowHeight);
    
    // singletons
    cmdprompt = new CommandPalette();
    toastManager = new ToastNotificationManager();

    // boot the root system manager & root system
    manager.boot();
    rootSystem = system = manager.systems[0];
    let testSeq = getTestGherkinSequence();
    // bootstrap our self-test
    gherkinRunnerWidget = new GherkinRunnerWidget(testSeq);

    push();
    textSize(50);
    commandPaletteInput = createInput('');
    commandPaletteInput.elt.style.backgroundColor = 'black';
    commandPaletteInput.elt.style.color = 'white';
    commandPaletteInput.size(windowWidth - 20);
    commandPaletteInput.position(10, 130);
    // focus the command palette input
    commandPaletteInput.elt.focus();
    pop();
    // Listen for the 'keydown' event
    commandPaletteInput.elt.addEventListener('keydown', function(e) {
        // Check if the Enter key was pressed
        // if (e.key === 'Enter') {
            // Call the onCommandPaletteInput method
            cmdprompt.onCommandPaletteInput(e);
        // }
    });
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
                const input = createInput('');
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
            let suggestionWidth = windowWidth * .66;
            let x = ( windowWidth / 2 ) - (suggestionWidth/2);
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
                break;
        }
    }
    onPressUp(event){
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
        console.warn('SuggestionList:OnPressEnter');
        event.preventDefault();

        this.onEnterPressedCallback();

        // we handled it
        return true;
    }
    draw(){
        this.drawSuggestedOptions();
    }
    drawSuggestedOptions(){

        store.status_lights.rendererStarted.c = "green";
        
        if(!this.visibleSuggestions?.length){
            //this.logSelf();
            //throw new Error("visibleSuggestions is empty!")
            store.status_lights.rendererHasOptionsToRender.c = "red";
            return;
        }
        store.status_lights.rendererHasOptionsToRender.c = "green";
        const offsetY = 150;
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
                selected
            );
        })
    }
    renderSuggestionOption(x,y,w,h,label,selected){
        strokeWeight(selected ? 3 : 1);
        // draw box
        fill(selected ? "purple" : color(20))
        rect(x,y,w,h);
        strokeWeight(1);
        // draw label
        fill(200)
        textAlign(CENTER,CENTER);
        text(label, x + (w/2), y + (h/2));
    }
}

function stopDragging() {
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
            triangle(x - 40, y + 40, x + 40, y + 40, x, y - 40);
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
    constructor() {
        // Initialize the state
        this.state = {};
    }

    // Method to get the current state
    getState() {
        return this.state;
    }

    // Method to set a new state
    setState(newState) {
        this.state = newState;
    }

    // Method to reset the state
    resetState() {
        this.state = {};
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