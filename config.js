var config = {
    port: 3000,
    dataDir: './stream-data',
    checkDataBeforeEachFrameset: false,        // if it's enabled after each loop streamer will fetch all names of files in the data dir and perform next loop with those files (used if names change)
    deleteDataAfterSending: false,         // after successfully sending a file it will be deleted
    frameDelay: 0,                     // minimal delay between frames
    delayAfterNullData: 5000            // how long to wait for new data to arrive when there were none to send in the current frameset
};

module.exports = config;