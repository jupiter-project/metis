module.exports = function(app, passport, React, ReactDOMServer) {

    var session = require('express-session');
    var flash = require('connect-flash');
    var Queue = require('bull');
    var controller = require('../config/controller.js');
    var page;

    //===========================================================
    // This constains constants needed to connect with Jupiter
    //===========================================================
    var axios = require('axios');

    //Loads Gravity module
    var gravity = require('../config/gravity.js');

    app.get('/admin', controller.isAppAdmin, (req, res) => {
        var messages = req.session.flash;
        req.session.flash = null;

        const Page = require('../views/admin/admin.jsx');

        page = ReactDOMServer.renderToString(
            React.createElement(Page, {
                name: 'Gravity - Admin',
                user: req.user,
                dashboard: true,
                messages: messages,
                public_key: req.session.public_key
            })
        );

        res.send(page);
    });

    app.get('/admin/api/app', controller.isAppAdmin, (req, res) => {
        gravity.loadAppData()
        .then(response => {
            //console.log(response);
            res.send({success: true, application: response.app, tables: response.tables});
        })
        .catch(error => {
            console.log(error);
            res.send({success: false, message: 'There was an error retrieving app data'});
        });
    });

    app.get('/admin/api/:table', controller.isAppAdmin, (req, res) => {
        const find = require("find");
        var params = req.body;
        var data = params.data;
        var table_name = req.params.table;
        var model = '';
        var exceptions=[]
        var headers= req.headers;
        var model_found= false;

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
                    model_found=true;
                    model = model_name;
                }
            });

            //res.send({ message: 'Received' });
            var file= '../models/' + model + '.js';

            if(!model_found){
                res.send({success: false, message: 'Invalid table', error: 'table-not-found'})
            }else{
                var Record = require(file);

                //We verify the user data here
                var recordObject = new Record({});
            
                recordObject.findAll()
                .then(response => {
                    //var records = response.records;
                    //console.log(response);
                    //gravity.sortByDate(records);
                    res.send(response);
    
                })
                .catch(error => {
                    console.log(error);
                    res.send({ success: false, errors: error });
    
                });
            }
        }
    });
}