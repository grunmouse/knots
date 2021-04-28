const server = require('./server/server.js');

server(8888).catch(e=>console.log(e.stack));