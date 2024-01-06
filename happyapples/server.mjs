import cors from 'cors';
import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
// Importing socket.io as a named import due to ES6 module syntax
import { Server as socketIO } from 'socket.io';

// import the shared pool of "colors" from the shared data.js file
// import {colors as ColorsPool} from './shared/data.js';
import pkg from './shared/data.js';
const {
    colors: ColorsPool,
    shapes: ShapesPool
} = pkg;

// Create an express application
const app = express();
// Use cors middleware to allow all origins
app.use(cors());

// Create an HTTP server for the express application
const httpServer = http.createServer(app);

// Create an HTTPS server with the provided key and certificate for the express application
const httpsServer = https.createServer({
    key: fs.readFileSync('../self-signed-neat.app.key'),
    cert: fs.readFileSync('../self-signed-neat.app.key.crt')
}, app);

// Create a new Socket.IO server and enable WebSocket Secure (WSS) by passing the HTTPS server
const io = new socketIO(httpsServer, {
    cors: {
        origin: '*',
    }
});

function triggerReloadOnAllClients() {
    io.emit('message', JSON.stringify({
        type: "reload"
    }));
}

let nextIndex = 0;
let nextShapeIndex = 0;

/**
 * note: remember socket provides per-client data storage via:
 * socket.data = {};
 */

// Event listener for new connections on the Socket.IO server
io.on('connection', (socket) => {
    console.log('New client connected on Socket.IO');

    nextIndex = (nextIndex + 1) % ColorsPool.length;
    nextShapeIndex = (nextShapeIndex + 1) % ShapesPool.length;

    // assign a color
    // Wrap the client count to stay within the bounds of the ColorsPool array
    // Pick a random color from the ColorsPool array
    socket.data.assignedColor = ColorsPool[nextIndex];

    // assign a random position some random distance from the center contrained to a unit circle
    socket.data.assignedPosition = {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1
    }

    // tell them their id
    socket.emit('message', JSON.stringify({
        type: "id",
        clientId: socket.id,
        assignedColor: socket.data.assignedColor,
        assignedPosition: socket.data.assignedPosition,
        assignedShape: socket.data.assignedShape
    }));

    // tell them about the other clients
    // Use reduce to create an array of other clients

    // Log the length of the sockets object for debugging purposes
    console.log('sockets length:', {
        socketsLength: Object.keys(io.sockets.sockets).length,
    });

    // Create an array of other clients excluding the current socket
    let otherClients = Object.values(io.sockets.sockets).reduce((acc, s) => {
        if (s.id !== socket.id) {
            acc.push({
                clientId: s.id,
                assignedColor: s.data.assignedColor,
                assignedPosition: s.data.assignedPosition,
                assignedShape: s.data.assignedShape
            });
        }
        return acc;
    }, []);
    // Log the number of other clients for debugging purposes
    console.log('otherClients: ' + otherClients.length);

    // Emit a message with the other clients' data
    socket.emit('message', JSON.stringify({
        type: "otherClients",
        clients: otherClients
    }));

    // let _everyone_ know that a new client has connected
    io.emit('message', JSON.stringify({
        type: "clientConnected",
        clientCount: io.engine.clientsCount,
        clientId: socket.id,
        assignedColor: socket.data.assignedColor,
        assignedPosition: socket.data.assignedPosition,
        assignedShape: socket.data.assignedShape
    }));

    // Event listener for incoming messages on the Socket.IO server
    socket.on('message', (message) => {
        // decode json if we need to
        if (typeof message === "string") {
            message = JSON.parse(message);
        }
        console.log('Received message on Socket.IO: ' + JSON.stringify(message));
        if (message.type === "circleClicked") {
            // re-throw to _all_ clients (note io.emit not socket.emit) when a circleClicked event is received
            // server
            io.emit('message', JSON.stringify({
                type: "clientUpdated",
                assignedColor: ColorsPool[message.colorIndex],
                assignedPosition,
                clientId: socket.id
            }));
        }
        // pickShape
        else if(message.type === "pickShape") {
            socket.data.assignedShape = ShapesPool[nextShapeIndex];
            io.emit('message', JSON.stringify({
                type: "clientUpdated",
                assignedShape: socket.data.assignedShape,
                clientId: socket.id
            }));
        }
        else if(message.type === "pickColor") {
            socket.data.assignedColor = ColorsPool[nextIndex];
            io.emit('message', JSON.stringify({
                type: "clientUpdated",
                assignedColor: socket.data.assignedColor,
                clientId: socket.id
            }));
        }
        else if(message.type === "requestReloadAll") {
            triggerReloadOnAllClients();
        }
        else{
            console.warn('unknown message type: ' + message.type)
        }
    });

    // Event listener for client disconnect on the Socket.IO server
    socket.on('disconnect', () => {
        console.log('Client has disconnected from Socket.IO');
        
        // tell everyone
        io.emit('message', JSON.stringify({
            type: "clientDisconnected",
            clientCount: io.engine.clientsCount,
            clientId: socket.id
        }));
    });
});

// wait a bit and then request everyone reload
setTimeout(() => {
    triggerReloadOnAllClients();
}, 5000);

// periodically heartbeat to all connected clients
setInterval(() => {
    io.emit('message', JSON.stringify({
        type: "heartbeat",
        clientCount: io.engine.clientsCount
    }));
}, 1000);

// Start the HTTP server on port 8000
httpServer.listen(8000, () => {
    console.log('HTTP Server is running on http://172.27.118.25:8000');
});

// Start the HTTPS server on port 8999
httpsServer.listen(8999, () => {
    console.log('HTTPS Server is running on https://172.27.118.25:8999');
});
