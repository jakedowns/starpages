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
    MOVE: 'moveNode',
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

// Define the initial state of the store
let store = {
    interactionMode: MODES.MOVE,

    viewValue: '',
    controllerValue: '',
    modelValue: '',
    modelValueFromView: '',
    eventId: 0,
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
    customCommands: {},

    currentGraph: null,

    // TODO: move
};

class WizardController {
    name = 'default wizard';
    currentStepIndex = 0;
    stepResponses = [];
    shownSteps = [];
    selectedSuggestionIndex = 0;
    wizardSuggestionList = null;
    get steps(){
        return this?.config?.steps ?? [];
    }
    get currentStep(){
        return this?.steps?.[this?.currentStepIndex] ?? null;
    }
    
    // get currentSuggestions(){
    //     return [...this?.config?.steps?.[this?.currentStepIndex]?.suggestions ?? []]
    // }
    // visually limited cursor view into the current suggestions
    get visibleSuggestions(){
        let output = [];
        let i = this.suggestionOffset;
        if(!this.wizardSuggestionList){
            return [];
        }
        for(i; i < this.wizardSuggestionList.maxVisibleOptionsCount && i < this.activeSuggestions.length; i++) {
            let suggestion = this.activeSuggestions[i];
            let x = 10;
            let y = 10 + (i * 50);
            let w = 200;
            let h = 50;
            let label = suggestion.name;
            let selected = this.selectedSuggestionIndex === i;
            output.push({
                x,y,w,h,label,selected
            })
        }
        return output;
    }
    // all valid suggestions
    get allValidSuggestions(){
        const cStep = this.currentStep;
        //console.warn('activeSuggestions? cStep',{cStep})
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
                console.log('converting action to suggestion',{action})
                suggestions.push({
                    name: action.label,
                    value: action.value
                })
                console.warn('inserted suggestion',{
                    key: suggestions.length-1,
                    value: suggestions.at(-1)
                })
            })
        }
        if(!cStep.required){
            suggestions.push({
                name:'Cancel',
                value: 'cancel'
            })
        }

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
        this.wizardSuggestionList.bindGetFilteredOptions(()=>{
            return this.visibleSuggestions;
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
        this.currentStep?.onStepLoaded?.call(this);
        
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
            console.warn('recording ',{
                cSI: this.currentStepIndex,
                offset: this.suggestionOffset,
                visibleLength: this.visibleSuggestions.length,
                selectedSuggestionIndex: this.selectedSuggestionIndex,
                value: this.visibleSuggestions[this.selectedSuggestionIndex]?.value,
                label: this.visibleSuggestions[this.selectedSuggestionIndex]?.label
            })
            this.stepResponses[this.currentStepIndex] = {
                input: commandPaletteInput.value(),
                selectedSuggestionIndex: this.suggestionOffset + this.selectedSuggestionIndex,
                selectedSuggestionValue: 
                    this.visibleSuggestions[this.selectedSuggestionIndex]?.value
                    ?? this.visibleSuggestions[this.selectedSuggestionIndex]?.label
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

            console.warn('validation response', {
                validatorResponse
            })

            if(!validatorResponse?.valid){
                console.error('validation failed',validatorResponse);
                return;
            }
        }

        // unload the current step
        if(this.currentStep?.onStepUnload){
            this.currentStep.onStepUnload.call(this);
        }

        // reset the selected suggestion index between steps
        this.selectedSuggestionIndex = null;
        this.suggestionOffset = 0;
        
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
            finalCallback: this.config.finalCallback ? true : false
        })
        if(this.config.finalCallback){
            this.config.finalCallback.call(this,this);
        }
        // free the wizardSelectList
        this.wizardSuggestionList?.destroy()
        this.wizardSuggestionList = null;
    }
    onDraw(){
        if(!store.activeWizard){
            return;
        }
        this.drawCurrentStep();
        this.drawSuggestedCommands();
    }
    drawCurrentStep(){
        let questionTitle = this.config.steps[this.currentStepIndex]?.questionTitle ?? 'Question';
        let question = this.config.steps[this.currentStepIndex].question;
        // todo cache interpreted string that replaces {prevResp} with the previous response
        // console.warn('displaying wizard step question',{
        //     currentStepIndex:this.currentStepIndex,
        //     question
        // });
        // render the question
        textAlign(LEFT,TOP);
        text(`${questionTitle}`, 20, 20);
        text(`${question}`, 20, 50);
    }
    drawSuggestedCommands(){
        
        if(!this.visibleSuggestions?.length){
            return;
        }
        const offsetY = 100;
        // render the list of the top maxVisibleOptionsCount suggestions
        this.visibleSuggestions.forEach((suggestion, i) => {
            const {x,y,w,h,label,selected} = suggestion;
            this.renderSuggestedCommand(
                x,
                offsetY+y,
                w,
                h,
                label,
                selected
            );
        })
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
        console.warn('enter was pressed', {
            currentCMDName: this.name,
            currentStepConfig: this.config.steps[this.currentStepIndex]
        })
        this.tryCompleteStep();
    }
    // OnPressUp(event){
        
    // }
    // OnPressDown(event){
        
    // }
    handleWizardInput(event){
        console.warn('Wizard:handleWizardInput');
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
                this.wizardSuggestionList?.OnInput?.call(this.wizardSuggestionList,event);
                this.OnInput.call(this,event);
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

// Define the Command class
class Command {
    name = 'default command';
    constructor(name, options){
        this.name = name ?? this.name;
        this.options = options ?? {};
    }
    execute(){
        // console.warn('executing command, has wizard, has callback?',
        // {
        //     name: this.name,
        //     hasWizard: this.options.wizardConfig ? true : false,
        //     hasCallback: this.options.callback ? true : false,
        //     options: Object.keys(this.options)
        // })
        if(this.options.wizardConfig){
            // the constructor validates the wizardConfig for us
            this.wizard = new WizardController(this.options.wizardConfig);
            this.wizard.start();
        }
        if(this.options.callback){
            this.options.callback.call(this);
        }
        // reset command buffer
        store.commandBuffer = {};
    }
    updateFromBuffer(){
        // update the current command based on the command buffer
        this.name = store.commandBuffer.name;
    }
}

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
            store.currentGraph = new AjaxFluxExampleGraph();
            break;
        default:
            console.warn('unknown graph type',name);
    }
}

class SuggestionList {
    constructor(){

    }
}

class GraphNode {
    constructor(options){
        this.options = options ?? {}
        this.graph = options.graph ?? null;
    }
    drawNode(node){

        if (this.nodes.indexOf(node) === this.selectedNode) {
            fill(255, 0, 0); // red for selected node
        } else {
            fill(100 + (node.type === 'rect' ? 0 : 50)); // original fill color
        }
        
        let nodeValue = node.id === 0 
            ? store.viewValue 
            : node.id === 1 
                ? '' 
                : store.modelValue;
                
        let otherNodeValue = node.id === 0 
            ? store.modelValueFromView 
            : node.id === 1 
                ? '' 
                : store.viewValue;
    
        if(node.shape === 'errorRect') {
            drawErrorNode(node);
        } else {
            drawShape(node.x, node.y, node.shape, nodeValue, otherNodeValue);
        }
    
        drawLabel(node.x, node.y, node.label);
    }
}

class Edge {

}

class TodoNode extends GraphNode {

}

// an instance of a graph
class Graph {
    nodes = []
    edges = []
    eventFlow = []
    events = []
    selectedNodes = []

    constructor(options){
        this.options = options ?? {}
        // TODO: merge any defaults we'd like
    }
    loadGraphFromJSON(json){
        console.error('NotImplemented')
    }
    renderGraph(){
        // when we render a graph, we only the top level of subgraphs for each node
        // to prevent needing to recursively render the entire graph at all times

        // draw lines first
        this.drawLines();
        // draw events next
        this.events.forEach((event, i) => {
            updateEvent(event);
            drawEvent(event);
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
            let nextNode = this.nodes[edge.to];
            stroke(edge.color);
            line(
                currentNode.x + edge.fromAnchor.x, 
                currentNode.y + edge.fromAnchor.y, 
                nextNode.x + edge.toAnchor.x, 
                nextNode.y + edge.toAnchor.y
            );
        });
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

class WizardConfig {
    name = 'WizardConfig'
    steps = []
    constructor(name){
        this.name = name ?? this.name
    }
}

class TodoWizardConfig extends WizardConfig {
    constructor(name){
        super(name)

        this.steps = [
            {
                questionTitle: "What?",
                question: "What is the name of the todo?",
                answerStorageKey: "name",
                // todo: minlength / maxlength
                answerValidationRules: 'required:string',
                answerPlaceholder: "Enter a name for the todo",
                actions:[
                    {
                        value: 'save',
                        label: 'Save',
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

        this.config = this.config ?? {}
        // this is called when the wizard is completed
        // and it's time to store the results
        this.finalCallback = function(wizardInstance){
            console.warn('TodoWizardConfig Final Callback',{wizardInstance});

            // clear the command buffer
            store.commandBuffer = {name:''};
            commandPaletteInput.value('');

            // if no active graph, add a new graph
            if(!store.currentGraph){
                loadGraph("empty");
            }

            // 1. push the todo into the current graph as a node at the current level
            // todo: make a TodoNode
            store.currentGraph.nodes.push(new GraphNode({
                name: wizardInstance.stepResponses[0].input,
                x: 100,
                y: 100,
                width: 200,
                height: 100,
                shape: 'rect',
                graph: store.currentGraph // todo: just store ID
            }))

            new HideCommandPaletteCommand().execute();
        }
        // we configure this callback to be called when the final output node (a todo instance) is toggled
        // we might want to move this into the class Todo class which should extend Node as it's a special type of a node in a graph
        this.todoOnToggledCallback = function(next, prev){
            console.warn('todo on toggled callback',{next,prev})
            console.warn('todo update storage')
        }
    }
}
class RepeatingTodoWizardConfig extends TodoWizardConfig {
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
    constructor(name){
        super(name)
    }
}

class CommandWizardConfig extends WizardConfig {
    name = 'CommandWizardConfig'
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
    return typeof thing === 'undefined' || thing === null || thing?.trim() === '' ? true : false;
}

class CommandPalette {
    // the current "Command" being constructed
    currentCommand = null; 
    // the list of available commands
    availableCommands = []; 
    // the list of contextually recommended commands
    filteredCommands = []; 

    selectedSuggestionIndex = null;
    suggestionOffset = 0;
    
    constructor(){
        this.commandSelectList = new SelectList();
        this.commandSelectList.bindOnEnterPressed(this.OnPressEnter.bind(this));
        this.commandSelectList.bindOnEscapePressed(this.OnPressEscape.bind(this));
        this.addDefaultCommands();
    }

    addDefaultCommands(){
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
        this.availableCommands.push(new Command("New Todo",{
            wizardConfig: new TodoWizardConfig("New Todo Wizard")
        }))
        this.availableCommands.push(new Command("New Repeating Todo",{
            wizardConfig: new RepeatingTodoWizardConfig("New Repeating Todo Wizard")
        }))
        this.availableCommands.push(new Command("New Timer",{
            wizardConfig: new TimerWizardConfig("New Timer Wizard")
        }))
        this.availableCommands.push(new Command("New Error",{}))
        this.availableCommands.push(new Command("New Graph",{}))
        this.availableCommands.push(new Command("New Node Type",{}))
        this.availableCommands.push(new Command("New Requirement",{}))
        this.availableCommands.push(new Command("New Enum",{}))
        this.availableCommands.push(new Command("New Action",{}))
        this.availableCommands.push(new Command("New Event Type",{}))
        this.availableCommands.push(new Command("New Storage Field",{}))
        this.availableCommands.push(new Command("New Class",{}))
        this.availableCommands.push(new Command("New Command",{
            wizardConfig: new CommandWizardConfig("New Command Wizard")
        }));

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
                        let prevStepResponse = wizardInstance.stepResponses[0];
                        // it's loading by name / label here instead of value?
                        console.warn("its loading by name instead of value?",
                        {
                            prevStepResponse,
                        })
                        loadGraph(prevStepResponse.selectedSuggestionValue)
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

        // Mode Switching Commands
        this.availableCommands.push(new Command('switch to Select Mode'));
        this.availableCommands.push(new Command('switch to Add Node Mode'));
        this.availableCommands.push(new Command('switch to Add Edge Mode'));
        this.availableCommands.push(new Command('switch to Move Mode',{
            callback: function(){
                store.interactionMode = MODES.MOVE;
            }
        }));
        this.availableCommands.push(new Command('switch to Delete Mode',{
            callback: function(){
                store.interactionMode = MODES.DELETE;
                new HideCommandPaletteCommand().execute();
            }
        }));
    }

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

    onCommandPaletteInput(event){
        //console.log({event});

        // if the cmd palette is not visible, show it
        if(!store.commandPaletteVisible){
            new ShowCommandPaletteCommand().execute();
        }

        // if there's an active wizard, we need to handle the input differently
        if(store.activeWizard){
            store.activeWizard.handleWizardInput(event);
            return;
        }

        if(this.commandSelectList.handleInput(event)){
            return;
        }

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
        // filter the list of available commands
        this.filterCommands();
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

            this.currentCommand = this.filteredCommands[this.selectedSuggestionIndex];
        }
        console.log('enter was pressed', {
            currentCMDName: this.currentCommand.name
        })
        // enter was pressed
        // execute the current command
        this.currentCommand.execute();
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
    

    filterCommands(){
        // filter the list of available commands based on the current command buffer
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
            return compare
                .includes(store.commandBuffer?.name?.toLowerCase());
        });

        //

        // clear the selected suggestion index if it's out of bounds
        if(!this.filteredCommands.length){
            this.selectedSuggestionIndex = null;
        }
    }
}

// Define the initial state of the canvas
let zoom = 1;
let panX = 0;
let panY = 0;
let panningBG = false;
let dragStartX = 0;
let dragStartY = 0;
let selectedNode = null;

// Define the mouseDragged function
function mouseDragged(){
    if(selectedNode === null){
        panX += mouseX - pmouseX;
        panY += mouseY - pmouseY;
    }else{
        // TODO: bring back node dragging
        // store.nodes[selectedNode].x += mouseX - pmouseX;
        // store.nodes[selectedNode].y += mouseY - pmouseY;
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

    dragNode(); // maybe select a node
    if (selectedNode === null) {
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

    if(store.currentGraph && !store.commandPaletteVisible){
        store.currentGraph.renderGraph();
    }

    if (selectedNode !== null) {
        // TODO: bring back dragging nodes
        // let selectedNode = store.currentGraph.seletedNodes?.[0]
        // if(selectedNode){
        //   store.currentGraph.nodes[selectedNode].x = (mouseX - panX) / zoom;
        //   store.currentGraph.nodes[selectedNode].y = (mouseY - panY) / zoom;
        // }
    } else if (panningBG) {
        panX += mouseX - dragStartX;
        panY += mouseY - dragStartY;
        dragStartX = mouseX;
        dragStartY = mouseY;
    }

    pop();

    
    //drawModeSwitcher();

    // if the command palette is visible, draw it
    if(store.commandPaletteVisible){
        drawCommandPalette();
    }

    if(store.activeWizard){
        // display the current step
        store.activeWizard.onDraw();
    }

    renderDebugUI();
}

function renderDebugUI(){
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

// Define the drawCommandPalette function
function drawCommandPalette(){
    const cmdpPosY = 0;
    fill("blue")
    stroke("white")
    rect(0, cmdpPosY, windowWidth, windowHeight);

    // draw a large text input in the command palette
    fill("white")
    stroke("black")
    rect(10, cmdpPosY + 10, windowWidth - 20, 100);
    fill("black")

    if(!store.activeWizard){
        cmdprompt.renderSuggestedCommands();
    }
}

let modeSwitcherButtons = {};

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

// Define the updateEvent function
function updateEvent(event) {
    event.progress += 0.02;
    if (event.progress > 1) {
        event.progress = 0;
        if (event.flowIndex + 1 < store.eventFlow.length) {
            event.flowIndex++;
        } else {
            let index = store.events.indexOf(event);
            if (index > -1) {
                store.events.splice(index, 1);
                return;
            }
        }
        let stage = store.eventFlow[event.flowIndex];
        let delay = stage.delay || 0;
        if(!event.timerId){
            event.timerId = setTimeout(() => {
                if (Array.isArray(stage.to)) {
                    // If there's a fork, create new events for each target node
                    stage.to.forEach(to => {
                        let newEvent = { ...event, stage: { from: stage.from, to: to } };
                        store.events.push(newEvent);
                    });
                } else {
                    // If there's no fork, just update the stage of the current event
                    event.stage = stage;
                }
                event.timerId = null;
            }, delay);
        }
    }
}

// Define the getEventPositions function
function getEventPositions(event) {
    if(!event){
        throw new Error('event not given');
    }
    if(event.flowIndex === null || event.flowIndex === undefined){
        console.warn('event has no flowIndex?',{event});
        return [[0,0]];
    }
    let {fromNode,toNodes} = nodesForFlowIndex(event.flowIndex);
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
        let x = map(event.progress, 0, 1, x1, x2);
        let y = map(event.progress, 0, 1, y1, y2);
        return [x, y];
    });

    return positions;
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

    cmdprompt = new CommandPalette();
    push();
    textSize(50);
    commandPaletteInput = createInput('');
    commandPaletteInput.size(windowWidth - 20);
    commandPaletteInput.position(10, 80);
    pop();
    // Listen for the 'keydown' event
    commandPaletteInput.elt.addEventListener('keydown', function(e) {
        // Check if the Enter key was pressed
        // if (e.key === 'Enter') {
            // Call the onCommandPaletteInput method
            cmdprompt.onCommandPaletteInput(e);
        // }
    });

    // old input

    // input = createInput('');
    // input.position(10, 10);
    // input.input(handleInput);

    // button = createButton('Add Node');
    // button.position(input.x + input.width, 10);
    // button.mousePressed(addNode);
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
class SelectList {
    selectedOptionIndex = -1;
    selectionOffset = 0;
    maxVisibleOptionsCount = 10;
    constructor(){
        
    }
    get filteredOptions(){
        return this?.onGetFilteredOptionsCallback?.() ?? [];
    }
    get allOptions(){
        return this?.onGetAllOptionsCallback?.() ?? [];
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
                break;
            case 38:
                return this.onPressUp(event);
                break;
            case 27:
                //this.selectedSuggestionIndex = -1;
                return this.onEscapePressedCallback();
            case 13:
                this.selectedSuggestionIndex = -1;
                return this.onEnterPressedCallback()
            
        }
    }
    onPressUp(event){
        // up arrow was pressed
        // select the previous suggestion (if any)
        // if(this.filteredOptions.length){
        //     if(this.selectedOptionIndex === null){
        //         this.selectedOptionIndex = this.filteredOptions.length - 1;
        //     }
        //     else if(this.selectedOptionIndex > 0){
        //         this.selectedOptionIndex--;
        //     }
        //     else{
        //         // loop back to the last suggestion
        //         this.selectedOptionIndex = this.filteredOptions.length - 1;
        //     }
        //     return true;
        // }
        // console.warn('UP was pressed', {
        //     currentCMDName: this.name,
        //     currentStepConfig: this.config.steps[this.currentStepIndex]
        // })
        if(this.selectedOptionIndex === null){
            // NOOP for now
            //this.selectedOptionIndex = this.allOptions.length - 1;
        }else if(this.selectedOptionIndex > 0){
            // still results above the selected one, go to it
            this.selectedOptionIndex--;
        }else{
            // loop back to the last suggestion
            this.selectedOptionIndex = this.allOptions.length - 1;
            // if the suggestionOffset is greater than zero, decrement it
            if(this.suggestionOffset > 0){
                this.suggestionOffset--;
            }else{
                // calculate the offset required to show the last result in
                // the last spot of the limited view
                // NOTE: if the current list is under the max visible count, this will be negative, so we need to only use it if it's positive
                if(this.allOptions.length > this.maxVisibleOptionsCount){
                    this.suggestionOffset = this.allOptions.length - this.maxVisibleOptionsCount;
                }
            }
        }
    }
    onPressDown(event){
        // down arrow was pressed
        // select the next suggestion (if any)
        // if(this.filteredOptions.length){
        //     if(this.selectedOptionIndex === null){
        //         this.selectedOptionIndex = 0;
        //     }
        //     else if(this.selectedOptionIndex < this.filteredOptions.length - 1){
        //         this.selectedOptionIndex++;
        //     }
        //     else{
        //         // loop back to the first suggestion
        //         this.selectedOptionIndex = 0;
        //         this.suggestionOffset = 0;
        //     }
        //     return true;
        // }
        // return false;
        // console.warn('DOWN was pressed', {
        //     currentCMDName: this.name,
        //     currentStepConfig: this.config.steps[this.currentStepIndex],
        //     currentSuggestionsLength: this.currentSuggestions.length
        // })
        if(this.selectedOptionIndex === null){
            // start with the first, topmost one
            this.selectedOptionIndex = 0;
        }else if(this.selectedOptionIndex < this.currentSuggestions.length - 1){
            this.selectedOptionIndex++;
            // if we've gone out over this.maxVisibleOptionsCount, 
            // increment the offset and reset the selectedOptionIndex
            if(this.selectedOptionIndex >= this.maxVisibleOptionsCount){
                this.suggestionOffset++;
                this.selectedOptionIndex = 0;
            }
        }else{
            // loop back to the first suggestion
            this.selectedOptionIndex = 0;
            this.suggestionOffset = 0;
        }
        console.warn('selectedOptionIndex',this.selectedOptionIndex)
    }
}

// check closest node to mouse position
// todo: move this into Graph class
function dragNode() {
    if(!store.currentGraph){
        return;
    }
    // Adjust mouse position for pan and zoom
    let adjustedMouseX = (mouseX - panX) / zoom;
    let adjustedMouseY = (mouseY - panY) / zoom;
    let mousePos = createVector(adjustedMouseX, adjustedMouseY);

    let closestNode = null;
    store.currentGraph.nodes.forEach((node, i) => {
        let d = dist(mousePos.x, mousePos.y, node.x, node.y);
        if (closestNode === null && d < 50) {
            closestNode = i;
        }
    });
    store.currentGraph.selectedNodes[0] = closestNode;
}

function stopDragging() {
    if(!store.currentGraph){
        return;
    }
    store.currentGraph.selectedNodes = [];
}

// TODO: map this to an ObservedTextInputField
// so our graph can properly kick events into the correct graph assigned to the text input
// TODO: allow graphs to continue executing in the background in a headless mode
// TODO: a process manager for showing which graphs are currently running
function handleInput() {
    if (keyCode === ENTER) {
        addNode();
        return;
    }
    let inputValue = input.value();
    let event = { 
        id: store.eventId++, 
        value: inputValue, 
        progress: 0, 
        flowIndex: 0, // replaces stage
    };
    if (inputValue.length < store.viewValue.length) {
        event.key = 'backspace';
    } else {
        event.key = inputValue.slice(-1);
    }
    store.events.push(event);
    store.viewValue = inputValue; // Change inputValue to event.key
    store.lastReceived = Date.now();
}

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

function drawShape(x, y, type, nodeValue, otherNodeValue) {
    const shapeMatchesOppositeEnd = nodeValue === otherNodeValue;
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
    fill(0);
    textAlign(CENTER, CENTER);
    text(nodeValue, x, y);
    if(type === 'triangle'){
        fill(0, 0, 255);
        text(otherNodeValue, x, y + 20);
    }
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


function drawEvent(event) {
    let positions = getEventPositions(event);
    for(var i=0;i<positions.length;i++){
        let [x,y] = positions[i];
        drawEventAt(x,y,event);
    }
}

function drawEventAt(x,y,event){
    fill(event.key === 'backspace' ? color(255,0,0) : 255); // Change 0 to 255
    ellipse(x, y, 30, 30);
    fill(event.key === 'backspace' ? color(255,255,255) : 0);
    text(event.key === 'backspace' ? '←' : event.key, x, y);
}


