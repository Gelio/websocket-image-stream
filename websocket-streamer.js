var WebSocketServer = require('websocket').server,
    url = require('url');

module.exports = function(httpServer) {
    var wsServer = new WebSocketServer({
        httpServer: httpServer,
        autoAcceptConnections: false
    });

    console.log('Running a web-server');

    wsServer.on('request', function(request) {
        if(!isOriginAllowed(request.origin, httpServer.address())) {
            console.error(request.origin, 'denied');
            request.reject();
            return;
        }


        var connection = request.accept(null, request.origin);
        console.log(request.origin, 'accepted');

        addEventsToConnection(connection);
    });
};

function isOriginAllowed(origin, addressObj) {
    // Authorize only clients that connect via the same IP and port
    var originUrl = url.parse(origin);

    if(originUrl.port == addressObj.port && originUrl.hostname == addressObj.address)
        return true;
    return false;
}

function addEventsToConnection(connection) {
    if(!connection.sendJSON) {
        connection.sendJSON = function(dataObject) { this.send(JSON.stringify(dataObject)); };
    }

    connection.on('close', function(reasonCode, description) {
        console.log(connection.remoteAddress, 'disconnected');
    });

    connection.on('message', function(message) {
        if(message.type == 'binary') {
            console.error(connection.remoteAddress + ' sent binary data which cannot be parsed yet', message);
            return;
        }

        var dataSent = message.utf8Data;

        try {
            dataSent = JSON.parse(dataSent);
        } catch (e) {
            console.error(connection.remoteAddress + ' sent an invalid JSON message', message.utf8Data);
            return;
        }


        switch(dataSent.type) {
            case 'hello':
                connection.sendJSON({type: 'world'});
                break;

            default:
                connection.sendJSON({type: 'error', errorType: 'unknown message type'});
                console.error(connection.remoteAddress + ' send an unknown message: ', message);
                console.error('Parsed as:', dataSent);
                break;
        }
    })
}