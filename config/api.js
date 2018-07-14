import find from 'find';
import gravity from './gravity';

// This file handles the app's different pages and how they are routed by the system

module.exports = (app) => {
  // let bcrypt = require('bcrypt-nodejs');
  // let session = require('express-session');
  // let flash = require('connect-flash');
  // let Queue = require('bull');
  // let controller = require('../config/controller.js');

  // ===========================================================
  // This constains constants needed to connect with Jupiter
  // ===========================================================
  // Loads Gravity module
  // let gravity = require('../config/gravity.js');


  // ===============================================================================
  //  API GENERAL ROUTES
  // ===============================================================================
  app.get('/api/users/:id/:table_name', (req, res, next) => {
    // const params = req.body;
    // const { data } = params;
    const { headers } = req;
    const { table_name } = req.params;
    const exceptions = ['users'];
    let model = '';

    // If table in route is in the exception list, then it goes lower in the route list
    if (exceptions.includes(table_name)) {
      next();
    } else {
      find.fileSync(/\.js$/, './models').forEach((file) => {
        const model_name = file.replace('models/', '').replace('.js', '');
        let is_included = table_name.includes(model_name);
        if (table_name.includes('_')) {
          if (!model_name.includes('_')) {
            is_included = false;
          }
        }
        if (is_included) {
          model = model_name;
        }
      });

      const file = `../models/${model}.js`;

      const Record = require(file);

      // We verify the user data here
      const recordObject = new Record(
        {
          user_id: req.params.id,
          public_key: headers.user_public_key,
          user_api_key: headers.user_api_key,
        },
      );

      recordObject.loadRecords()
        .then((response) => {
          const { records } = response;

          gravity.sortByDate(records);
          res.send({ success: true, [table_name]: records, [`total_${table_name}_number`]: response.records_found });
        })
        .catch((error) => {
          console.log(error);
          res.send({ success: false, errors: error });
        });
    }
  });

  app.post('/api/:table_name', (req, res, next) => {
    const params = req.body;
    const { data } = params;
    const { table_name } = req.params;
    const exceptions = ['users'];
    let model = '';

    // If table in route is in the exception list, then it goes lower in the route list
    if (exceptions.includes(table_name)) {
      next();
    } else {
      find.fileSync(/\.js$/, './models').forEach((file) => {
        const model_name = file.replace('models/', '').replace('.js', '');
        let is_included = table_name.includes(model_name);
        if (table_name.includes('_')) {
          if (!model_name.includes('_')) {
            is_included = false;
          }
        }
        if (is_included) {
          model = model_name;
        }
      });

      const file = `../models/${model}.js`;

      const Record = require(file);

      const recordObject = new Record(data);

      recordObject.create()
        .then((response) => {
          // console.log(response);
          // console.log(response);
          res.send(response);
        })
        .catch((err) => {
          console.log(err);
          res.send(err);
        });
    }
  });

  app.put('/api/:table_name', (req, res, next) => {
    const params = req.body;
    const { data } = params;
    const { table_name } = req.params;
    const exceptions = ['users'];
    let model = '';

    // If table in route is in the exception list, then it goes lower in the route list
    if (exceptions.includes(table_name)) {
      next();
    } else {
      find.fileSync(/\.js$/, './models').forEach((file) => {
        const model_name = file.replace('models/', '').replace('.js', '');
        let is_included = table_name.includes(model_name);
        if (table_name.includes('_')) {
          if (!model_name.includes('_')) {
            is_included = false;
          }
        }
        if (is_included) {
          model = model_name;
        }
      });

      const file = `../models/${model}.js`;

      const Record = require(file);

      // We verify the user data here
      const recordObject = new Record(data);

      recordObject.update()
        .then((response) => {
          // console.log(response);
          res.send(response);
        })
        .catch((err) => {
          console.log(err);
          res.send(err);
        });
    }
  });
};
