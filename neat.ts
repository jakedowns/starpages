import * as p5 from 'p5';
/**
 * We're using TypeScript for now instead of CoffeeScript or Elixir because TypeScript provides static typing,
 * which can help catch errors at compile time rather than at runtime. It also provides better tooling support
 * with features like autocompletion and type checking. TypeScript is also a superset of JavaScript, which means
 * any valid JavaScript code is also valid TypeScript code. This makes it easier to gradually adopt TypeScript in
 * a JavaScript codebase.
 */

interface SpaceDataCache {
    [key: string]: any;
}

/**
 * This is a runtime instance of a space. They can be dehydrated to JSON
 * and re-hydrated over the wire.
 */
class Space {
    private _guid: string;

    public typeConstructors: {[key: string]: {new(deserializedState: any): any}} = {};
    
    // internal field instance references
    private fieldInstances: {[key: string]: any} = {};

    // remember the args we were passed at definition time
    private fieldDefinitions: {[key: string]: any} = {};

    private _hyperAddress: number[];
    setHyperAddress(address: number[]): void {
        this._hyperAddress = address;
        console.warn(`My HyperAddress Is Now ${this._hyperAddress.join('.')}`);
    }

    // constructor() {
    //     this._guid = this.generateGUID();
    // }
    
    get guid(): string {
        if(!this._guid){
            this._guid = this.generateGUID();
        }
        return this._guid;
    }

    /**
     * This is a simple implementation of the UUID v4 algorithm for generating unique identifiers.
     * It replaces 'x' and 'y' characters in the template string with random hexadecimal digits,
     * ensuring that the resulting string follows the 8-4-4-4-12 format of a UUID.
     */
    private generateGUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    defineField(fieldName: string, fieldType: string, defaults: {[key: string]: any} = {}){

        this.fieldDefinitions[fieldName] = {
            fieldType: fieldType,
            defaults: defaults
        };

        if(this.typeConstructors[fieldType]){
            this.fieldInstances[fieldName] = new this.typeConstructors[fieldType](defaults);
        } else {
            console.error('Type ' + fieldType + ' does not exist.');
        }
    }
}

class KeyboardCommandHandler {
    mappings: {command: string, key: string}[] = [{
        command: 'moveForward',
        key: 'w'
    }, {
        command: 'moveBackward',
        key: 's'
    }, {
        command: 'moveLeft',
        key: 'a'
    }, {
        command: 'moveRight',
        key: 'd'
    }, {
        command: 'moveUp',
        key: ' '
    }, {
        command: 'moveDown',
        key: 'Shift'
    }]
    constructor(){
        window.addEventListener('keydown', this.handleInput.bind(this));
    }
    private _eventHandlerMap: {[key: string]: Function} = {};
    registerEventHandlerMap(eventHandlerMap: {[key: string]: Function}): void {
        this._eventHandlerMap = eventHandlerMap;
    }
    handleInput(event: KeyboardEvent): void {
        for(let mapping of this.mappings){
            if(event.key === mapping.key){
                this._eventHandlerMap[mapping.command]();
            }
        }
    
    }
}

class Thing extends Space {
    private _spaceID: string;
    set spaceID(id: string){
        this._spaceID = id;
    }
    get spaceID(): string {
        return this._spaceID;
    }
}

class Neat {

    private loadedSpaceIDs: string[] = [];
    private spaceDataCache: SpaceDataCache = {};
    public typeConstructors: {[key: string]: new(...args: any[]) => any} = {};
    private keyEvents: KeyboardCommandHandler;

    constructor() {
        console.log('Hello, world!');
        this.keyEvents = new KeyboardCommandHandler();
    }

    public registerKeymap(keymap: {[key: string]: Function}): void {
        this.keyEvents.registerEventHandlerMap(keymap);
    }

    newSpace(){
        // console.log('newSpace');
        let newSpace = new Space();
        this.loadedSpaceIDs.push(newSpace.guid);
        this.spaceDataCache[newSpace.guid] = newSpace;
        return newSpace;
    }

    createThing(spaceID: string){
        if(this.loadedSpaceIDs.includes(spaceID)){
            let newThing = new Thing();
            // current borrower id
            newThing.spaceID = spaceID; 
            return newThing;
        } else {
            console.error('Space with ID ' + spaceID + ' does not exist.');
            return null;
        }
    }

    defineType(typeName: string, typeConstructor: {new(deserializedState: any): any}){
        this.typeConstructors[typeName] = typeConstructor;
    }

    
}

let neat: Neat;



/**
 * A special "Thing" that keeps track of states (basically a finite state machine)
 */
class FSMThing extends Thing {
    public _state: string;
    public set state(state: string){
        this._state = state;
    }
    public get state(): string {
        return this._state;
    }
}

/**
 * A "Viewer" which extends the FSMThing.
 * The Viewer holds a cachable, lazily evaluated State.
 * State can be observed.
 */
class Viewer extends FSMThing {
    // private _stateCache: string;
    // public get state(): string {
    //     if(!this._stateCache){
    //         this._stateCache = super.state;
    //     }
    //     return this._stateCache;
    // }
    // public set state(state: string){
    //     this._stateCache = state;
    //     super.state = state;
    // }

    // todo: define "States" of Viewer

    currentlyViewingHyperAddress: number[] = [0, 0, 0, 0];

    constructor(){
        super();
        this.state = 'new';
    }

    resize(): void {
        resizeCanvas(windowWidth, windowHeight);
    }
    draw(): void {
        // using p5.js, render the currently viewed hyper address as text in white, bold, top left
        fill(255);
        textSize(32);
        textFont('Helvetica');
        textStyle(BOLD);
        text(`hyperA:`+this.currentlyViewingHyperAddress.join('.'), 10, 100);
    }
}


/**
 * DeserializedState is a wrapper type for the deserialized state.
 */
type DeserializedState = {
    [key: string]: any;
};

class StateSerializer extends Thing {
    private _stateKey: string;
    private _state: string;
    // TODO: dynamic type casting for the deserialized state
    private _deserializedState: any;
    private _instance: any;
    public get instance(): any {
        this._instance = this._instance || this.freshInstance();
        return this._instance;
    }
    public freshInstance(): any {
        return new neat.typeConstructors[this._stateKey](this._deserializedState);
    }
    set stateKey(key: string){
        this._stateKey = key;
    }
    get stateKey(): string {
        return this._stateKey;
    }
    saveState(): void {
        localStorage.setItem(this._stateKey, JSON.stringify(this._state));
    }
    loadState(): void {
        let maybeNull = localStorage.getItem(this._stateKey);
        if(maybeNull && typeof maybeNull === 'string'){
            this._state = maybeNull;
        }
        try {
            this._deserializedState = JSON.parse(this._state);
        } catch (error) {
            console.error('Failed to deserialize state:', error);
        }
    }
}

class IdentityMatrix {
    private _pos: number[];
    private _rot: number[];
    private _scale: number[];
    private _idMatrix: number[][];

    constructor() {
        this._pos = [0, 0, 0];
        this._rot = [0, 0, 0];
        this._scale = [1, 1, 1];
        this._idMatrix = this.calculateIdentityMatrix();
    }

    get pos(): number[] {
        return this._pos;
    }

    get rot(): number[] {
        return this._rot;
    }

    get scale(): number[] {
        return this._scale;
    }

    get idMatrix(): number[][] {
        return this._idMatrix;
    }

    calculateIdentityMatrix(): number[][] {
        let identityMatrix: number[][] = [
            [1, 0, 0, this._pos[0]],
            [0, 1, 0, this._pos[1]],
            [0, 0, 1, this._pos[2]],
            [0, 0, 0, 1]
        ];
        // TODO: Implement rotation and scale transformations
        return identityMatrix;
    }

    private _hash: string;
    private _dirty: boolean = true;

    toString(): string {
        if (this._dirty) {
            this._hash = '';
            for (let i = 0; i < this._idMatrix.length; i++) {
                for (let j = 0; j < this._idMatrix[i].length; j++) {
                    this._hash += this._idMatrix[i][j].toString(16);
                }
            }
            this._dirty = false;
        }
        return this._hash;
    }

    operateOnMatrix(operation: Function): void {
        // Implement the operation on the identity matrix
    }
}


// domready; make a new Neat instance
document.addEventListener('DOMContentLoaded', function(){
    let neat = new Neat();
    (window as any).neat = neat;
    (window as any).neat.newSpace();
    let newThing = (window as any).neat.createThing((window as any).neat.loadedSpaceIDs[0]);
    console.log(newThing);

    neat.defineType("IdentityMatrix", IdentityMatrix);

    // add a new "viewer"
    let newViewer = new Viewer();
    newViewer.spaceID = (window as any).neat.loadedSpaceIDs[0];
    newViewer.state = 'new';

    // define state "fields" (properties, valueChannels, valueStreams, Promises, etc...)
    // newViewer.defineField('name', 'string');
    // newViewer.defineField('viewMatrix', 'IdentityMatrix');
    // // The 'modifications' field is an array of 'Modification' objects.
    // newViewer.defineField('modifications', 'Modification[]');

    // spaces are fractally nested,
    // therefore, we only hold references to roots, parents, and children
    // the rest of the space is a cacheable, lazily evaluated state

    // let's define a root space with 4 nested spaces, each of which will, in turn, 
    // contain 3 nested spaces each, each of those will contain 2, and the final layer
    // will contain 1 space each
    // we will keep track (in the viewer) of our coordinates within this hyper-space
    // we will use those coordinates as a basis for navigation within the hyper-space
    // we will show how we can place arbitrary links between the hyperspaces,
    // and how the AI navigation tool can either linearly traverse the hyperspace,
    // or walk the tree of links to find the shortest path between two points
    // and so much more, but this is just the mvp navigation demo
    // so let's get started!
    for(let i = 0; i < 4; i++){
        for(let j = 0; j < 3; j++){
            for(let k = 0; k < 2; k++){
                for(let l = 0; l < 1; l++){
                    let spaceAtPoint = (window as any).neat.newSpace();
                    spaceAtPoint.setHyperAddress([i, j, k, l]);
                }
            }
        }
    }

    neat.registerKeymap(
        {
            moveForward: function(){
                newViewer.currentlyViewingHyperAddress[0]++;
            },
            moveBackward: function(){
                newViewer.currentlyViewingHyperAddress[0]--;
            },
            moveLeft: function(){
                newViewer.currentlyViewingHyperAddress[1]--;
            },
            moveRight: function(){
                newViewer.currentlyViewingHyperAddress[1]++;
            },
            moveUp: function(){
                newViewer.currentlyViewingHyperAddress[2]++;
            },
            moveDown: function(){
                newViewer.currentlyViewingHyperAddress[2]--;
            }
        }
    )

    window.draw = function(){
        newViewer.draw();
    }

    window.addEventListener('resize', function(){
        newViewer.resize();
    })
    setTimeout(function(){
        newViewer.resize();
    },500);

});