'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('./configs/config.js');
var redis = require('redis');
var client = redis.createClient();
var app = express();
var token = config.token;

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot');
})

// Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
})

app.post('/webhook/', function (req, res) {
    var messaging_events = req.body.entry[0].messaging;
    for (var i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;
        if (event.message && event.message.text) {
            var text = event.message.text;
            var space = text.indexOf(' ');
            var name = text.substring(0, space);
            var msg = '';

            if (name === 'nba') {
                var key = 'nba-' + text.substring(space, text.length).trim();
                getData(key, function(err, data) {
                    if (err || !data) {
                        return sendTextMessage(sender, 'oops. 沒有比賽');
                    }

                    var todayData = JSON.parse(data);
                    var games = todayData.games;
                    for (var i = 0 ; i < games.game.length ; i++) {
                        msg += games.game[i].home.nickname + ' V.S. ' + games.game[i].visitor.nickname + '\n'
                             + games.game[i].home.score + ':' + games.game[i].visitor.score + '\n'
                    }
                    return sendTextMessage(sender, msg);
                });
            } else {
                msg = 'Hi, nice to meet you.';
                sendTextMessage(sender, msg);
            }
        }
    }
    res.sendStatus(200)
});

function getData(key, callback) {
    client.get(key, function(err, reply) {
        if (err) {
            callback(err, null);
        }
        return callback(null, reply);
    });
}

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
}

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
})