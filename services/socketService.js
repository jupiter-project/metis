
const logger = require('../utils/logger')(module);

const joinChat = function (data, callback) {
  const { room, event, user } = data;
  if (!room || !event) {
    return callback({
      error: true,
      message: '[joinChat]: The Room and Event are required',
    });
  }

  this.name = user;
  this.join(room);

  // TODO enable these lines to know the number of connected users
  this.in(room).allSockets().then((result) => {
    logger.info(`The user ${user} joined to the room ${room}, and the number of user connected is: `, result.size);
  });

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

  logger.info(`The user ${this.name} left the room ${room}`);
  this.leave(room);
};

const createMessage = function (data, callback) {
  const { room } = data;
  if (!room) {
    return callback({
      error: true,
      message: '[createMessage]: The Room is required',
    });
  }
  this.broadcast.to(room).emit('createMessage');
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
    logger.info(`reason: ${reason}`);
    logger.info(`${socket.name} has disconnected from the chat.${socket.id}`);
  });
};

module.exports = { connection };
