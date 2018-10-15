import controller from '../config/controller';

const connection = process.env.SOCKET_SERVER;

module.exports = (app, passport, React, ReactDOMServer) => {
  app.get('/admin/transfers', controller.isAppAdmin, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/transfers.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
        connection,
        messages,
        name: 'Metis - Transfers',
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
        validation: req.session.jup_key,
      }),
    );

    res.send(page);
  });
};
