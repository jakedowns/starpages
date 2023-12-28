import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { setupDatabase } from './database.ts'
import type {Database} from 'sqlite3';

const app = express();
const server = http.createServer(app);
// Configure Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"] // Allow specific HTTP request methods
    }
});

// Setup Database
let db: Database;
setupDatabase((_db: any) => {
    db = _db;
    console.warn('db ready');
});

// Connect to Socket.IO serve

let online_users: any = {};

io.on('connection', (socket) => {
    console.log('a user connected');
    let userID = socket.id;
    online_users[userID] = socket;
    socket.emit('message', { id: userID });

    socket.on('message', (message: string) => {
        console.log('Message Received: ' + message);

        if(!(
            message?.includes('{') 
            || message?.includes('}')
            || message?.includes('[')
            || message?.includes(']')
        )){
            console.warn('not json')
            return;
        }

        // verify our db connection
        if (!db) {
            console.error('db not ready');
            return;
        }


        // if the message is json, then it's a command
        try {
            const command = JSON.parse(message);
            console.warn('parsed to: ',command, {'for socket id':socket.id})
            if (command.type === 'get') {
                if (command.target === 'features') {
                    console.warn('running select...', {tsocket: typeof socket, sid: socket.id});
                    db.all('SELECT * FROM features', [], (err: any, rows: any) => {
                        console.warn('get features',{err,rows})
                        if (err) {
                            console.error(err);
                            return;
                        }
                        socket.emit('message', { features: rows });
                    });
                }else{
                    console.warn('Unknown get target',command);
                }
            }
            else if(command.type === 'put') {
                if(command.target === 'features') {
                    console.warn('running insert...');
                    db.run('INSERT INTO features (name, description) VALUES (?, ?)', [command.name, command.description], (err: any) => {
                        console.warn('put features',{err})
                        if (err) {
                            console.error(err);
                            return;
                        }
                        socket.emit('message', { success: true });
                    });
                }else{
                    console.warn('Unknown put target',command);
                }
            }else{
                console.warn('Unknown command',command);
            }
        } catch (e) {
            console.warn('Message was not JSON',e);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        //delete online_users[userID];
    });
});

server.listen(3009, () => {
    console.log('listening on *:3009');
});
