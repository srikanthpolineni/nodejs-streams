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

app.post('/api3', async function (req, res) {
    try {
        const bb = busboy({ headers: req.headers });
        const awaitPayload = new Promise((resolve, reject) => {
            bb.on('field', (name, val, info) => {
                resolve(JSON.parse(val));
            });
        });

        bb.on('file', (name, file, info) => {
            function getPreSignedUrl(payload) {
                return new Promise(async (resolve, reject) => {
                    try {
                        const headers = {
                            'content-type': CONTENT_TYPE_APPLICATION_JSON
                        }
                        const preSignedUrlResponse = await axios.post(`http://localhost:8080/preSignedUploadUrl`, payload, headers);
                        if (preSignedUrlResponse.data) {
                            resolve(preSignedUrlResponse.data);
                            return;
                        }
                        reject("Error");
                    } catch (ex) {
                        reject(ex);
                    }
                });
            }

            function postDocumentToS3({ preSignedUploadUrl }) {
                return new Promise(async (resolve, reject) => {
                    try {
                         const form = new FormData();
                         form.append('file', file);
                        var options = {
                            headers: {
                                'Content-Type': ' multipart/form-data',
                                'Content-Length': 0 //add here

                            },
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity,
                        };
                        const s3Response = await axios.post(preSignedUploadUrl, form, options)
                        resolve({ status: "ok" });
                    } catch (e) {
                        reject(e);
                    }
                });
            }
            awaitPayload.then(getPreSignedUrl).then(postDocumentToS3).then(function (data) {
                res.writeHead(200, { Connection: 'close', 'Content-Type': 'application/json' });
                res.write(JSON.stringify(data));
                res.end();
            }).catch(function (err) {
                const message = "Error";
                res.writeHead(500, { Connection: 'close', 'Content-Type': 'application/json' });
                res.write(JSON.stringify({ error: { message } }));
                res.end()
            });
        });
        bb.on('close', function () {

        });

        bb.on('finish', function () {

        });
        req.pipe(bb);
    } catch (ex) {
        res.status(500).send(ex);
    }
});

app.listen(3000, () => {
    console.log('listening on port 3000');
});
