const config = require('./config.js'),
    fs = require('fs'),
    path = require('path');

var Streamer = {
    connectionList: [],
    filesList: [],
    addNewConnection: addNewConnection,
    fetchFilesList: fetchFilesList,
    beginFrameset: beginFrameset,
    sendFrame: sendFrame
};

var extensionsHeaders = {
    'png': 'data:image/png;base64,'
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
    var self = this,
        promiseToContinue = new Promise(0);

    if(config.checkDataBeforeEachFrameset)
        promiseToContinue = fetchFilesList();

    promiseToContinue.then(function() {
        if(self.filesList.length == 0) {
            console.log('Nothing data to send, waiting ' + config.delayAfterNullData);
            return setTimeout(self.beginFrameset, config.delayAfterNullData);
        }

        sendFrame(0);
    }, function (error) {
        console.error('Error: ', error);
    });
}

function sendFrame(i) {
    if(this.connectionList.length == 0)
        return false;   // didn't send the frame, no listeners

    if(i >= this.filesList.length) {
        // Start next frameset
        return beginFrameset();
    }
    else {
        // Set Timeout for next frame
        setTimeout(sendFrame, config.frameDelay, i+1);
    }

    var self = this;

    // Check if file exists
    fs.stat(__dirname + '/' + this.filesList[i], function(err, stats) {
        if(err || !stats.isFile())
            return console.error('File ' + __dirname + '/' + self.filesList[i] + ' was to be sent but doesn\'t exist.');

        // Check extension, then select a specific header
        var extension = path.extname(__dirname + '/' + self.filesList[i]).slice(1);
        if(!extensionsHeaders[extension])
            return console.error('File ' + + __dirname + '/' + self.filesList[i] + ' has an unknown extension that cannot be handled.');

        fs.readFile(__dirname + '/' + self.filesList[i], function(err, data) {
            self.connectionList.forEach(function(connection) {
                connection.respond('next-frame', {'frameID': i, 'imageData': extensionsHeaders[extension] + data.toString('base64')});
            });

            if(config.deleteDataAfterSending) {
                // Delete file
                fs.unlink(__dirname + '/' + self.filesList[i], function(err) {
                    if(err)
                        return console.error('Cannot delete file ' + __dirname + '/' + self.filesList[i]);
                });
            }
        });
    });
}