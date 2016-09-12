$(document).ready(function() {

    var nickName = null;
    while (!nickName) {
        nickName = window.prompt("Please enter your nickname:", "");
    }

    $('#nickName').html(nickName);

    var socket = io();
    socket.emit('regUser', nickName);

    var input = $('input');
    var messages = $('#messages');
    var clientCount = $('#clientCount');
    var typing = $('#userTyping');

    var addMessage = function(message, includeNickName) {

        var args = message.split('|');
        if (args.length === 3) {
            message = args[2];
        }
        if (includeNickName) {
            message = nickName + ': ' + message;
        }
        messages.append('<div>' + message + '</div>');
    };

    var updClients = function(clients) {
        clientCount.html('Connected Clients = ' + Object.keys(clients).length);

        $("ul").empty();
        var html = "";
        for(var index in clients) {
            if (clients.hasOwnProperty(index)) {
                html += "<li>" + clients[index] + "</li>";
            }
        }
        $("ul").html(html);
    };

    var userTyping = function(nickName) {
        typing.html(nickName + ' is typing.');
    };

    var clearUserTyping = function() {
        typing.html('');
    };

    socket.on('message', addMessage);
    socket.on('clientsChanged', updClients);
    socket.on('keydown', userTyping);
    socket.on('keyup', clearUserTyping);

    input.on('keydown', function(event) {
        if (event.keyCode != 13) {
            console.log('keydown');
            socket.emit('keydown');
            return;
        }

        var message = input.val();
        addMessage(message, true);
        socket.emit('message', message);
        input.val('');
    });

    input.on('keyup', function(event) {
        if (event.keyCode != 13) {
            socket.emit('keyup');
        }
    });

});
