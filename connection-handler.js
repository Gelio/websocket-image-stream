const WebSocketServer = require('websocket').server
const url = require('url')
const Streamer = require('./streamer.js')
const EventEmitter = require('events')

module.exports = function (httpServer) {
  const wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
  })

  console.log('Running a web-server')

  wsServer.on('request', function (request) {
    if (!isOriginAllowed(request.origin, httpServer.address())) {
      console.error(request.origin, 'denied')
      request.reject()
      return
    }

    const connection = request.accept(null, request.origin)
    console.log(request.origin, 'accepted')

    addEventsToConnection(connection)
    // Streamer.addNewConnection(connection);
  })
}

function isOriginAllowed (origin, addressObj) {
  // Always accept connections in development (allows for connecting via localhost and 127.0.0.1 interchangeably)
  if (process.argv[2] === 'development') { return true }

  // Authorize only clients that connect via the same IP and port
  const originUrl = new url.URL(origin)

  if (Number(originUrl.port) === addressObj.port && originUrl.hostname === addressObj.address) { return true }
  return false
}

function addEventsToConnection (connection) {
  if (!connection.sendJSON && !connection.respond) {
    connection.sendJSON = function (dataObject) { this.send(JSON.stringify(dataObject)) }
    connection.respond = function (type, dataObject) { this.sendJSON({ type: type, utf8Data: dataObject }) }
  }

  const socketEvents = new EventEmitter()
  addOnMessageEvents(connection, socketEvents)

  connection.on('close', function (reasonCode, description) {
    console.log(connection.remoteAddress, 'disconnected')

    Streamer.connectionList = Streamer.connectionList.filter(function (currConn) {
      return currConn !== connection // delete disconnected client from the list
    })
  })

  connection.on('message', function (message) {
    if (message.type === 'binary') {
      console.error(connection.remoteAddress + ' sent binary data which cannot be parsed yet', message)
      return
    }

    let dataSent = message.utf8Data
    try {
      dataSent = JSON.parse(dataSent)
    } catch (e) {
      console.error(connection.remoteAddress + ' sent an invalid JSON message', message.utf8Data)
      return
    }

    if (socketEvents.listeners(dataSent.type).length === 0) {
      // Unknown event
      connection.respond('error', { errorType: 'unknown message type' })
      console.error(connection.remoteAddress + ' send an unknown message: ', message)
      console.error('Parsed as:', dataSent)
    } else { socketEvents.emit(dataSent.type, dataSent.utf8Data) } // send the message
  })
}

function addOnMessageEvents (connection, socketEvents) {
  socketEvents.on('hello', function () {
    connection.respond('world', { text: 'what to say?' })
  })

  socketEvents.on('request-images', function () {
    Streamer.addNewConnection(connection)

    if (!Streamer.isStreaming) { Streamer.beginFrameset() }
  })
}
