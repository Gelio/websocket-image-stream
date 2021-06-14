/* global CustomSocketEvents, WebSocket, CustomEvent */
window.addEventListener('load', function () {
  console.log('Window loaded')

  const fetchImagesButton = document.querySelector('.start-stream')
  fetchImagesButton.addEventListener('click', function () {
    socket.send(JSON.stringify({ type: 'request-images' }))
    console.log('Request sent')
  })

  const socket = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port)

  socket.onopen = function () {
    console.log('Connected to the socket server.')
    socket.send(JSON.stringify({ type: 'hello' }))

    fetchImagesButton.disabled = false
  }

  socket.onerror = function (error) {
    console.error('An unknown error occured', error)
  }

  socket.onclose = function (event) {
    console.log('Server closed connection', event)
    fetchImagesButton.disabled = true
  }

  CustomSocketEvents.addEvents(socket) // add custom socket events
  CustomSocketEvents.imageElement = document.querySelector('.stream')

  socket.onmessage = function (event) {
    // console.log('onmessage event:', event)
    let dataReceived = event.data

    try {
      dataReceived = JSON.parse(dataReceived)
      // console.log('dataReceived', dataReceived)
    } catch (e) {
      console.error('Server sent a JSON invalid message', dataReceived)
    }

    if (CustomSocketEvents.isValidEvent(dataReceived.type)) {
      const eventToSend = new CustomEvent(dataReceived.type, {
        detail: dataReceived
      })
      socket.dispatchEvent(eventToSend)
    } else {
      // Invalid event name
      console.error('Unknown message type ' + dataReceived.type, dataReceived)
    }
  }
})
