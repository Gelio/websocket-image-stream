const config = require('./config.js'),
      fs = require('fs');

var Streamer = {
    connectionList: [],
    filesList: [],
    addNewConnection: addNewConnection,
    fetchFilesList: fetchFilesList,
    beginFrameset: beginFrameset,
    sendFrame: sendFrame
};

module.exports = Streamer;

function addNewConnection(connection) {
    var found = false;
    this.connectionList.forEach(function(currConn) {
        if(!found && connection === currConn)
            found = true;
    });

    if(found)
        return false;

    this.connectionList.push(connection);
    return true;
}

function fetchFilesList() {
    var self = this;

    return new Promise(function(resolve, reject) {
        fs.readdir(__dirname + '/' + config.dataDir, function(err, files) {
            if(err)
                reject(new Error('cannot read from directory ' + __dirname + '/' + config.dataDir));

            self.filesList.lenght = 0;
            if(!Array.isArray(files))
                return resolve();

            files.forEach(function(file) {
                self.filesList.push(file);
            });
            resolve();
        });
    });
}

function beginFrameset() {
    var i = 0,
        self = this,
        promiseToContinue = new Promise(0);

    if(config.checkDataBeforeEachFrameset)
        promiseToContinue = fetchFilesList();

    promiseToContinue.then(function() {
        if(self.filesList.length == 0) {
            console.log('Nothing data to send, waiting ' + config.delayAfterNullData);
            return setTimeout(self.beginFrameset, config.delayAfterNullData);
        }


    }, function (error) {
        console.error('Error: ', error);
    });
}

function sendFrame(i) {
    // Set Timeout for next frame
    //  if it's the last one then set timeout for beginFrameset
    // Read file
    // Send file to each connection
    // Check if file should be deleted, delete if necessary
}