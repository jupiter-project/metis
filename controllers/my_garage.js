module.exports = function(app, passport, React, ReactDOMServer) {
    const session = require('express-session');
    const flash = require('connect-flash');
    const controller = require('../config/controller.js');

    //===========================================================
    // This constains constants needed to connect with Jupiter
    //===========================================================
    const axios = require('axios');
    //Loads Gravity module
    const gravity = require('../config/gravity.js');

    app.get('/my_garage', controller.isLoggedIn, (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;

        const PageFile = require('../views/my_garage.jsx');

        var page = ReactDOMServer.renderToString(
            React.createElement(PageFile, { name: 'Gravity - MyGarage', user: req.user, dashboard: true, public_key: req.session.public_key, validation: req.session.jup_key, messages: messages })
        );

        res.send(page);
    });
}