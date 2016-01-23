window.addEventListener('load', function() {
    console.log('Window loaded');

    var socket = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port);

    socket.onopen = function() {
        console.log('Connected to the socket server.');
        socket.send(JSON.stringify({type: 'hello'}));
    };

    socket.onerror = function(error) {
        console.error('An unknown error occured', error);
    };

    socket.onclose = function(event) {
        console.log('Server closed connection', event);
    };

    socket.onmessage = function(event) {
        var dataReceived = event.data;

        try {
            dataReceived = JSON.parse(dataReceived);
        } catch (e) {
            console.error('Server sent a JSON invalid message', dataReceived);
        }

        switch(dataReceived.type) {
            case 'world':
                console.log('Greeted with the server');
                break;

            default:
                console.error('Unknown message type ' + dataReceived.type, dataReceived);
                break;
        }
    };
});