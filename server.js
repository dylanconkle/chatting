var socket_io = require('socket.io');
var http = require('http');
var express = require('express');
var app = express();

app.use(express.static('public'));
var server = http.Server(app);
var io = socket_io(server);

var clients = new Object();

var getClientID = function(nickName) {
    var id = null;
    for(var index in clients) {
        if (clients.hasOwnProperty(index)) {
            if (clients[index] === nickName) {
                id = index;
                break;
            }
        }
    }
    return id;
};

io.on('connection', function (socket) {
    socket.on('regUser', function(nickName) {
        clients[socket.id] = nickName;
        socket.broadcast.emit('message', nickName + ' has connected.');
        io.emit('clientsChanged', clients);

    });

    socket.on('message', function(message) {

        var nickNameSender = clients[socket.id];
        var args = message.split('|');
        if (args.length === 3 && args[0] === 'pm') {
            var socketID = getClientID(args[1]);
            if (socketID) {
                io.sockets.connected[socketID].emit('message', nickNameSender + ': ' + args[2]);
            }
        } else {
            socket.broadcast.emit('message', nickNameSender + ': ' + message);
        }
    });

    socket.on('disconnect', function() {
        if (!clients[socket.id]) {
            return;
        }
        var nickName = clients[socket.id];
        delete clients[socket.id];
        socket.broadcast.emit('message', nickName + ' has disconnected.');
        io.emit('clientsChanged', clients);
    });

    socket.on('keydown', function() {
        var nickName = clients[socket.id];
        socket.broadcast.emit('keydown', nickName);
    });

    socket.on('keyup', function() {
        socket.broadcast.emit('keyup');
    });

});

server.listen(process.env.PORT || 8080);
