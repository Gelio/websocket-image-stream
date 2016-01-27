const config = require('./config.js'),
    fs = require('fs'),
    path = require('path');

var Streamer = {
    connectionList: [],
    filesList: [],
    isStreaming: false,
    addNewConnection: addNewConnection,
    fetchFilesList: fetchFilesList,
    beginFrameset: beginFrameset,
    sendFrame: sendFrame
};

var extensionsHeaders = {
    'png': 'data:image/png;base64,',
    'gif': 'data:image/gif;base64,'
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

            self.filesList.length = 0;
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
        promiseToContinue = new Promise(resolve => resolve());

    console.log('Beginning frameset');
    if(this.framesetStart)
        console.log('Previous one lasted', Date.now() - this.framesetStart, ' on average ', (Date.now() - this.framesetStart)/this.filesList.length);
    this.framesetStart = Date.now();

    if(config.checkDataBeforeEachFrameset)
        promiseToContinue = fetchFilesList();

    promiseToContinue.then(function() {
        if(self.filesList.length == 0) {
            console.log('Nothing data to send, waiting ' + config.delayAfterNullData);
            self.isStreaming = false;
            return setTimeout(self.beginFrameset, config.delayAfterNullData);
        }

        self.sendFrame(0);
    }, function (error) {
        console.error('Error: ', error);
    });
}

function sendFrame(i) {
    //console.log('Sending frame', i, this.filesList[i]);
    if(this.connectionList.length == 0) {
        console.log('No connections to stream to');
        this.isStreaming = false;
        return false;   // didn't send the frame, no listeners
    }

    if(i >= this.filesList.length) {
        // Start next frameset
        return this.beginFrameset();
    }
    else {
        // Set Timeout for next frame
        setTimeout(sendFrame.bind(this), config.frameDelay, i+1);
    }

    var self = this;

    this.isStreaming = true;

    // Check if file exists
    fs.stat(__dirname + '/' + config.dataDir + '/' + this.filesList[i], function(err, stats) {
        if(err || !stats.isFile())
            return console.error('File ' + __dirname + '/' + config.dataDir + '/' + self.filesList[i] + ' was to be sent but doesn\'t exist.');

        // Check extension, then select a specific header
        var extension = path.extname(__dirname + '/' + config.dataDir + '/' + self.filesList[i]).slice(1);
        if(!extensionsHeaders[extension])
            return console.error('File ' + __dirname + '/' + config.dataDir + '/' + self.filesList[i] + ' has an unknown extension that cannot be handled.');

        fs.readFile(__dirname + '/' + config.dataDir + '/' + self.filesList[i], function(err, data) {
            self.connectionList.forEach(function(connection) {
                connection.respond('next-frame', {'frameID': i, 'imageData': extensionsHeaders[extension] + data.toString('base64')});
            });

            if(config.deleteDataAfterSending) {
                // Delete file
                fs.unlink(__dirname + '/' + config.dataDir + '/' + self.filesList[i], function(err) {
                    if(err)
                        return console.error('Cannot delete file ' + __dirname + '/' + self.filesList[i]);
                });
            }
        });
    });
}