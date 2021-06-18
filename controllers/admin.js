// import find from 'find';

const find = require('find');
const controller = require('../config/controller.js');
const gravity  = require('../config/gravity.cjs');
const {sockerServer} = require('../config.js');
const logger = require('../utils/logger')(module);

module.exports = (app, passport, React, ReactDOMServer) => {
  const connection = sockerServer;
  let page;
  // ===========================================================
  // This constains constants needed to connect with Jupiter
  // ===========================================================
  // Loads Gravity module

  app.get('/admin', controller.isAppAdmin, (req, res) => {
    const messages = req.session.flash;
    const Page = require('../views/admin/index.jsx');

    req.session.flash = null;

    page = ReactDOMServer.renderToString(
      React.createElement(Page, {
        connection,
        messages,
        name: 'Metis - App Summary',
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
      }),
    );
    res.send(page);
  });

  app.get('/admin/tables', controller.isAppAdmin, (req, res) => {
    const messages = req.session.flash;
    const Page = require('../views/admin/tables.jsx');

    req.session.flash = null;

    page = ReactDOMServer.renderToString(
      React.createElement(Page, {
        connection,
        messages,
        name: 'Metis - Table Records',
        user: req.user,
        dashboard: true,
        public_key: req.session.public_key,
      }),
    );
    res.send(page);
  });

  app.get('/admin/api/app', controller.isAppAdmin, (req, res) => {
    gravity.loadAppData()
      .then((response) => {
        res.send({ success: true, application: response.app, tables: response.tables });
      })
      .catch((error) => {
        logger.error(error);
        res.send({ success: false, message: 'There was an error retrieving app data' });
      });
  });

  app.get('/admin/api/:table', controller.isAppAdmin, (req, res, next) => {
    const tableName = req.params.table;
    const exceptions = [];
    let model = '';
    let modelFound = false;

    // If table in route is in the exception list, then it goes lower in the route list
    if (exceptions.includes(tableName)) {
      next();
    } else {
      find.fileSync(/\.js$/, './models').forEach((file) => {
        const modelName = file.replace('models/', '').replace('.js', '');
        let isIncluded = tableName.includes(modelName) || false;
        if (tableName.includes('_')) {
          if (!modelName.includes('_')) {
            isIncluded = false;
          }
        }
        if (isIncluded) {
          modelFound = true;
          model = modelName;
        }
      });

      const file = `../models/${model}.js`;

      if (!modelFound) {
        gravity.getAllRecords(tableName)
          .then((response) => {
            const { records } = response;
            res.send({
              records,
              success: false,
              message: 'Invalid table',
              error: 'table-not-found',
            });
          })
          .catch((error) => {
            logger.error(error);
            res.send({ success: false, message: 'Invalid table', error: 'table-not-found' });
          });
      } else {
        const Record = require(file);

        // We verify the user data here
        const recordObject = new Record({});
        recordObject.findAll()
          .then((response) => {
            res.send(response);
          })
          .catch((error) => {
            logger.error(error);
            res.send({ success: false, errors: error });
          });
      }
    }
  });

  app.post('/admin/api/tables/balance', controller.isAppAdmin, (req, res) => {
    if (req.body.account) {
      gravity.getBalance(req.body.account)
        .then((response) => {
          res.send({ success: true, balances: response });
        })
        .catch((error) => {
          logger.error(error);
          res.send({ success: false, message: 'There was an error retrieving app data' });
        });
    } else {
      const error = { success: false, message: 'Address secret was not included in request' };
      logger.error(error);
      res.send(error);
    }
  });
};
