
const logger = require('../utils/logger')(module);

const joinChat = function (data, callback) {
  const { room, event } = data;
  if (!room || !event) {
    return callback({
      error: true,
      message: '[joinChat]: The Room and Event are required',
    });
  }

  this.join(room);
  // TODO enable these lines to know the number of connected users
  // this.in(room).allSockets().then((result) => {
  //   console.log('Rooom---->', result.size);
  // });
  this.broadcast.to(room).emit(event, {});

  callback({
    error: false,
    message: `Joined successfully to the room: ${room}`,
  });
};

const leaveChat = function (data, callback) {
  const { room } = data;
  if (!room) {
    return callback({
      error: true,
      message: '[leaveChat]: The Room is required',
    });
  }

  this.leave(room);
};

const createMessage = function (data) {
  const { room, message } = data;
  if (room && message) {
    this.broadcast.to(room).emit('createMessage', message);
  }
};


const invites = function (data) {
  const { room, message } = data;
  if (room && message) {
    this.broadcast.to(room).emit('invites', message);
  }
};

const connection = function (socket) {
  logger.info('a user connected');

  socket.on('joinChat', joinChat);

  socket.on('leaveChat', leaveChat);

  socket.on('createMessage', createMessage);

  socket.on('invites', invites);

  socket.on('disconnect', (reason) => {
    console.log(`reason: ${reason}`);
    console.log(`${socket.name} has disconnected from the chat.${socket.id}`);

  });
};

module.exports = { connection };
