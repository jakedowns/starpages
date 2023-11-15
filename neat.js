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

    mode: 'mvc', // default mode
    events: [],
    viewValue: '',
    controllerValue: '',
    modelValue: '',
    modelValueFromView: '',
    eventId: 0,
    lastReceived: Date.now(),
    nodes: [],
    edges: [],
    commandBuffer: {},
    currentCommand: {},
    commandHistory: [],
    commandPaletteVisible: false,

    activeWizard: null,
};

class WizardController {
    name = 'default wizard';
    currentStep = 0;
    stepResponses = [];
    shownSteps = [];
    selectedSuggestionIndex = 0;
    get currentSuggestions(){
        return this?.config?.steps?.[this?.currentStep]?.suggestions ?? []
    };
    constructor(wizardConfig){
        // todo: ValidateWizardConfig
        // if this config steps is empty or missing, throw
        if(!wizardConfig?.steps?.length){
            throw new Error('wizard config must have steps');
        }
        this.config = wizardConfig;
        this.name = wizardConfig.name ?? this.name;
        
    }
    start(){
        store.activeWizard = this;
        this.switchToStep(0);
    }
    switchToStep(stepIndex){
        this.currentStep = stepIndex;
        this.shownSteps.push(this.currentStep);
        // drawSuggestions automatically updates based on the current step
    }
    tryCompleteStep(){
        // process the current step
        // proceed if the current step is valid

        if(this.selectedSuggestionIndex !== null){
            // record the current response
            this.stepResponses[this.currentStep] = {
                input: commandPaletteInput.value(),
                selectedSuggestionIndex: this.selectedSuggestionIndex,
                selectedSuggestionValue: this.currentSuggestions[this.selectedSuggestionIndex].value,
            }
        }

        // reset the selected suggestion index between steps
        this.selectedSuggestionIndex = null;
        
        // if we completed it, and it was the last step,
        // end the wizard
        if(this.currentStep === this.config.steps.length - 1){
            this.end();
        }else{
            this.switchToStep(this.currentStep+1);
        }
    }
    end(){
        store.activeWizard = null;
        if(this.config.finalCallback){
            this.config.finalCallback.call(this,this);
        }
    }
    onDraw(){
        if(!store.activeWizard){
            return;
        }
        this.drawCurrentStep();
    }
    drawCurrentStep(){
        let question = this.config.steps[this.currentStep].question;
        // console.warn('displaying wizard step question',{
        //     step:this.currentStep,
        //     question
        // });
        // render the question
        textAlign(LEFT,TOP);
        text(`${question}`, 20, 20);
        this.drawSuggestedCommands();
    }
    drawSuggestedCommands(){
        let suggestions = [
            ...this.config.steps[this.currentStep].suggestions
        ];
        // TODO
        // ...[{
        //     name: "Skip",
        //     value: "skip"
        // },{
        //     name: "Cancel",
        //     value: "cancel"
        // }],
        if(!suggestions?.length){
            return;
        }
        const offsetY = 60;
        const limit = 10;
        // render the list of the top LIMIT suggestions
        let i = 0;
        for(i = 0; i < limit && i < suggestions.length; i++) {
            let suggestion = suggestions[i];
            let x = 10;
            let y = offsetY + 10 + (i * 50);
            let w = 200;
            let h = 50;
            let label = suggestion.name;
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
    // todo: bail early on these handlers if !store.activeWizard
    OnPressEnter(event){
        // validate the current response to the current step
        // if it's valid, store it
        // if it's invalid, show an error message
        console.warn('enter was pressed', {
            currentCMDName: this.name,
            currentStepConfig: this.config.steps[this.currentStep]
        })
        this.tryCompleteStep();
    }
    OnPressUp(event){
        console.warn('UP was pressed', {
            currentCMDName: this.name,
            currentStepConfig: this.config.steps[this.currentStep]
        })
        if(this.selectedSuggestionIndex === null){
            this.selectedSuggestionIndex = this.currentSuggestions.length - 1;
        }else if(this.selectedSuggestionIndex > 0){
            this.selectedSuggestionIndex--;
        }else{
            // loop back to the last suggestion
            this.selectedSuggestionIndex = this.currentSuggestions.length - 1;
        }
    }
    OnPressDown(event){
        console.warn('DOWN was pressed', {
            currentCMDName: this.name,
            currentStepConfig: this.config.steps[this.currentStep],
            currentSuggestionsLength: this.currentSuggestions.length
        })
        if(this.selectedSuggestionIndex === null){
            this.selectedSuggestionIndex = 0;
        }else if(this.selectedSuggestionIndex < this.currentSuggestions.length - 1){
            this.selectedSuggestionIndex++;
        }else{
            // loop back to the first suggestion
            this.selectedSuggestionIndex = 0;
        }
        console.warn('selectedSuggestionIndex',this.selectedSuggestionIndex)
    }
    OnInput(event){
        console.warn('On Wizard Input', {
            currentCMDName: this.name,
            currentStepConfig: this.config.steps[this.currentStep]
        })
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
        console.warn('executing command, has wizard, has callback?',
        {
            name: this.name,
            hasWizard: this.options.wizardConfig ? true : false,
            hasCallback: this.options.callback ? true : false,
            options: Object.keys(this.options)
        })
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
        this.name = store.commandBuffer;
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

class CommandPalette {
    // the current "Command" being constructed
    currentCommand = null; 
    // the list of available commands
    availableCommands = []; 
    // the list of contextually recommended commands
    filteredCommands = []; 

    selectedSuggestionIndex = null;
    
    constructor(){
        this.addDefaultCommands();
    }

    addDefaultCommands(){
        this.availableCommands.push(new Command("New Requirement",{}))
        this.availableCommands.push(new Command("New Enum",{}))
        this.availableCommands.push(new Command("New Action",{}))
        this.availableCommands.push(new Command("New Event Type",{}))
        this.availableCommands.push(new Command("New Storage Field",{}))
        this.availableCommands.push(new Command("New Class",{}))
        this.availableCommands.push(new Command("New Command",{
            wizardConfig: {
                name: "New Command Wizard",
                steps:  [
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
                    // {
                    //     question: "What is the callback for the command?",
                    //     answerStorageKey: "callback",
                    //     answerValidationRules: 'required:unique:string'
                    // },
                ]
            }
        }));
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
                    store.nodes = [];
                    store.edges = [];
                    // hide the command palette
                    new HideCommandPaletteCommand().execute();
                }
            })
        )
        this.availableCommands.push(
            new Command("Load Graph...",{
                wizardConfig: {
                    name: "Load Graph Wizard",
                    skippable: true,
                    required: false,
                    finalCallback: function(wizardInstance){
                        console.warn('Load Graph... Final Callback', {
                            t:this,
                            wizardInstance
                        });
                        switch(wizardInstance.stepResponses[0].selectedSuggestionValue){
                            case 'mvp':
                                loadMVCSample();
                                break;
                            case 'mvc':
                                loadMVCSample();
                                break;
                            case 'flux':
                                loadFluxSample();
                                break;
                            case 'ajaxFlux':
                                loadAjaxFluxSample();
                                break;
                            default:
                                console.warn('unknown graph type',wizardInstance.stepResponses[0].selectedSuggestionValue);
                        }
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

        this.availableCommands.push(new ShowCommandPaletteCommand());
        this.availableCommands.push(new HideCommandPaletteCommand());
        this.availableCommands.push(new ToggleCommandPaletteCommand());
        this.availableCommands.push(new Command('switch to Select Mode'));
        this.availableCommands.push(new Command('switch to Add Node Mode'));
        this.availableCommands.push(new Command('switch to Add Edge Mode'));
        
        this.availableCommands.push(new Command('switch to Move Mode'));
        this.availableCommands.at(-1).execute = function(){
            //super.execute();
            store.interactionMode = MODES.MOVE;
        }

        this.availableCommands.push(new Command('switch to Delete Mode'));
        this.availableCommands.at(-1).execute = function(){
            //super.execute();
            store.interactionMode = MODES.DELETE;
        }
    }

    renderSuggestedCommands(){
        const offsetY = 60;
        const limit = 10;
        // render the list of the top LIMIT suggestions
        let i = 0;
        for(i = 0; i < limit && i < this.filteredCommands.length; i++) {
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

    handleWizardInput(event){
        switch(event.keyCode){
            case 13:
                // validate the current response to the current step
                // if it's valid, store it
                // if it's invalid, show an error message
                store.activeWizard.OnPressEnter.call(store.activeWizard,event);
                break;
            case 38:
                store.activeWizard.OnPressUp.call(store.activeWizard,event);
                break;
            case 40:
                store.activeWizard.OnPressDown.call(store.activeWizard,event);
                break;
            default:
                // update the current response to the current step
                store.activeWizard.OnInput.call(store.activeWizard,event);
        }
    }

    onCommandPaletteInput(event){
        //console.log({event});

        // if the cmd palette is not visible, show it
        if(!store.commandPaletteVisible){
            new ShowCommandPaletteCommand().execute();
        }

        // if there's an active wizard, we need to handle the input differently
        if(store.activeWizard){
            this.handleWizardInput(event);
            return;
        }

        switch(event.keyCode){
            case 9:
                // if they pressed tab, select the first suggestion (if any)
                if(this.filteredCommands.length){
                    // select the first suggestion
                    this.currentCommand = this.filteredCommands[0];
                    // update the command buffer
                    store.commandBuffer = this.currentCommand.name;
                }
                break;
            case 40:
                // down arrow was pressed
                // select the next suggestion (if any)
                if(this.filteredCommands.length){
                    if(this.selectedSuggestionIndex === null){
                        this.selectedSuggestionIndex = 0;
                    }
                    else if(this.selectedSuggestionIndex < this.filteredCommands.length - 1){
                        this.selectedSuggestionIndex++;
                    }
                    else{
                        // loop back to the first suggestion
                        this.selectedSuggestionIndex = 0;
                    }
                }
                break;
            case 38:
                // up arrow was pressed
                // select the previous suggestion (if any)
                if(this.filteredCommands.length){
                    if(this.selectedSuggestionIndex === null){
                        this.selectedSuggestionIndex = this.filteredCommands.length - 1;
                    }
                    else if(this.selectedSuggestionIndex > 0){
                        this.selectedSuggestionIndex--;
                    }
                    else{
                        // loop back to the last suggestion
                        this.selectedSuggestionIndex = this.filteredCommands.length - 1;
                    }
                }
                break;
            case 27:
                this.OnPressEscape();
                return;
            case 13:
                this.OnPressEnter()
                return;
            
        }

        //console.warn('onCommandPaletteInput',{event})
        // update the command buffer
        store.commandBuffer = commandPaletteInput.value();
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
        store.commandBuffer = {};
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
            return command.name.toLowerCase()
                .includes(store.commandBuffer.toLowerCase());
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
        store.nodes[selectedNode].x += mouseX - pmouseX;
        store.nodes[selectedNode].y += mouseY - pmouseY;
    }
}

// Define the mousePressed function
function mousePressed(){
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
    if (selectedNode !== null) {
        store.edges = store.edges.filter(edge => edge.from !== selectedNode && edge.to !== selectedNode);
        store.nodes.splice(selectedNode, 1);
        selectedNode = null;
    }
}

// Define the draw function
function draw() {
    background(25);

    // Check if the text color is blending with the background color
    // If so, change the fill color
    fill(255, 255, 255);
    // Ensure the text size is large enough to be visible
    textSize(16);
    textAlign(LEFT, TOP);
    // Render text that lists the current zoom, panX, panY
    text(
        `zoom: ${zoom.toFixed(2)} panX: ${panX.toFixed(2)} panY: ${panY.toFixed(2)}`, 
        50, 
        300);
    // render red text that shows the current interaction mode
    fill(255, 0, 0);
    text(
        `interaction mode: ${store.interactionMode}`, 
        50, 
        320);

    push();
    translate(panX, panY);
    scale(zoom);

    drawLines();

    if (selectedNode !== null) {
        store.nodes[selectedNode].x = (mouseX - panX) / zoom;
        store.nodes[selectedNode].y = (mouseY - panY) / zoom;
    } else if (panningBG) {
        panX += mouseX - dragStartX;
        panY += mouseY - dragStartY;
        dragStartX = mouseX;
        dragStartY = mouseY;
    }

    store.events.forEach((event, i) => {
        updateEvent(event);
        drawEvent(event);
    });
    
    store.nodes.forEach((node, i) => {
        drawNode(node);
    });

    pop();

    drawModeSwitcher();

    // if the command palette is visible, draw it
    if(store.commandPaletteVisible){
        drawCommandPalette();
    }

    if(store.activeWizard){
        // display the current step
        store.activeWizard.onDraw();
    }

    
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
    rect(10, cmdpPosY + 10, windowWidth - 20, 50);
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

// Define the drawLines function
function drawLines() {
    store.edges.forEach((edge) => {
        let currentNode = store.nodes[edge.from];
        let nextNode = store.nodes[edge.to];
        stroke(edge.color);
        line(
            currentNode.x + edge.fromAnchor.x, 
            currentNode.y + edge.fromAnchor.y, 
            nextNode.x + edge.toAnchor.x, 
            nextNode.y + edge.toAnchor.y
        );
    });
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

    commandPaletteInput = createInput('');
    commandPaletteInput.position(10, windowHeight - 190);
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

    // Add buttons to load different demos
    // mvcButton = createButton('Load MVC Sample');
    // mvcButton.position(input.x + input.width, 40);
    // mvcButton.mousePressed(loadMVCSample);

    // fluxButton = createButton('Load Flux Sample');
    // fluxButton.position(input.x + input.width, 70);
    // fluxButton.mousePressed(loadFluxSample);

    // fluxAjaxButton = createButton('Load Ajax Flux Sample');
    // fluxAjaxButton.position(input.x + input.width, 130);
    // fluxAjaxButton.mousePressed(loadAjaxFluxSample);

    // emptyButton = createButton('Load Empty Graph');
    // emptyButton.position(input.x + input.width, 100);
    // emptyButton.mousePressed(loadEmptyGraph);
}

function loadMVCSample() {
    store.mode = 'mvc';
    store.nodes = [
        { id: 0, x: 125, y: 200, shape: 'triangle', label: 'View' },
        { id: 1, x: 300, y: 50, shape: 'ellipse', label: 'Controller' },
        { id: 2, x: 500, y: 200, shape: 'rect', label: 'Model' }
    ];
    store.edges = [
        // view -> controller
        { from: 0, to: 1, color: 'red', fromAnchor: { x: 0, y: 30 }, toAnchor: { x: 0, y: 30 } },
        // controller -> model
        { from: 1, to: 2, color: 'red', fromAnchor: { x: 0, y: 30 }, toAnchor: { x: 0, y: 30 } },
        // model -> controller
        { from: 2, to: 1, color: 'blue', fromAnchor: { x: 0, y: 0 }, toAnchor: { x: 0, y: 0 } },
        // controller -> view
        { from: 1, to: 0, color: 'blue', fromAnchor: { x: 0, y: 0 }, toAnchor: { x: 0, y: 0 } }
    ];
    store.eventFlow = [
        {from: 0, to: 1}, // view -> controller
        {from: 1, to: 2}, // controller -> model
        {from: 2, to: 1}, // model -> controller
        {from: 1, to: 0}, // controller -> view
    ]
}

function loadFluxSample() {
    store.mode = 'flux';
    store.nodes = [
        { id: 0, x: 125, y: 200, shape: 'triangle', label: 'Component' },
        { id: 1, x: 300, y: 50, shape: 'ellipse', label: 'Action' },
        { id: 2, x: 475, y: 50, shape: 'ellipse', label: 'Mutation' },
        { id: 3, x: 500, y: 200, shape: 'rect', label: 'State' }
    ];
    store.edges = [
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
    store.eventFlow = [
        {from: 0, to: 1}, // component -> action
        {from: 1, to: 2}, // action -> mutation
        {from: 2, to: 3}, // mutation -> state
        {from: 3, to: 0}, // state -> component
    ]
}

// simulate an ajax await'd action
function loadAjaxFluxSample(){
    store.mode = 'ajaxFlux';
    // c -> a -> ajax -> a -> m -> s -> c
    store.eventFlow = [
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
    store.nodes = [
        { id: 0, x: 125, y: 200, shape: 'triangle', label: 'Component' },
        { id: 1, x: 370, y: 50, shape: 'ellipse', label: 'Action' },
        { id: 2, x: 650, y: 110, shape: 'ellipse', label: 'Mutation' },
        { id: 3, x: 424, y: 315, shape: 'ellipse', label: 'State' },
        { id: 4, x: 582, y: -71, shape: 'ellipse', label: 'Ajax' },
    ];
    store.edges = [
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

function loadEmptyGraph() {
    store.mode = 'empty';
    store.nodes = [];
    store.edges = [];
}

// check closest node to mouse position
function dragNode() {
    // Adjust mouse position for pan and zoom
    let adjustedMouseX = (mouseX - panX) / zoom;
    let adjustedMouseY = (mouseY - panY) / zoom;
    let mousePos = createVector(adjustedMouseX, adjustedMouseY);

    let closestNode = null;
    store.nodes.forEach((node, i) => {
        let d = dist(mousePos.x, mousePos.y, node.x, node.y);
        if (closestNode === null && d < 50) {
            closestNode = i;
        }
    });
    selectedNode = closestNode;
}

function stopDragging() {
    selectedNode = null;
}

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

function addNode() {
    let nodeType = input.value().toLowerCase();
    if (['view', 'controller', 'model', 'action', 'mutation', 'store', 'dispatch', 'mutate', 'state'].includes(nodeType)) {
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

function drawNode(node){

    if (store.nodes.indexOf(node) === selectedNode) {
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

function drawLines() {
    store.edges.forEach((edge) => {
        let currentNode = store.nodes[edge.from];
        let nextNode = store.nodes[edge.to];
        stroke(edge.color);
        line(
            currentNode.x + edge.fromAnchor.x, 
            currentNode.y + edge.fromAnchor.y, 
            nextNode.x + edge.toAnchor.x, 
            nextNode.y + edge.toAnchor.y
        );
        if(edge.label){
            let halfX = (currentNode.x + nextNode.x) / 2;
            let halfY = (currentNode.y + nextNode.y) / 2;
            drawLabel(halfX, halfY, edge.label)
        }
    });
}


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


