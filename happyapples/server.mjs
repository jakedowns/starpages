import cors from 'cors';
import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
// Importing socket.io as a named import due to ES6 module syntax
import { Server as socketIO } from 'socket.io';

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

// Event listener for new connections on the Socket.IO server
io.on('connection', (socket) => {
    console.log('New client connected on Socket.IO');

    // tell them their id
    socket.emit('message', JSON.stringify({
        type: "id",
        clientId: socket.id
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
                type: "circleClickedRemote",
                colorIndex: message.colorIndex,
                clickedByClientId: socket.id
            }));
        }else{
            console.warn('unknown message type: ' + message.type)
        }
    });

    // Event listener for client disconnect on the Socket.IO server
    socket.on('disconnect', () => {
        console.log('Client has disconnected from Socket.IO');
        // Handle client disconnect.
    });
});

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
