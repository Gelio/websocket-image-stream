const express = require('express')
const config = require('./config.js')
const connectionHandler = require('./connection-handler.js')
const app = express()
const Streamer = require('./streamer.js')
const path = require('path')

if (process.argv[2] === 'production') { config.port = process.env.PORT || config.port || 8080 } // for heroku, where server needs to listen on a specific port given via environment variable

// Serve files from the public directory
app.use(express.static(path.join(__dirname, 'public')))

// Handle 404 errors
app.use(function (req, res) {
  res.status(404)
  res.sendFile(path.join(__dirname, '/public/error404.html'))
})

// Start the server and save a httpServer object
const httpServer = app.listen(config.port, 'localhost', function () {
  console.log('Listening on http://' + httpServer.address().address + ':' + config.port + '/')

  Streamer.fetchFilesList().then(function () {
    connectionHandler(httpServer)
    console.log(Streamer.filesList)
  }, function (error) {
    console.error('Error', error)
  })
})

/*
    Alternative method if the previous one doesn't work

    // Create a HTTP server in order to access that HTTPServer object
    httpServer = http.createServer(app);

    // Start the server
    httpServer.listen(config.port, function() {
    // copy the contents of the function above
 });
*/
