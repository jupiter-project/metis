// import _ from 'lodash';
// import mailer from 'nodemailer';
// import controller from '../config/controller';
// import { gravity } from '../config/gravity.cjs';
// import { messagesConfig } from '../config/constants';
// import Invite from '../models/invite';
// import Channel from '../models/channel';
// import Message from '../models/message';
// import { findNotificationInfoByAliasOrJupId } from '../services/notificationService';


import _ from 'lodash';
// const _ = require('lodash');
// const mailer  = require('nodemailer');
import mailer from 'nodemailer';
// const controller  = require( '../config/controller');
import controller from '../config/controller.js'

// const { gravity }  = require( '../config/gravity.cjs');
import {gravity} from '../config/gravity.cjs';

// const { messagesConfig }  = require( '../config/constants');
import messagesConfig from '../config/constants.js';

// const {Invite}  = require( '../models/invite.mjs');
import Invite from '../models/invite.mjs';

// const Channel  = require( '../models/channel.mjs');
import Channel from '../models/channel.mjs';

// const Message  = require( '../models/message.mjs');
import Message from '../models/message.mjs';

// const { findNotificationInfoByAliasOrJupId }  = require( '../services/notificationService');
import findNotificationInfoByAliasOrJupId from '../services/notificationService.mjs'


const connection = config.socketServer;
// const connection = process.env.SOCKET_SERVER;
// const device = require('express-device');
import device from 'express-device';

// const { sendPushNotification } = require('../config/notifications');
import { sendPushNotification }  from '../config/notifications.js';

// const logger = require('../utils/logger')(module);
import loggerPkg from '../utils/logger.js';
const logger = loggerPkg(this);

import config from '../config.js'


const decryptUserData = req => JSON.parse(gravity.decrypt(req.session.accessData));

const getPNTokensAndSendPushNotification = (
  members,
  channelName,
  senderAlias,
  channel,
  message,
) => {
  findNotificationInfoByAliasOrJupId(members, channel.id)
    .then((data) => {
      if (data && Array.isArray(data) && !_.isEmpty(data)) {
        const tokens = _.map(data, 'token');
        const payload = { title: `${senderAlias} @ ${channelName}`, channel };
        sendPushNotification(tokens, message, 1, payload, 'channels');
      }
    })
    .catch((error) => {
      logger.error(JSON.stringify(error));
    });
};

const getPNTokenAndSendInviteNotification = (senderAlias, recipientAliasOrJupId, channelName) => {
  findNotificationInfoByAliasOrJupId([recipientAliasOrJupId])
    .then((data) => {
      if (data && Array.isArray(data) && !_.isEmpty(data)) {
        const tokens = _.map(data, 'token');
        const alert = `${senderAlias} invited you to the channel "${channelName}"`;
        const payload = { title: 'Invitation', isInvitation: true };
        const threeMinutesDelay = 180000;
        sendPushNotification(tokens, alert, 1, payload, 'channels', threeMinutesDelay);
      }
    })
    .catch((error) => {
      logger.error(error);
    });
};

export default (app, passport, React, ReactDOMServer) => {
  app.use(device.capture());
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

  app.post('/reportUser', controller.isLoggedIn, (req, res) => {
    const transporter = mailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.app.owner.email,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: config.refreshToken,
      },
    });

    const data = req.body.data;

    const body = `
      User Report: <br />
      The user <b>${data.reporter}</b> wants to report the following message: <br />
      ${JSON.stringify(data.message)}
      <br />
      Description:
      ${data.description}
    `;
    transporter.sendMail({
      subject: `Report user: ${data.message.sender}`,
      html: body,
      to: 'info+report-a-user@sigwo.com',
      from: config.app.owner.email,
    }, (err, data) => {
      if (err != null) {
        res.send({ success: true });
        return;
      }

      res.send({ success: true, data });
    });
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
  app.get('/channels/invites', async (req, res) => {
  // app.get('/channels/invites', async (req, res) => {
    logger.info('/n/n/nChannel Invites/n/n');
    logger.info(req.session);
    const invite = new Invite();
    const accessData = _.get(req, 'session.accessData', req.headers.accessdata);
    const userData = JSON.parse(gravity.decrypt(accessData));
    invite.user = userData;
    let response;
    try {
      response = await invite.get('channelInvite');
    } catch (e) {
      logger.error(e);
      response = e;
    }
    res.send(response);
  });

  /**
   * Send an invite
   */
  app.post('/channels/invite', async (req, res) => {
    const { data } = req.body;


    // @TODO: req.user non-functional - get record.account from a different place
    // data.sender = req.user.record.account;
    data.sender = _.get(req, 'user.record.account', req.headers.account);

    const invite = new Invite(data);

    // TODO change these 2 lines once the passport issue is solved
    const accessData = _.get(req, 'session.accessData', req.headers.accessdata);
    invite.user = JSON.parse(gravity.decrypt(accessData));
    let response;

    try {
      response = await invite.send();
      const recipient = _.get(data, 'recipient', '');
      const sender = _.get(data, 'senderAlias', '');
      const channelName = _.get(data, 'channel.name', '');
      getPNTokenAndSendInviteNotification(sender, recipient, channelName);
    } catch (e) {
      logger.error(e);
      response = e;
    }

    res.send(response);
  });

  /**
   * Accept channel invite
   */
  app.post('/channels/import', async (req, res) => {
    const { data, user } = req.body;
    const channel = new Channel(data.channel_record);
    // TODO check the function decryptUserData is using "req.session.accessData"
    const accessData = _.get(req, 'session.accessData', user.accountData);
    channel.user = JSON.parse(gravity.decrypt(accessData));
    // channel.user = decryptUserData(req);

    let response;
    try {
      response = await channel.import(channel.user);
    } catch (e) {
      logger.error(e);
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
    // TODO check the function decryptUserData is using "req.session.accessData"
    const accessData = _.get(req, 'session.accessData', req.headers.accessdata);
    channel.user = JSON.parse(gravity.decrypt(accessData));
    try {
      const order = _.get(req, 'headers.order', 'desc');
      const limit = _.get(req, 'headers.limit', 10);
      const data = await channel.loadMessages(
        req.params.scope,
        req.params.firstIndex,
        order,
        limit,
      );
      response = data;
    } catch (e) {
      logger.error(e);
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
      // TODO fix issue "req.user" related to passportjs to improve this code, we should be able to
      // TODO get that info from mobile requests
      // message.record.sender = req.user.record.account || req?.body?.user?.account;
      message.record.sender = _.get(req, 'user.record.account', req.body.user.account);
      // accountData
      // const userData = decryptUserData(req);
      let members = _.get(req, 'body.members', []);
      const channel = _.get(req, 'body.channel', []);
      const channelName = _.get(tableData, 'name', 'a channel');
      const accessData = _.get(req, 'session.accessData', req.body.user.accountData);
      const userData = JSON.parse(gravity.decrypt(accessData));
      try {
        const data = await message.sendMessage(userData, tableData, message.record);
        response = data;
        if (Array.isArray(members) && members.length > 0) {
          members = members.filter(member => member !== message.record.name);
          getPNTokensAndSendPushNotification(
            members,
            channelName,
            message.record.name,
            channel,
            hasMessage,
          );
        }
      } catch (e) {
        logger.error(JSON.stringify(e));
        response = { success: false, fullError: e };
      }
    } else {
      response = { success: false, messages: [`Message is not valid or exceeds allowable limit of ${maxMessageLength} characters`] };
      logger.error(JSON.stringify(response));
    }
    res.send(response);
  });
};
