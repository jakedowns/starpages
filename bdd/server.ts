import * as express from 'express';
import * as http from 'http';
import * as socketIo from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = socketIo.listen(server);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('message', { id: '12345' });

    socket.on('message', (message) => {
        console.log('Message Received: ' + message);
        socket.emit('message', { you_said: message });
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
