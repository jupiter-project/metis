const { io } = require('../server');

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('channelMessages', (data) => {
    if (data && data.notifier && data.message) {
      socket.join(data.notifier);
      socket.broadcast.emit(data.notifier, { message: data.message });
    }
  });

  socket.on('invites', (data) => {
    if (data && data.notifier) {
      socket.join(data.notifier);
      socket.broadcast.emit(data.notifier, { message: 'new invite' });
    }
  });
});
