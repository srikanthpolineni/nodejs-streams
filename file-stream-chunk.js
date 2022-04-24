const fs = require('fs');
const reader = fs.createReadStream('./sample.txt');
reader.on('open', () => {
    console.log('file opened');
});

reader.on('data', (chunk) => {
    console.log("\n \n \n \n \n \n data received:", chunk.toString());
});

reader.on('end', () => {
    console.log('file ended');

});

reader.on('close', () => {
    console.log('file closed');
});
