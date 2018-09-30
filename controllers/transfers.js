import controller from '../config/controller';

module.exports = (app, passport, React, ReactDOMServer) => {
  app.get('/admin/transfers', controller.isAppAdmin, (req, res) => {
    const messages = req.session.flash;
    req.session.flash = null;

    const PageFile = require('../views/transfers.jsx');

    const page = ReactDOMServer.renderToString(
      React.createElement(PageFile, {
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
