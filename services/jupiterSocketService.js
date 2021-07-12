
const TransactionBlocks = require('../models/transactions.js');
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
          logger.info(parsedMessage);
          const transactionBlock = new TransactionBlocks(parsedMessage);
          transactionBlock.save()
          .then( resp => {
            console.log(resp);
            logger.info(resp);
          })
          .catch(err => {
            console.log(err);
            logger.info(err);
          });
      } catch(e) {
        console.log('Cannot parsed', e);
        logger.info('Cannot parsed');
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
