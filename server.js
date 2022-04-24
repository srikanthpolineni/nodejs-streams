const express = require('express');
const busboy = require('busboy');
const app = express();
const fs = require('fs');
const es = require('event-stream');

app.get('/api', function (req, res) {
    res.send({ status: "OK" })
});

app.post('/api0', function (req, res) {
    req.on('data', (data) => {
        console.log(data);
        console.log("\n ---------------------------------------------------------------------- \n");
    });
    req.on('end', () => {
        res.end();
    });
});

app.post('/api1', function (req, res) {

    const writerStream = fs.createWriteStream('./sample_copy.txt');
    req.pipe(writerStream); //write to local filename
    //req.pipe(request.post('http://abc.com/api')); //upstream to another API
    req.on('end', function () {
        res.end();
    });
});

app.post('/api2', function (req, res) {
    const bb = busboy({ headers: req.headers });
    bb.on('file', function (name, file, filename, encoding, mimetype) {
        console.log('[POST] api on file');
        file.on('data', function (data) {
            //console.log(`File [${name}] got ${data.length} bytes`);
        });
        file.on('close', function (data) {
            console.log(`File [${name}] close`);
        });
        console.log('[POST] api on stream');
        const writerStream = fs.createWriteStream('./sample_copy.txt');
        file.pipe(writerStream);
    });
    bb.on('close', function () {
        console.log('[POST] api on close');
        res.writeHead(200, { Connection: 'close' });
        res.end("That's all folks!");
    });
    req.pipe(bb);
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});