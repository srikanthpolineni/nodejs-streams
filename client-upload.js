var axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const http = require('http');
var request = require('request');

// fs.createReadStream('./sample.txt')
//     .pipe(request.post("http://localhost:3000/api0"));

// fs.createReadStream('./sample.txt')
//     .pipe(request.post("http://localhost:3000/api1"));

const form = new FormData();
form.append('file', fs.createReadStream('./sample.txt'), 'sample.txt');
(async () => {
    const response = await axios.post('http://localhost:3000/api2', form, {
        'maxContentLength': Infinity,
        'maxBodyLength': Infinity,
        headers: {
            ...form.getHeaders()
        },
    });
    console.log(response);
})();

