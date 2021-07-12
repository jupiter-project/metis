
const logger = require('../utils/logger')(module);

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

const joinChat = (socket, room, user, event) => {
  socket.name = user;
  socket.join(room);
  socket.broadcast.to(room).emit(event, {});
  socket.in(room).allSockets().then((result) => {
    logger.info(`The user ${user} joined to the room ${room}, and the number of user connected is: ${result.size}`);
  });
};

const connection = function (socket) {
  logger.info('a user connected');
  const { room, user, event } = socket.handshake.query;
  if (!room || !user || !event) {
    logger.error(`Missing parameter ${JSON.stringify({ room, user, event })}`);
    return socket.close();
  }

  joinChat(socket, room, user, event);

  socket.on('leaveChat', leaveChat);
  socket.on('createMessage', createMessage);
  socket.on('invites', invites);
  socket.on('connect_error', (error) => {
    logger.error(JSON.stringify(error));
  });

  /**
   * io server disconnect The server has forcefully disconnected the socket with socket.disconnect()
   * io client disconnect The socket was manually disconnected using socket.disconnect()
   * ping timeout The server did not send a PING within the pingInterval + pingTimeout range
   * transport close The connection was closed (example: the user has lost connection, or the network was changed from WiFi to 4G)
   * transport error The connection has encountered an error (example: the server was killed during a HTTP long-polling cycle)
   */
  socket.on('disconnect', (reason) => {
    logger.info(`reason: ${reason}`);
    logger.info(`${socket.name} has disconnected from the chat.${socket.id}`);
  });
};

module.exports = { connection };
