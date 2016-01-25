const config = require('./config.js'),
      fs = require('fs');

var Streamer = {
    connectionList: [],
    filesList: [],
    addNewConnection: addNewConnection,
    fetchFilesList: fetchFilesList
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