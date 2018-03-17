//This files handles the app's different pages and how they are routed by the system

module.exports = function(app) {
    var bcrypt = require('bcrypt-nodejs');
    var session = require('express-session');
    var flash = require('connect-flash');
    var Queue = require('bull');
    var controller = require('../config/controller.js');
    //===========================================================
    // This constains constants needed to connect with Jupiter
    //===========================================================
    var axios = require('axios');
    //Loads Gravity module
    var gravity = require('../config/gravity.js');


    //===============================================================================
    //  API GENERAL ROUTES
    //===============================================================================
    app.get('/api/users/:id/:table_name', (req, res) => {

        const find = require("find");
        var params = req.body;
        var data = params.data;
        var table_name = req.params.table_name;
        var model = '';
        var exceptions=['users']
        var headers= req.headers;

        //If table in route is in the exception list, then it goes lower in the route list
        if(exceptions.includes(table_name)){
            next();
        }else{
            find.fileSync(/\.js$/, './models').forEach((file) => {
                var model_name = file.replace('models/', '').replace('.js', '');
                var is_included = table_name.includes(model_name) ? true : false;
                if(table_name.includes('_')){
                    if(!model_name.includes('_')){
                        is_included=false;
                    }
                }
                if (is_included) {
                    model = model_name;
                }
            });

            //res.send({ message: 'Received' });
            var file= '../models/' + model + '.js';

            var Record = require(file);

            //We verify the user data here
            var recordObject = new Record(
                {
                    user_id: req.params.id,
                    public_key: headers.user_public_key,
                    user_api_key: headers.user_api_key
                });
        
            recordObject.loadRecords()
            .then(response => {
                var records = response.records;
                //console.log(response);
                gravity.sortByDate(records);
                res.send({ success: true, [table_name]: records, ['total_'+table_name+'_number']: response.records_found });

            })
            .catch(error => {
                console.log(error);
                res.send({ success: false, errors: error });

            });
        }
    })   

    app.post('/api/:table_name', function(req, res, next) {
        const find = require("find");
        var params = req.body;
        var data = params.data;
        var table_name = req.params.table_name;
        var model = '';
        var exceptions=['users']

        //console.log(data);

        //If table in route is in the exception list, then it goes lower in the route list
        if(exceptions.includes(table_name)){
            next();
        }else{
            find.fileSync(/\.js$/, './models').forEach((file) => {
                var model_name = file.replace('models/', '').replace('.js', '');
                var is_included = table_name.includes(model_name) ? true : false;
                if(table_name.includes('_')){
                    if(!model_name.includes('_')){
                        is_included=false;
                    }
                }
                if (is_included) {
                    model = model_name;
                }
            });

            //res.send({ message: 'Received' });
            var file= '../models/' + model + '.js';

            var Record = require(file);

            //We verify the user data here
            var recordObject = new Record(data);

            recordObject.create()
            .then(response => {
                //console.log(response);
                //console.log(response);
                res.send(response)
            })
            .catch(err => {
                console.log(err)
                res.send(err)
            });
        }
    });

    app.put('/api/:table_name', function(req, res, next) {
        const find = require("find");
        var params = req.body;
        var data = params.data;
        var table_name = req.params.table_name;
        var model = '';
        var exceptions=['users']

        //If table in route is in the exception list, then it goes lower in the route list
        if(exceptions.includes(table_name)){
            next();
        }else{
            find.fileSync(/\.js$/, './models').forEach((file) => {
                var model_name = file.replace('models/', '').replace('.js', '');
                var is_included = table_name.includes(model_name) ? true : false;
                if(table_name.includes('_')){
                    if(!model_name.includes('_')){
                        is_included=false;
                    }
                }
                if (is_included) {
                    model = model_name;
                }
            });

            //res.send({ message: 'Received' });
            var file= '../models/' + model + '.js';

            var Record = require(file);

            //We verify the user data here
            var recordObject = new Record(data);

            recordObject.update()
            .then(response => {
                //console.log(response);
                res.send(response)
            })
            .catch(err => {
                console.log(err)
                res.send(err)
            });
        }
    });
}