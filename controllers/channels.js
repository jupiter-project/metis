import controller from '../config/controller';

module.exports = (app, passport, React, ReactDOMServer) => {
  app.get('/channels', controller.isLoggedIn, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/channels.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
        messages,
        name: 'Gravity - Channels',
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
        validation: req.session.jup_key,
        accessData: req.session.accessData,
      }),
    );

    res.send(page);
  });
};
