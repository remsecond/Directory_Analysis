import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';

const filePath = path.join(process.cwd(), 'test', 'sample.txt');
const form = new FormData();
form.append('file', fs.createReadStream(filePath));

fetch('http://localhost:3002/process', {
  method: 'POST',
  body: form
})
.then(res => res.text())
.then(text => {
  const response = JSON.parse(text);
  console.log('Response:', JSON.stringify(response, null, 2));
})
.catch(err => console.error('Error:', err));
