
const logger = require('../utils/logger')(module);

const joinChat = function (data, callback) {
  const { room, event } = data;
  if (!room || !event) {
    return callback({
      error: true,
      message: 'The Room and Event are required',
    });
  }

  this.join(room);
  this.broadcast.to(room).emit(event, {});

  callback({
    error: false,
    message: `Joined successfully to the room: ${room}`,
  });
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

  socket.on('createMessage', createMessage);

  socket.on('invites', invites);
};

module.exports = { connection };
