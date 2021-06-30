import Model from './_model';
import { gravity } from '../config/gravity';
import { encryptAndSendMessage } from '../services/gravityService';

class Invite extends Model {
  constructor(data = { id: null }) {
    // Sets model name and table name
    super({
      data,
      model: 'channel',
      table: 'channels',
      belongsTo: 'user',
      model_params: [
        'id', 'recipient', 'sender', 'channel',
      ],
    });
    this.public_key = data.public_key;

    // Mandatory method to be called after data
    this.record = this.setRecord();
  }

  setRecord() {
    // We set default data in this method after calling for the class setRecord method
    const record = super.setRecord(this.data);

    return record;
  }

  loadRecords(accessData) {
    return super.loadRecords(accessData);
  }

  async get() {
    let response;

    try {
      response = await gravity.getMessages(this.user.account, this.user.passphrase);
    } catch (e) {
      response = { error: true, fullError: e };
    }

    return response;
  }

  async send() {
    const messageData = this.record;
    messageData.dataType = 'channelInvite';
    let response;
    try {
      const data = JSON.stringify(messageData);
      const recipient = messageData.recipient;
      response = await encryptAndSendMessage(data, this.user.passphrase, recipient);
      return response
    } catch (e) {
      //TODO should throw exception!
      return response = e;
    }
  }
}

module.exports = Invite;
