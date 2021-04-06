import find from 'find';
import { gravity } from './gravity';


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

  /**
   * Get alias
   */
  app.get('/jupiter/alias/:aliasName', async (req, res) => {
    const aliasCheckup = await gravity.getAlias(req.params.aliasName);

    res.send(aliasCheckup);
  });

  /**
   * Get a table associated with a user
   */
  app.get('/api/users/:id/:tableName', (req, res, next) => {
    // const params = req.body;
    // const { data } = params;
    const { headers } = req;
    const { tableName } = req.params;
    const exceptions = ['users'];
    let model = '';

    console.log(req.user);
    console.log(req.headers);

    // If table in route is in the exception list, then it goes lower in the route list
    if (exceptions.includes(tableName)) {
      next();
    } else {
      find.fileSync(/\.js$/, './models').forEach((file) => {
        const modelName = file.replace('models/', '').replace('.js', '');
        let isIncluded = tableName.includes(modelName);
        if (tableName.includes('_')) {
          if (!modelName.includes('_')) {
            isIncluded = false;
          }
        }
        if (isIncluded) {
          model = modelName;
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

      console.log('\n\nGRAVITY DECRYPT\n\n\n')
      console.log(headers);
      console.log('\n\nGRAVITY DECRYPT\n\n\n')

      recordObject.loadRecords(JSON.parse(gravity.decrypt(headers.accessdata)))
        .then((response) => {
          const { records } = response;

          gravity.sortByDate(records);
          res.send({ success: true, [tableName]: records, [`total_${tableName}_number`]: response.records_found });
        })
        .catch((error) => {
          console.log(error);
          res.send({ success: false, errors: error });
        });
    }
  });

  /**
   * Create a record, assigned to the current user
   */
  app.post('/api/:tableName', (req, res, next) => {
    const params = req.body;
    const { data } = params;
    const { tableName } = req.params;
    const exceptions = ['users'];
    let model = '';

    // If table in route is in the exception list, then it goes lower in the route list
    if (exceptions.includes(tableName)) {
      next();
    } else {
      find.fileSync(/\.js$/, './models').forEach((file) => {
        const modelName = file.replace('models/', '').replace('.js', '');
        let isIncluded = tableName.includes(modelName);
        if (tableName.includes('_')) {
          if (!modelName.includes('_')) {
            isIncluded = false;
          }
        }
        if (isIncluded) {
          model = modelName;
        }
      });

      const file = `../models/${model}.js`;

      const Record = require(file);

      const recordObject = new Record(data);
      if (recordObject.belongsTo === 'user') {
        if (params.user) {
          recordObject.accessLink = params.user;
        }
      }
      recordObject.create()
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          console.log(err);
          res.send(err);
        });
    }
  });

  /**
   * Update a record, assigned to the current user
   */
  app.put('/api/:tableName', (req, res, next) => {
    const params = req.body;
    const { data } = params;
    const { tableName } = req.params;
    const exceptions = ['users'];
    let model = '';

    // If table in route is in the exception list, then it goes lower in the route list
    if (exceptions.includes(tableName)) {
      next();
    } else {
      find.fileSync(/\.js$/, './models').forEach((file) => {
        const modelName = file.replace('models/', '').replace('.js', '');
        let isIncluded = tableName.includes(modelName);
        if (tableName.includes('_')) {
          if (!modelName.includes('_')) {
            isIncluded = false;
          }
        }
        if (isIncluded) {
          model = modelName;
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
