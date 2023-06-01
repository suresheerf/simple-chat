const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const rooms = {};

const addToRoom = (roomName, username, socketId) => {
  if (rooms[roomName] === undefined) {
    rooms[roomName] = [{ username, id: socketId }];
  } else {
    rooms[roomName].push({ username, id: socketId });
  }
};

io.on('connection', (socket) => {
  let username;
  console.log(`a user connected with id: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('chat message', (msg, room, name) => {
    console.log('message: ' + msg);
    if (room === '') {
      socket.broadcast.emit('chat message', {
        from: username,
        message: msg,
        date: new Date()
      });
    } else {
      console.log('roooom', room);
      socket.to(room).emit('chat message', {
        from: username,
        message: msg,
        date: new Date()
      });
    }
  });
  socket.on('join room', (room, name, cb) => {
    if (!name) {
      cb('error', username, socket.id, 'please enter username');
    } else {
      username = name;
      socket.join(room);
      addToRoom(room, username, socket.id);
      cb('success', username, socket.id);

      socket.to(room).emit('chat message', {
        from: name,
        message: `${name} joined`,
        date: new Date()
      });
    }
  });
  socket.on('room members', (room) => {});
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
