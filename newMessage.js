module.exports = (msg) => {
  console.log('message: ' + msg);
  socket.broadcast.emit('chat message', {
    from: socket.id,
    message: msg,
    date: new Date()
  });
};
