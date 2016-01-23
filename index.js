var WebSocketServer = require('websocket').server,
    express = require('express'),
    fs = require('fs'),
    url = require('url'),
    config = require('./config.js');
    app = express();

if(process.argv[2] == 'production')
    config.port = process.env.PORT;     // for heroku, where server needs to listen on a specific port given via environment variable


// Serve files from the public directory
app.use(express.static(__dirname + '/public'));


// Handle 404 errors
app.use(function(req, res, next) {
    res.status(404);
    res.sendFile(__dirname + '/public/error404.html');
});


// Start the server
app.listen(config.port, function() {
    console.log('Listening on port ', config.port);
});