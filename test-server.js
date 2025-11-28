const http = require('http');

// Test client server
http.get('http://localhost:3000', (res) => {
  console.log('Client server status code:', res.statusCode);
  console.log('Client server headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Client server response:', chunk.toString());
  });
}).on('error', (err) => {
  console.error('Error connecting to client server:', err.message);
});

// Test server
http.get('http://localhost:3001', (res) => {
  console.log('Server status code:', res.statusCode);
  console.log('Server headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Server response:', chunk.toString());
  });
}).on('error', (err) => {
  console.error('Error connecting to server:', err.message);
});
