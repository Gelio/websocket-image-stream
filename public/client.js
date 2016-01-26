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

    CustomSocketEvents.addEvents(socket);    // add custom socket events
    CustomSocketEvents.imageElement = document.querySelector('.stream');

    socket.onmessage = function(event) {
        var dataReceived = event.data;

        try {
            dataReceived = JSON.parse(dataReceived);
        } catch (e) {
            console.error('Server sent a JSON invalid message', dataReceived);
        }

        if(CustomSocketEvents.isValidEvent(dataReceived.type)) {
            var eventToSend = new CustomEvent(dataReceived.type, {
                'detail': dataReceived
            });
            socket.dispatchEvent(eventToSend);
        }
        else {
            // Invalid event name
            console.error('Unknown message type ' + dataReceived.type, dataReceived);
        }
    };
});