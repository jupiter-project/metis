var app_name = 'Gravity';

module.exports = function(plop) {
    //We add a helper that will allows us to template with conditional values
    plop.addHelper('ifCond', function(v1, v2, options) {
        if (v1 === v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    plop.addHelper('componentHelper', function(model_file_name, key) {
        return '{' + model_file_name + 'Info.' + model_file_name + '_record.' + key + '}'
    });

    plop.addHelper('wordMixer', function(w1, w2) {
        return '{' + w1 + w2 + '}'
    });

    plop.setGenerator('model', {
        description: 'Generates a model for Gravity application',
        prompts: [{
                type: 'input',
                name: 'model_name',
                message: 'What is your model name?'
            },
            {
                type: 'input',
                name: 'attributes',
                message: "What are your model's attributes?"
            }
        ],
        actions: function(data) {
            var file_name = data.model_name.replace(' ', '_').toLowerCase();
            var table_name = data.model_name.replace(' ', '_').toLowerCase() + 's';

            data.model_name = data.model_name.replace(' ', '');
            data.model_file_name = file_name;
            data.table_name = table_name;
            data.attributes = JSON.parse(data.attributes);

            console.log('Model ' + data.model_name + ' created :' + data.attributes);

            var actions = [{
                type: 'add',
                path: 'models/' + file_name + '.js',
                templateFile: 'templates/model.hbs'
            }];
            return actions;
        }

    });

    plop.setGenerator('data component', {
        description: 'Generates a component that will handle data',
        prompts: [{
                type: 'input',
                name: 'model_name',
                message: 'What is your model name?'
            }, {
                type: 'input',
                name: 'name_of_component',
                message: "How will you name the component for your model? Press ENTER if using default(your model's name)"
            },
            {
                type: 'input',
                name: 'attributes',
                message: "What are your model's attributes?"
            },
        ],
        actions: function(data) {
            var model_name = data.model_name;

            if (data.name_of_component != null && data.name_of_component != '') {
                var component_name = data.name_of_component.replace(' ', '');
                var view_file_name = data.name_of_component.replace(' ', '_').toLowerCase();
            } else {
                var component_name = model_name.replace(' ', '');
                var view_file_name = model_name.replace(' ', '_').toLowerCase();
            }

            data.attributes = JSON.parse(data.attributes);
            data.model_variable_name = model_name.replace(' ', '_').toLowerCase();
            data.records = model_name.replace(' ', '_').toLowerCase() + 's';
            data.component_name = component_name;
            data.view_file_name = view_file_name;
            data.model_name = model_name.replace(' ', '');
            data.app_name = app_name;

            console.log('Component ' + data.model_name + ' created :' + data.attributes);

            var actions = [{
                type: 'add',
                path: 'src/components/' + view_file_name + '.jsx',
                templateFile: 'templates/data_component.hbs'
            }];
            return actions;
        }

    });

    plop.setGenerator('component', {
        description: 'Generates a generic component for your Gravity app',
        prompts: [{
            type: 'input',
            name: 'name_of_component',
            message: "How will you name the component for your model?"
        }, ],
        actions: function(data) {
            var component_name = data.name_of_component.replace(' ', '');
            var view_file_name = data.name_of_component.replace(' ', '_').toLowerCase();

            data.component_name = component_name;
            data.view_file_name = view_file_name;
            data.app_name = app_name;

            console.log('Component ' + data.component_name + ' created');

            var actions = [{
                type: 'add',
                path: 'src/components/' + view_file_name + '.jsx',
                templateFile: 'templates/component.hbs'
            }];
            return actions;
        }

    });


    plop.setGenerator('page', {
        description: 'Generates a route and view for a page',
        prompts: [{
                type: 'input',
                name: 'page_name',
                message: 'What will you name your page?'
            },
            {
                type: 'input',
                name: 'authentication',
                message: "Does this page require authentication? (Type 'y' or 'n')"
            }, {
                type: 'input',
                name: 'dashboard',
                message: "Do you wish to display a dashboard on this page? (Type 'y' or 'n')"
            }
        ],
        actions: function(data) {
            var original_name = data.page_name;
            var page_name = data.page_name.replace(' ', '');
            var view_file_name = data.page_name.replace(' ', '_').toLowerCase();

            if (data.authentication == 'y') {
                var authentication = true;
            } else {
                var authentication = false;
            }

            if (data.dashboard == 'y') {
                var dashboard = true;
            } else {
                var dashboard = false;
            }

            data.original_name = original_name;
            data.page_name = page_name;
            data.view_file_name = view_file_name;
            data.dashboard = dashboard;
            data.authentication = authentication;
            data.app_name = app_name;

            console.log('View ' + data.page_name + ' created');

            var actions = [{
                type: 'add',
                path: 'controllers/' + view_file_name + '.js',
                templateFile: 'templates/controller.hbs'
            }, {
                type: 'add',
                path: 'views/' + view_file_name + '.jsx',
                templateFile: 'templates/view.hbs'
            }];

            if (dashboard) {
                actions.push({
                    type: 'modify',
                    path: 'views/layout/application.jsx',
                    pattern: /({false && 'Generated plop links go here'})/gi,
                    templateFile: 'templates/dashboard_link.hbs'
                });
            }
            return actions;
        }
    });


    plop.setGenerator('scaffold', {
        description: 'Generates model, view and controller for collection of Gravity records',
        prompts: [{
                type: 'input',
                name: 'model_name',
                message: "What is your model's name?"
            },
            {
                type: 'input',
                name: 'attributes',
                message: "What are your model's attributes? See Jupiter documentation for proper format."
            },
            {
                type: 'input',
                name: 'page_name',
                message: "How will you name the page that will display your model's records?"
            },
            {
                type: 'input',
                name: 'multiple_records',
                message: "Will you use your model to record multiple records? ('y' or 'n')."
            },
            {
                type: 'input',
                name: 'dashboard',
                message: "Will you upload a dashboard in this model's view? ('y' or 'n')."
            }
        ],
        actions: function(data) {
            //Now that we have the data input variables, we will start assigning and generating
            // the variables that will be used for file generation.

            if (data.dashboard == 'y') {
                var dashboard = true;
            } else {
                var dashboard = false;
            }

            if (data.page_name == null || data.page_name == '') {
                if (multiple_records) {
                    var original_name = data.model_name + 's';
                } else {
                    var original_name = data.model_name;
                }
                var component_name = model_name.replace(' ', '');
                var view_file_name = model_name.replace(' ', '_').toLowerCase();
            } else {
                var original_name = data.page_name;
                var component_name = data.page_name.replace(' ', '');
                var view_file_name = data.page_name.replace(' ', '_').toLowerCase();
            }

            if (data.multiple_records == 'y') {
                var multiple_records = true;
                var records = data.model_name.replace(' ', '_').toLowerCase() + 's';
            } else {
                var multiple_records = false;
               // var records = data.model_name.replace(' ', '_').toLowerCase();
               var records = data.model_name.replace(' ', '_').toLowerCase() + 's';

            }

            var table_name = data.model_name.replace(' ', '_').toLowerCase() + 's';

            data.app_name = app_name;
            data.original_name = original_name;
            data.page_name = data.page_name.replace(' ', '');
            data.view_file_name = view_file_name;
            data.model_file_name = data.model_name.replace(' ', '_').toLowerCase();
            data.model_variable_name = data.model_name.replace(' ', '_').toLowerCase();
            data.env_name = data.model_name.replace(' ', '_').toUpperCase();
            data.records = records;
            data.table_name = table_name;
            data.model_name = data.model_name.replace(' ', '');
            data.attributes = JSON.parse(data.attributes);
            data.dashboard = dashboard;
            data.component_name = component_name;


            console.log('Model ' + data.model_name + ' to be created :' + data.attributes);
            console.log('Controller ' + data.page_name + ' to be created');
            console.log('Component ' + data.component_name + ' to be created');
            console.log('View ' + data.page_name + 'to be created');

            var actions = [{
                    type: 'add',
                    path: 'models/' + data.model_file_name + '.js',
                    templateFile: 'templates/model.hbs'
                },
                {
                    type: 'add',
                    path: 'controllers/' + view_file_name + '.js',
                    templateFile: 'templates/data_controller.hbs'
                },
                {
                    type: 'add',
                    path: 'views/' + view_file_name + '.jsx',
                    templateFile: 'templates/data_view.hbs'
                }
            ];

            if (multiple_records) {
                actions.push({
                    type: 'add',
                    path: 'src/components/' + view_file_name + '.jsx',
                    templateFile: 'templates/data_component.hbs'
                });
            } else {
                actions.push({
                    type: 'add',
                    path: 'src/components/' + view_file_name + '.jsx',
                    templateFile: 'templates/data_component_single.hbs'
                });
            }

            if (dashboard) {
                actions.push({
                    type: 'modify',
                    path: 'views/layout/application.jsx',
                    pattern: /({false && 'Generated plop links go here'})/gi,
                    templateFile: 'templates/dashboard_link.hbs'
                });
            }

            return actions;
        }
    });
};