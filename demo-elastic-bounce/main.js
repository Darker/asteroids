var express = require('express');
var app = express();
var server = require('http').Server(app);
//var io = require('socket.io')(server);

server.listen(80);
app.use(express.static(__dirname));

var requirejs = require("requirejs");
requirejs.config({
    baseUrl: __dirname,
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require,
    waitSeconds: 20
});
/*requirejs(['server', 'client'], function(Server, Client) {
  var server = new Server(io);
  io.on('connection', function (socket) {
     new Client(socket, server);
  });
});           */