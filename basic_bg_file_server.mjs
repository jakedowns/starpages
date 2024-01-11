import express from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.static(path.resolve('')));

https.createServer({
    key: fs.readFileSync(path.resolve('./self-signed-neat.app.key')),
    cert: fs.readFileSync(path.resolve('./self-signed-neat.app.key.crt'))
}, app).listen(8080, () => {
    console.log('Listening on 8080, too')
});
