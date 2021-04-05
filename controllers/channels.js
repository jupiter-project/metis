import _ from 'lodash';
import controller from '../config/controller';
import { gravity } from '../config/gravity';
import { messagesConfig } from '../config/constants';
import Invite from '../models/invite';
import Channel from '../models/channel';
import Message from '../models/message';

const connection = process.env.SOCKET_SERVER;

const decryptUserData = (req) => {
  JSON.parse(gravity.decrypt(req.session.accessData));
};

module.exports = (app, passport, React, ReactDOMServer) => {
  /**
   * Render Channels page
   */
  app.get('/channels', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/channels.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
        connection,
        messages,
        name: 'Metis - Chats',
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
        validation: req.session.jup_key,
        accessData: req.session.accessData,
      }),
    );

    res.send(page);
  });

  /**
   * Render invites page
   */
  app.get('/invites', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/invites.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
        connection,
        messages,
        name: 'Metis - Invites',
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
        validation: req.session.jup_key,
        accessData: req.session.accessData,
      }),
    );

    res.send(page);
  });

  /**
   * Get a user's invites
   */
  app.get('/channels/invites', controller.isLoggedIn, async (req, res) => {
  // app.get('/channels/invites', async (req, res) => {
    console.log('/n/n/nChannel Invites/n/n');
    console.log(req.session);
    const invite = new Invite();
    const userData = decryptUserData(req);
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

  /**
   * Send an invite
   */
  app.post('/channels/invite', async (req, res) => {
    const { data } = req.body;
    data.sender = req.user.record.account;
    const invite = new Invite(data);
    invite.user = decryptUserData(req);
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
    channel.user = decryptUserData(req);

    let response;
    try {
      response = await channel.import(channel.user);
    } catch (e) {
      response = { error: true, fullError: e };
    }

    res.send(response);
  });

  /**
   * Render a channel's conversations
   */
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

  /**
   * Get a channel's messages
   */
  app.get('/data/messages/:scope/:firstIndex', controller.isLoggedIn, async (req, res) => {
    let response;

    const tableData = {
      passphrase: req.headers.channelaccess,
      account: req.headers.channeladdress,
      password: req.headers.channelkey,
    };

    const channel = new Channel(tableData);
    channel.user = decryptUserData(req);

    try {
      const data = await channel.loadMessages(req.params.scope, req.params.firstIndex);
      response = data;
    } catch (e) {
      console.log(e);
      response = { success: false, fullError: e };
    }

    res.send(response);
  });

  /**
   * Send a message
   */
  app.post('/data/messages', controller.isLoggedIn, async (req, res) => {
    const { maxMessageLength } = messagesConfig;
    const hasMessage = _.get(req, 'body.data.message', null);
    let response;

    if (hasMessage && hasMessage.length <= maxMessageLength) {
      const { tableData } = req.body;
      const message = new Message(req.body.data);
      message.record.sender = req.user.record.account;
      const userData = decryptUserData(req);
      try {
        const data = await message.sendMessage(userData, tableData, message.record);
        response = data;
      } catch (e) {
        response = { success: false, fullError: e };
      }
    } else {
      response = { success: false, messages: [`Message exceeds allowable limit of ${maxMessageLength} characters`] };
    }
    res.send(response);
  });
};
