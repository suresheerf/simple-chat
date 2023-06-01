module.exports = (room) => {
  console.log('message: ' + msg);
  socket.join(room, {
    from: socket.id,
    message: msg,
    date: new Date()
  });
};
