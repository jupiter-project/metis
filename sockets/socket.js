const { io } = require('../server');
const socketService = require('../services/socketService');

io.on('connection', socketService.connection.bind(this));
