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

        var imageToDisplay = document.querySelector('.stream'),
            currentFrameID = 0;


        function helloWorld(data) {
            console.log('Greeted with the server.');
            console.log(data);
        }

        function nextFrame(data) {
            //self.imageElement.src = data;
            var imageData = data.detail.utf8Data;
            console.log(data);
            if(imageData && imageData.frameID && imageData.imageData) {
                if(imageData.frameID > currentFrameID || imageData.frameID === 0)
                    imageToDisplay.src = imageData.imageData;
                else
                    console.log('Wrong order, frame ' + imageData.frameID + ' arrived after current one - ' + currentFrameID);
            }
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