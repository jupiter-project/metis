import controller from '../config/controller';
import { gravity } from '../config/gravity';
import Invite from '../models/invite';

module.exports = (app, passport, React, ReactDOMServer) => {
  app.get('/channels', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/channels.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
        messages,
        name: 'Metis - Your Channels',
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
        messages,
        name: 'Metis - Your Invites',
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
    console.log('We are getting the invites now');

    const invite = new Invite();
    const userData = JSON.parse(gravity.decrypt(req.session.accessData));
    invite.user = userData;
    let response;
    try {
      response = await invite.get('channelInvite');
    } catch (e) {
      response = e;
    }
    console.log(response);
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
};
