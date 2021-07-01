const mongooseClient = require('mongoose');

const transactionsSchema = mongooseClient.Schema({
    subtype: Number,
    ecBlockHeight: Number,
    type: Number,
    transactionId: Number,
  });

const transactionBlocksSchema = mongooseClient.Schema({
  protocol: Number,
  requestType: String,
  previousBlock: String,
  heigh: Number,  
  transactions: [transactionsSchema],
  timestamp: Number,
});

module.exports = mongooseClient.model('TransactionBlocks', transactionBlocksSchema);
