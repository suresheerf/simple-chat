const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const rooms = {};

const addToRoom = (roomName, username, socketId) => {
  if (rooms[roomName] === undefined) {
    rooms[roomName] = [{ username, id: socketId }];
  } else {
    rooms[roomName].push({ username, id: socketId });
  }
};

io.on("connection", (socket) => {
  let username;
  console.log(`a user connected with id: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log("user disconnected");
    for (const room in rooms) {
      if (rooms[room].find((item) => item.id == socket.id)) {
        console.log("found user234");
        socket.to(room).emit("member left", socket.id);
        socket
          .to(room)
          .emit("chat message", {
            from: username,
            meesage: `left the room`,
            date: new Date(),
          });
        rooms[room] = rooms[room].filter((item) => item.id !== socket.id);
      }
    }
  });
  socket.on("chat message", (msg, room, name) => {
    console.log("message: " + msg);
    if (room === "") {
      socket.broadcast.emit("chat message", {
        from: username,
        message: msg,
        date: new Date(),
      });
    } else {
      console.log("roooom", room);
      socket.to(room).emit("chat message", {
        from: username,
        message: msg,
        date: new Date(),
      });
    }
  });
  socket.on("join room", (room, name, cb) => {
    if (!name) {
      cb("error", username, socket.id, rooms[room], "please enter username");
    } else {
      username = name;
      socket.join(room);
      addToRoom(room, username, socket.id);
      console.log("rooms[room]:", rooms[room]);
      cb("success", username, socket.id, rooms[room]);

      socket.to(room).emit("chat message", {
        from: name,
        message: `${name} joined`,
        date: new Date(),
      });
      socket.to(room).emit("new member", username);
    }
  });
  socket.on("room members", (room) => {});
});

server.listen(3005, () => {
  console.log("listening on *:3000");
});
