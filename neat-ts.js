"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is a runtime instance of a space. They can be dehydrated to JSON
 * and re-hydrated over the wire.
 */
var Space = /** @class */ (function () {
    function Space() {
        this.typeConstructors = {};
        // internal field instance references
        this.fieldInstances = {};
        // remember the args we were passed at definition time
        this.fieldDefinitions = {};
    }
    Space.prototype.setHyperAddress = function (address) {
        this._hyperAddress = address;
        console.warn("My HyperAddress Is Now ".concat(this._hyperAddress.join('.')));
    };
    Object.defineProperty(Space.prototype, "guid", {
        // constructor() {
        //     this._guid = this.generateGUID();
        // }
        get: function () {
            if (!this._guid) {
                this._guid = this.generateGUID();
            }
            return this._guid;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * This is a simple implementation of the UUID v4 algorithm for generating unique identifiers.
     * It replaces 'x' and 'y' characters in the template string with random hexadecimal digits,
     * ensuring that the resulting string follows the 8-4-4-4-12 format of a UUID.
     */
    Space.prototype.generateGUID = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    Space.prototype.defineField = function (fieldName, fieldType, defaults) {
        if (defaults === void 0) { defaults = {}; }
        this.fieldDefinitions[fieldName] = {
            fieldType: fieldType,
            defaults: defaults
        };
        if (this.typeConstructors[fieldType]) {
            this.fieldInstances[fieldName] = new this.typeConstructors[fieldType](defaults);
        }
        else {
            console.error('Type ' + fieldType + ' does not exist.');
        }
    };
    return Space;
}());
var KeyboardCommandHandler = /** @class */ (function () {
    function KeyboardCommandHandler() {
        this.mappings = [{
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
            }];
        this._eventHandlerMap = {};
        window.addEventListener('keydown', this.handleInput.bind(this));
    }
    KeyboardCommandHandler.prototype.registerEventHandlerMap = function (eventHandlerMap) {
        this._eventHandlerMap = eventHandlerMap;
    };
    KeyboardCommandHandler.prototype.handleInput = function (event) {
        for (var _i = 0, _a = this.mappings; _i < _a.length; _i++) {
            var mapping = _a[_i];
            if (event.key === mapping.key) {
                this._eventHandlerMap[mapping.command]();
            }
        }
    };
    return KeyboardCommandHandler;
}());
var Thing = /** @class */ (function (_super) {
    __extends(Thing, _super);
    function Thing() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(Thing.prototype, "spaceID", {
        get: function () {
            return this._spaceID;
        },
        set: function (id) {
            this._spaceID = id;
        },
        enumerable: false,
        configurable: true
    });
    return Thing;
}(Space));
var Neat = /** @class */ (function () {
    function Neat() {
        this.loadedSpaceIDs = [];
        this.spaceDataCache = {};
        this.typeConstructors = {};
        console.log('Hello, world!');
        this.keyEvents = new KeyboardCommandHandler();
    }
    Object.defineProperty(Neat.prototype, "registerKeymap", {
        get: function () {
            var _this = this;
            return function (keymap) {
                _this.keyEvents.registerEventHandlerMap(keymap);
            };
        },
        enumerable: false,
        configurable: true
    });
    Neat.prototype.newSpace = function () {
        // console.log('newSpace');
        var newSpace = new Space();
        this.loadedSpaceIDs.push(newSpace.guid);
        this.spaceDataCache[newSpace.guid] = newSpace;
        return newSpace;
    };
    Neat.prototype.createThing = function (spaceID) {
        if (this.loadedSpaceIDs.includes(spaceID)) {
            var newThing = new Thing();
            // current borrower id
            newThing.spaceID = spaceID;
            return newThing;
        }
        else {
            console.error('Space with ID ' + spaceID + ' does not exist.');
            return null;
        }
    };
    Neat.prototype.defineType = function (typeName, typeConstructor) {
        this.typeConstructors[typeName] = typeConstructor;
    };
    return Neat;
}());
var neat;
/**
 * A special "Thing" that keeps track of states (basically a finite state machine)
 */
var FSMThing = /** @class */ (function (_super) {
    __extends(FSMThing, _super);
    function FSMThing() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(FSMThing.prototype, "state", {
        get: function () {
            return this._state;
        },
        set: function (state) {
            this._state = state;
        },
        enumerable: false,
        configurable: true
    });
    return FSMThing;
}(Thing));
/**
 * A "Viewer" which extends the FSMThing.
 * The Viewer holds a cachable, lazily evaluated State.
 * State can be observed.
 */
var Viewer = /** @class */ (function (_super) {
    __extends(Viewer, _super);
    function Viewer() {
        var _this = _super.call(this) || this;
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
        _this.currentlyViewingHyperAddress = [0, 0, 0, 0];
        _this.state = 'new';
        return _this;
    }
    Viewer.prototype.resize = function () {
        resizeCanvas(windowWidth, windowHeight);
    };
    Viewer.prototype.draw = function () {
        // using p5.js, render the currently viewed hyper address as text in white, bold, top left
        fill(255);
        textSize(32);
        textFont('Helvetica');
        textStyle(BOLD);
        text("hyperA:" + this.currentlyViewingHyperAddress.join('.'), 10, 100);
    };
    return Viewer;
}(FSMThing));
var StateSerializer = /** @class */ (function (_super) {
    __extends(StateSerializer, _super);
    function StateSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(StateSerializer.prototype, "instance", {
        get: function () {
            this._instance = this._instance || this.freshInstance();
            return this._instance;
        },
        enumerable: false,
        configurable: true
    });
    StateSerializer.prototype.freshInstance = function () {
        return new neat.typeConstructors[this._stateKey](this._deserializedState);
    };
    Object.defineProperty(StateSerializer.prototype, "stateKey", {
        get: function () {
            return this._stateKey;
        },
        set: function (key) {
            this._stateKey = key;
        },
        enumerable: false,
        configurable: true
    });
    StateSerializer.prototype.saveState = function () {
        localStorage.setItem(this._stateKey, JSON.stringify(this._state));
    };
    StateSerializer.prototype.loadState = function () {
        var maybeNull = localStorage.getItem(this._stateKey);
        if (maybeNull && typeof maybeNull === 'string') {
            this._state = maybeNull;
        }
        try {
            this._deserializedState = JSON.parse(this._state);
        }
        catch (error) {
            console.error('Failed to deserialize state:', error);
        }
    };
    return StateSerializer;
}(Thing));
var IdentityMatrix = /** @class */ (function () {
    function IdentityMatrix() {
        this._dirty = true;
        this._pos = [0, 0, 0];
        this._rot = [0, 0, 0];
        this._scale = [1, 1, 1];
        this._idMatrix = this.calculateIdentityMatrix();
    }
    Object.defineProperty(IdentityMatrix.prototype, "pos", {
        get: function () {
            return this._pos;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IdentityMatrix.prototype, "rot", {
        get: function () {
            return this._rot;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IdentityMatrix.prototype, "scale", {
        get: function () {
            return this._scale;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IdentityMatrix.prototype, "idMatrix", {
        get: function () {
            return this._idMatrix;
        },
        enumerable: false,
        configurable: true
    });
    IdentityMatrix.prototype.calculateIdentityMatrix = function () {
        var identityMatrix = [
            [1, 0, 0, this._pos[0]],
            [0, 1, 0, this._pos[1]],
            [0, 0, 1, this._pos[2]],
            [0, 0, 0, 1]
        ];
        // TODO: Implement rotation and scale transformations
        return identityMatrix;
    };
    IdentityMatrix.prototype.toString = function () {
        if (this._dirty) {
            this._hash = '';
            for (var i = 0; i < this._idMatrix.length; i++) {
                for (var j = 0; j < this._idMatrix[i].length; j++) {
                    this._hash += this._idMatrix[i][j].toString(16);
                }
            }
            this._dirty = false;
        }
        return this._hash;
    };
    IdentityMatrix.prototype.operateOnMatrix = function (operation) {
        // Implement the operation on the identity matrix
    };
    return IdentityMatrix;
}());
// domready; make a new Neat instance
document.addEventListener('DOMContentLoaded', function () {
    var neat = new Neat();
    window.neat = neat;
    window.neat.newSpace();
    var newThing = window.neat.createThing(window.neat.loadedSpaceIDs[0]);
    console.log(newThing);
    neat.defineType("IdentityMatrix", IdentityMatrix);
    // add a new "viewer"
    var newViewer = new Viewer();
    newViewer.spaceID = window.neat.loadedSpaceIDs[0];
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
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 2; k++) {
                for (var l = 0; l < 1; l++) {
                    var spaceAtPoint = window.neat.newSpace();
                    spaceAtPoint.setHyperAddress([i, j, k, l]);
                }
            }
        }
    }
    neat.registerKeymap({
        moveForward: function () {
            newViewer.currentlyViewingHyperAddress[0]++;
        },
        moveBackward: function () {
            newViewer.currentlyViewingHyperAddress[0]--;
        },
        moveLeft: function () {
            newViewer.currentlyViewingHyperAddress[1]--;
        },
        moveRight: function () {
            newViewer.currentlyViewingHyperAddress[1]++;
        },
        moveUp: function () {
            newViewer.currentlyViewingHyperAddress[2]++;
        },
        moveDown: function () {
            newViewer.currentlyViewingHyperAddress[2]--;
        }
    })(window).draw = function () {
        newViewer.draw();
    };
    window.draw = function () {
        newViewer.draw();
    };
    window.addEventListener('resize', function () {
        newViewer.resize();
    });
    setTimeout(function () {
        newViewer.resize();
    }, 500);
});
