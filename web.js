var express = require('express');
var sys = require('sys');
var twitter = require('twitter');
var logging = require('node-logging');
var query = "defiantly";

logging.setLevel('error');

var app = express.createServer();
app.register('.html', require('jade'));
app.set("view options", { layout: false });
app.listen(process.env.PORT || 3001);

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

var io = require('socket.io').listen(app);
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

io.sockets.on('connection', function (socket) { 
  twit.stream('user', {track: query}, function(stream) {
    stream.on('data', function (data) {
      if(data.text) {
        if(!data.text.startsWith("RT")) {
          data.split = data.text.split(" ")
          socket.volatile.emit('tweet', data);
        }
      }
    });
  });

  socket.on('disconnect', function () {
  });
});


var fs = require('fs');
eval(fs.readFileSync('credentials.js')+'');
