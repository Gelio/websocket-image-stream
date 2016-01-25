var config = {
    port: 3000,
    dataDir: './stream-data',
    checkDataAfterEachLoop: false,        // if it's enabled after each loop streamer will fetch all names of files in the data dir and perform next loop with those files
    deleteDataAfterSending: false         // after successfully sending a file it will be deleted
};

module.exports = config;