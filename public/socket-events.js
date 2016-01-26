var CustomSocketEvents = {
    validEvents: [
        'world',
        'next-frame'
    ],
    imageElement: null,
    addEvents: function(socket) {
        var self = this;

        socket.addEventListener('world', helloWorld);
        socket.addEventListener('next-frame', nextFrame);


        function helloWorld(data) {
            console.log('Greeted with the server.');
            console.log(data);
        }

        function nextFrame(data) {
            //self.imageElement.src = data;
            console.log('Got a frame', data);
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