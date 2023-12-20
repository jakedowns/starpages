importScripts('neatWASM.js');

// Create an instance of the Wasm module
Module.onRuntimeInitialized = function() {

};

// Define a function to handle messages from the main thread
onmessage = function(e) {
    // Perform computations using the Wasm module
    const result = Module._add(...e.data);
    // Send the result back to the main thread
    postMessage(result);
};
