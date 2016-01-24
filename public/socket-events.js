var CustomSocketEvents = {
    validEvents: [
        'world'
    ],
    addEvents: function(socket) {
        socket.addEventListener('world', helloWorld);


        function helloWorld() {
            console.log('Greeted with the server.');
        }
    },
    isValidEvent: function(eventName) {
        var valid = false;
        this.validEvents.forEach(function(currentEvent) {
            if(currentEvent === eventName)
                valid = true;
        });
        return valid;
    }
};