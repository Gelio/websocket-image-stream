# Websocket image streamer #

An example application streaming images over websockets from the server written in Node to a browser.

This is not a finished product yet. You should not use this if you rely on high FPS/bitrate and smooth playback.

## How it works ##

The idea of this project is for the server to open images from a directory one by one and send them to all the connected clients. Once that is finished it moves on to the next frame.

Those images may be in the meantime modified by another application, making it essentially video streaming.

This solution is faulty and slow, as it has almost no parallelism and the framerate depends on the disk read speed, how many sockets are connected and the speed of sending data over the network.