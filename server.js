const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const openai = require('openai');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

openai.apiKey = 'YOUR_OPENAI_API_KEY';

app.get('/', (req, res) => {
    res.send("Server is running");
});

io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('prompt', async (prompt) => {
        const result = await openai.Completion.create({
            engine: 'davinci',
            prompt: prompt,
            max_tokens: 100
        });
        socket.emit('result', result.choices[0].text);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(4001, () => console.log(`Listening on port 4001`));
