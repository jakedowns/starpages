import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import axios from 'axios';
import ogs from 'open-graph-scraper';

// load dotenv (.env) to process.env
import dotenv from 'dotenv';
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

import Peer from 'peerjs';

const peer = new Peer();

peer.on('open', (id) => {
  console.log('My peer ID is: ' + id);
});

peer.on('connection', (conn) => {
  conn.on('data', (data) => {
    console.log('Received', data);
  });
});

// Connect to another peer
const conn = peer.connect('another-peers-id');

conn.on('open', () => {
  conn.send('Hello!');
});



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// openai.apiKey = 'YOUR_OPENAI_API_KEY';

app.get('/', (req, res) => {
    res.send("Server is running");
});

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('prompt', async (prompt) => {
        console.log({ prompt })
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });
        socket.emit('result', chatCompletion);
    });
    socket.on('message', async (message) => {
        console.warn("got message from client", message)
    });
    socket.on('lookup', async (url) => {
        const options = { url };
        ogs(options, (error, results, response) => {
            socket.emit('lookupResult', results);
        });
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(4001, () => console.log(`Listening on port 4001`));
