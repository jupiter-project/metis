
const logger = require('../utils/logger')(module);

const getDisconnectingEvent = (reason) => {
    const event = {
        event: "disconnecting",
        reason: reason
    }
    return JSON.stringify(event)
}

const disconnect = (ws, reason) => {
    ws.send(getDisconnectingEvent(reason))
    ws.terminate()
}

const connection = function (ws) {
  logger.info('jupiter connected');
  console.log("connecting jupiterWss...");
  ws.on('message', (message) => {
      console.log('jupiterWss:',message);
      const filtered = message.slice(20);
      try {
          const parsedMessage = JSON.parse(filtered);
          console.log(parsedMessage);
      } catch(e) {
        console.log('Cannot parsed', e);
        return;
      }
  });
  ws.on('close', () => {
      console.log('connection closed');
      clearTimeout(ws.connectionTimeout)
  });
  console.log("connected");
};

module.exports = { connection };
