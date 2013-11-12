var express = require('express');
var sys = require('sys');
var twitter = require('twitter');
var logging = require('node-logging');

var query = "defiantly";
var enableTweetingResponses = true;

logging.setLevel('error');

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

var app = express.createServer();
app.register('.html', require('jade'));
app.set("view options", { layout: false });
app.listen(process.env.PORT || 3001);

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
          tweetLiteraryGeniusIfNeedbe(data);
        }
      }
    });
  });

  socket.on('disconnect', function () {
  });
});


var fs = require('fs');
eval(fs.readFileSync('credentials.js')+'');

function tweetLiteraryGeniusIfNeedbe(tweet) {
  if (!enableTweetingResponses) { return; }

  var lcText = tweet.text.toLowerCase();
  // If 'definitely' and 'defiantly' are mentioned, and 'defiantly_not' is NOT mentioned, and the tweet isn't from me, tweet a response
  if ((lcText.indexOf('definitely') >= 0) && 
      (lcText.indexOf('defiantly') >= 0) && 
      (lcText.indexOf('defiantly_not') < 0) && 
      (tweet.user.screen_name != "defiantly_not") &&
      (randomlyDecideWhetherToTweet())) {
    response = createTweetResponse("@" + tweet.user.screen_name);
    // Tweet with 10 second delay
    setTimeout(function(){ 
      console.log("========================================");
      console.log("Sending Tweet with content: " + response);
      console.log("========================================");
      twit.post('https://api.twitter.com/1.1/statuses/update.json', { status: response }, function(err, reply) {
        console.log("error occurred whilst tweeting");
        console.log(err);
        console.log(reply);
      });
    }, 10000);
  }
}

function createTweetResponse(screen_name) {
  var randomNum = Math.floor(Math.random()*4);
  var response = screen_name + " that's why I made defiantly-not.com, watch people spell 'definitely' wrong in real-time! :)";

  switch(randomNum)
  {
  case 0:
    response = screen_name + ", you can watch people commit that grammar crime in real-time at defiantly-not.com!";
    break;
  case 1:
    response = screen_name +  " that's why I made defiantly-not.com, watch people spell 'definitely' wrong in real-time! :)";
    break;
  case 2:
    response = "Haha! " + screen_name + " take a look at defiantly-not.com for definitely-defiantly grammar-fails as they happen!";
    break;
  case 3:
    response = screen_name + " I made a website that shows definitely/defiantly mistakes for fun(!) - defiantly-not.com";
    break;
  case 3:
    response = screen_name + " it's kinda addictive watching 'definitely' spelling mistakes, see defiantly-not.com!";
    break;
  }

  return response;
}

function randomlyDecideWhetherToTweet() {
  var willTweet = (Math.floor(Math.random()*20) == 1);
  return willTweet;
}
