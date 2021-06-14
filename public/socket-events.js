// eslint-disable-next-line
const CustomSocketEvents = {
  validEvents: [
    'world',
    'next-frame'
  ],
  imageElement: null,
  addEvents: function (socket) {
    // const self = this

    socket.addEventListener('world', helloWorld)
    socket.addEventListener('next-frame', nextFrame)

    const imageToDisplay = document.querySelector('.stream')
    const currentFrameID = 0

    function helloWorld (data) {
      console.log('Greeted with the server.')
      // console.log(data)
    }

    function nextFrame (data) {
      // self.imageElement.src = data;
      const imageData = data.detail.utf8Data
      //   console.log(data)
      if (imageData && imageData.frameID !== undefined && imageData.imageData) {
        if (imageData.frameID > currentFrameID || imageData.frameID === 0) { imageToDisplay.src = imageData.imageData } else { console.log('Wrong order, frame ' + imageData.frameID + ' arrived after current one - ' + currentFrameID) }
      }
    }
  },
  isValidEvent: function (eventName) {
    let valid = false
    this.validEvents.forEach(function (currentEvent) {
      if (currentEvent === eventName) { valid = true }
    })
    return valid
  }
}
