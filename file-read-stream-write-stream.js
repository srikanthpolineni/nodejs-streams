const fs = require("fs");
const reader = fs.createReadStream('./sample.txt');
const writer = fs.createWriteStream('./sample_copy.txt');

reader.pipe(writer);