const fs = require('fs');
const es = require('event-stream');
let lineNbr = 0;
const s = fs.createReadStream('./sample.txt')
    .pipe(es.split())
    .pipe(es.mapSync((line) => {
        s.pause();
        lineNbr++;
        console.log(`${lineNbr} : ${line}`);
        s.resume();
    }))
    .on('error', (err) => {
        console.log(err);
    })
    .on('end', () => {
        console.log('Red entire file');
    });