import controller from '../config/controller';
import { gravity } from '../config/gravity';
import Invite from '../models/invite';
import Channel from '../models/channel';
import Message from '../models/message';

const connection = process.env.SOCKET_SERVER;

module.exports = (app, passport, React, ReactDOMServer) => {
  app.get('/channels', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/channels.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
        connection,
        messages,
        name: 'Metis - My Channels',
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
        validation: req.session.jup_key,
        accessData: req.session.accessData,
      }),
    );

    res.send(page);
  });

  app.get('/invites', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/invites.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
        connection,
        messages,
        name: 'Metis - My Invites',
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
        validation: req.session.jup_key,
        accessData: req.session.accessData,
      }),
    );

    res.send(page);
  });

  app.get('/channels/invites', controller.isLoggedIn, async (req, res) => {
    const invite = new Invite();
    const userData = JSON.parse(gravity.decrypt(req.session.accessData));
    invite.user = userData;
    let response;
    try {
      response = await invite.get('channelInvite');
    } catch (e) {
      response = e;
    }
    // console.log(response);
    res.send(response);
  });

  app.post('/channels/invite', controller.isLoggedIn, async (req, res) => {
    const { data } = req.body;
    data.sender = req.user.record.account;
    const invite = new Invite(data);
    invite.user = JSON.parse(gravity.decrypt(req.session.accessData));
    let response;

    try {
      response = await invite.send();
    } catch (e) {
      response = e;
    }

    res.send(response);
  });

  app.post('/channels/import', controller.isLoggedIn, async (req, res) => {
    const { data } = req.body;
    const channel = new Channel(data.channel_record);
    channel.user = JSON.parse(gravity.decrypt(req.session.accessData));

    let response;
    try {
      response = await channel.import(JSON.parse(gravity.decrypt(req.session.accessData)));
    } catch (e) {
      response = { error: true, fullError: e };
    }

    res.send(response);
  });

  app.get('/channels/:id', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/convos.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
        connection,
        messages,
        name: `Metis - Convo#${req.params.id}`,
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
        validation: req.session.jup_key,
        accessData: req.session.accessData,
        channelId: req.params.id,
      }),
    );

    res.send(page);
  });

  app.get('/data/messages/:scope/:firstIndex', controller.isLoggedIn, async (req, res) => {
    let response;
    const tableData = {
      passphrase: req.headers.channelaccess,
      account: req.headers.channeladdress,
      encryptionPassword: req.headers.channelkey,
    };
    const channel = new Channel(tableData);
    channel.user = JSON.parse(gravity.decrypt(req.session.accessData));

    try {
      const data = await channel.loadMessages(req.params.scope, req.params.firstIndex);
      response = data;
    } catch (e) {
      console.log(e);
      response = { success: false, fullError: e };
    }

    res.send(response);
  });

  app.post('/data/messages', controller.isLoggedIn, async (req, res) => {
    let response;
    const { tableData } = req.body;
    const message = new Message(req.body.data);
    message.record.sender = req.user.record.account;
    const userData = JSON.parse(gravity.decrypt(req.session.accessData));
    try {
      const data = await message.sendMessage(userData, tableData, message.record);
      response = data;
    } catch (e) {
      response = { success: false, fullError: e };
    }
    res.send(response);
  });
};
