importScripts('neatWASM.js');

// Create an instance of the Wasm module
Module.onRuntimeInitialized = function() {

};

// Define a function to handle messages from the main thread
onmessage = function(e) {
    // Check if e.data is iterable before using spread syntax
    if (Symbol.iterator in Object(e.data)) {
        // Perform computations using the Wasm module
        const result = Module._add(...e.data);
        // Send the result back to the main thread
        postMessage(result);
    } else {
        console.error('TypeError: Spread syntax requires iterable[Symbol.iterator] to be a function');
    }
};
