var http = require('http'), 
		url = require('url'),
		fs = require('fs'),
		io = require('./socket.io-node'),
		sys = require('sys'),
		redis = require("redis-client"),
        Hash = require("./hash").Hash,
		
server = http.createServer(function(req, res){
    // your normal server code
    var path = url.parse(req.url).pathname;

    if (path.match(/^\/json\.js/)) {
        var completeFileName = [__dirname, 'json.js'].join("/");
        fs.readFile(completeFileName, function(err, data){
            if (err) {
                sys.puts('404 !!' + completeFileName);
                return send404(res);
            } else {
                sys.puts('Serving up' + completeFileName);
                res.writeHead(200, {'Content-Type': 'text/javascript'})
                res.write(data, 'utf8');
                res.end();
            }
        });
    } else {
        send404(res);
    }
}),

send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
};

server.listen(8080);

// WARNING: do not use brackets for the Hash object because it will not log the size. 
// Instead, interface with add, get, and remove
var io = io.listen(server),
    channels = new Hash(),
    redisClients = new Hash(),
    clientChannels = new Hash(),

    logBlock = function(message){
        var blockSeparator = "\n####################################"
        sys.puts(blockSeparator + message + blockSeparator);
    },

    clientUnsubscribeChannel = function(client, channelName) {
        var channel = channels.get(channelName),
            sessionId = client.sessionId,
            _clientChannels = clientChannels.get(sessionId);


        // This if block exists in the off-chance that this client was cleared via a race condition between
        // client disconnect & redisClient publish
        if (channel && _clientChannels) {
            // delete the client from the channel list
            channel.remove(sessionId);

            // Delete the clients channels if they are not subscribed to any other channels.
            // I'm pretty sure (as of Nov 2010) client.sessionIds cannot subscribe to multiple channels.
            // However this functionality exists just in case future implementations of websockets allow 
            // mutliple connections per client
            _clientChannels.remove(channelName);
            logBlock("\nRemoved client " + sessionId + " from the '" + channelName + "' channel.\n\tClients remaining: " + channel.length);

            // remove the clientChannels' reference to the sessionId
            if (_clientChannels.length <= 0) {
                clientChannels.remove(sessionId);
                logBlock("\nRemoved client " + sessionId + " from the clientChannels list");
            }

            // close the redisClient && delete objects for the channel if there are no more clients
            if (channel.length <= 0) {
                logBlock("\nClosing out Redis client '" + channelName + "' because it has no more clients");
                redisClients.get(channelName).close();
                redisClients.remove(channelName);
                channels.remove(channelName);
            }
        }
    };

io.on('clientMessage', function(msg, client) {
    var msg = JSON.parse(msg);

    if ('subscribeTo' in msg) {
        var channelName = msg["subscribeTo"];

        // create the channel && redis client if they haven't been created yet
        if (!channels.get(channelName)) { 

            sys.puts("Creating new channel: " + channelName);

            // create the channel's client collection
            channels.add(channelName, new Hash());

            // create the redis client
            var redisClient = redis.createClient();

            // for use during channel maintenance e.g. unsubcribe & delete
            redisClients.add(channelName, redisClient);

            // subscribe the redis client to the channel
            redisClient.subscribeTo(channelName, function(channel, msg) {
                logBlock("\nReceived message from Redis:\n\tChannel: " + channel + "\n\tMessage: " + msg);

                var channelClients = channels.get(channel);
                var channelSizeMemo = channelClients.length;

                // publish message to all active clients
                channelClients.each_pair(function(sessionId, _client) {
                    // remove the client from the channel if they are no longer connected
                    if (!_client.connected)
                        clientUnsubscribeChannel(_client, channel);
                    else
                        _client.send(JSON.parse(msg));
                });

                logBlock("\nBroadcasting message from Redis:\n\tChannel: " + channel + 
                         "\n\tMessage: " + msg + 
                         "\n\tTotal messages sent:" + channelClients.length + 
                         "\n\tTotal clients disconnected: " + (channelSizeMemo - channelClients.length));
            });
        } // end channel && redis client creation

        var sessionId = client.sessionId;

        // put the client in the new channel
        channels.get(channelName).add(sessionId, client);
        sys.puts("Subscribed client " + client.sessionId + " to: " + channelName + 
                 "\n\tTotal clients in " + channelName + ": " + channels.get(channelName).length);

        // add the channel to the client's channel list
        if (!clientChannels.get(sessionId)) clientChannels.add(sessionId, new Hash());

        clientChannels.get(sessionId).add(channelName, new Date());
    } // end subscribe
});
		
io.on("clientDisconnect", function(client) {
    var _clientChannels = clientChannels.get(client.sessionId);

    _clientChannels.each_pair(function(channelName, subTime) {
        clientUnsubscribeChannel(client, channelName);
    });
});

//io.on("connection", function(client){
    //SUBSCRIBE
    //sys.puts("subscribing");

	//client.send({ buffer: buffer });
	//client.broadcast({ announcement: client.sessionId + ' connected' });

	//client.on('message', function(message){
		//var msg = { message: [client.sessionId, message] };
		//buffer.push(msg);
		//if (buffer.length > 15) buffer.shift();
	//});

	//client.on('disconnect', function(){
		//client.broadcast({ announcement: client.sessionId + ' disconnected' });
	//});
//});
