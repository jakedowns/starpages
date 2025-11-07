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

// start a basic file server in the background
import { fork } from 'child_process';
const fileServer = fork('basic_bg_file_server.mjs');

/*
*/
const anger_management_course = [
    [
        "Welcome to a journey of self-discovery and transformation with our Anger Management Course. Designed to empower individuals from all walks of life, this course offers an in-depth understanding of anger, its causes, and its impact on both personal and professional relationships. Through a blend of theoretical knowledge and practical exercises, participants will learn to recognize their anger triggers, develop effective communication skills, and master techniques for stress management and problem-solving. Our interactive sessions, including role-playing and personal reflections, provide a safe space for growth and learning. Join us to harness the power of emotional intelligence, improve your relationships, and navigate life with greater calmness and control.",
    ],
    [
        "Master Your Emotions: Transformative Anger Management Course",
        "Unlock the secrets to controlling anger and improving relationships with our short, impactful Anger Management Course. Gain essential skills for emotional intelligence and a calmer life.",
    ],
    [
        
    ],
    [
        "1. understanding anger",
        "2. triggers & warning signs",
        "3. communication skills",
            // active listening
            // peaceful conflict resolution
        "",
            // relaxation, mindfulness, deep-breathing
        "6. anger control plans",
        "7. role playing and scenarios",
            // duke gunsten puppets
    ]
    // grief
]

// import Peer from 'simple-peer';

// const peer = new Peer({
//   initiator: true
// });

// peer.on('signal', data => {
//   // When we have the signal data, we need to send it to the other peer
//   // You can do this over any kind of data transfer, a WebSocket is a good choice
//   sendSignalToOtherPeer(data);
// });

// peer.on('data', data => {
//   console.log('Received', data);
// });

// // When the other peer returns their signal data, we can use it to establish a connection
// peer.signal(receivedSignalData);



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
        // reply
        socket.emit('message', {you_said:message,i_say:"hey!"})
    });
    socket.on('request-metadata', async (url) => {
        const ogs = require('open-graph-scraper');
        const options = { url: url };
        ogs(options)
        .then((data) => {
            const { error, result } = data;
            if (error) console.log('Error:', error);
            else {
                // Save the result to a JSON file
                const fs = require('fs');
                fs.writeFile('metadata.json', JSON.stringify(result), (err) => {
                    if (err) throw err;
                    console.log('Metadata saved to metadata.json');
                });
            }
        });
        socket.emit('metadata', response.data);
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

