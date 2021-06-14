const config = require('./config.js')
const fs = require('fs')
const path = require('path')

const Streamer = {
  connectionList: [],
  filesList: [],
  isStreaming: false,
  addNewConnection: addNewConnection,
  fetchFilesList: fetchFilesList,
  beginFrameset: beginFrameset,
  sendFrame: sendFrame
}

const extensionsHeaders = {
  png: 'data:image/png;base64,',
  gif: 'data:image/gif;base64,',
  jpg: 'data:image/jpg;base64,'
}

module.exports = Streamer

function addNewConnection (connection) {
  let found = false
  this.connectionList.forEach(function (currConn) {
    if (!found && connection === currConn) { found = true }
  })

  if (found) { return false }
  this.connectionList.push(connection)
  return true
}

function fetchFilesList () {
  const self = this

  return new Promise(function (resolve, reject) {
    const fileDir = path.join(__dirname, config.dataDir)
    fs.readdir(fileDir, function (err, files) {
      if (err) { reject(new Error('cannot read from directory ' + fileDir)) }

      self.filesList.length = 0
      if (!Array.isArray(files)) { return resolve() }

      files.forEach(function (file) {
        self.filesList.push(file)
      })
      resolve()
    })
  })
}

function beginFrameset () {
  const self = this
  let promiseToContinue = new Promise(resolve => resolve())

  console.log('Beginning frameset')
  if (this.framesetStart) {
    console.log('Previous one lasted', Date.now() - this.framesetStart, ' on average ', (Date.now() - this.framesetStart) / this.filesList.length)
  }
  this.framesetStart = Date.now()

  if (config.checkDataBeforeEachFrameset) { promiseToContinue = fetchFilesList() }

  promiseToContinue.then(function () {
    if (!self.filesList || self.filesList.length === 0) {
      console.log('Nothing data to send, waiting ' + config.delayAfterNullData)
      self.isStreaming = false
      return setTimeout(self.beginFrameset, config.delayAfterNullData)
    }

    self.sendFrame(0)
  }, function (error) {
    console.error('Error: ', error)
  })
}

function sendFrame (i) {
  // console.log('Sending frame', i, this.filesList[i])
  if (this.connectionList.length === 0) {
    console.log('No connections to stream to')
    this.isStreaming = false
    return false // didn't send the frame, no listeners
  }

  if (i >= this.filesList.length) {
    // Start next frameset
    return this.beginFrameset()
  } else {
    // Set Timeout for next frame
    setTimeout(sendFrame.bind(this), config.frameDelay, i + 1)
  }

  const self = this

  this.isStreaming = true

  // Check if file exists
  const file = path.join(__dirname, config.dataDir, this.filesList[i])
  fs.stat(file, function (err, stats) {
    if (err || !stats.isFile()) { return console.error('File ' + file + ' was to be sent but doesn\'t exist.') }

    // Check extension, then select a specific header
    const extension = path.extname(file).slice(1)
    if (!extensionsHeaders[extension]) { return console.error('File ' + file + ' has an unknown extension that cannot be handled.') }

    fs.readFile(file, function (err, data) {
      if (err) { return console.error('File ' + file + ' was to be read but doesn\'t exist.') }

      self.connectionList.forEach(function (connection) {
        connection.respond('next-frame', { frameID: i, imageData: extensionsHeaders[extension] + data.toString('base64') })
      })

      if (config.deleteDataAfterSending) {
        // Delete file
        fs.unlink(file, function (err) {
          if (err) { return console.error('Cannot delete file ' + file) }
        })
      }
    })
  })
}
