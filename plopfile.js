const appName = 'Metis';

module.exports = (plop) => {
  // We add a helper that will allows us to template with conditional values
  plop.addHelper('ifCond', (v1, v2, options) => {
    if (v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  plop.addHelper('componentHelper', (modelFileName, key) => (
    `{${modelFileName}Info.${modelFileName}_record.${key}}`
  ));

  plop.addHelper('wordMixer', (w1, w2) => `{${w1 + w2}}`);

  plop.setGenerator('model', {
    description: 'Generates a model for Metis application',
    prompts: [
      {
        type: 'input',
        name: 'model_name',
        message: 'What is your model name?',
      },
      {
        type: 'input',
        name: 'attributes',
        message: "What are your model's attributes?",
      },
    ],
    actions: (actionData) => {
      const data = actionData;
      const fileName = data.model_name.replace(' ', '_').toLowerCase();
      const tableName = `${data.model_name.replace(' ', '_').toLowerCase()}s`;

      data.model_name = data.model_name.replace(' ', '');
      data.model_file_name = fileName;
      data.table_name = tableName;
      data.attributes = JSON.parse(data.attributes);

      console.log(`Model ${data.model_name} created: ${data.attributes}`);

      const actions = [{
        type: 'add',
        path: `models/${fileName}.js`,
        templateFile: 'templates/model.hbs',
      }];
      return actions;
    },
  });

  plop.setGenerator('data component', {
    description: 'Generates a component that will handle data',
    prompts: [
      {
        type: 'input',
        name: 'model_name',
        message: 'What is your model name?',
      }, {
        type: 'input',
        name: 'name_of_component',
        message: "How will you name the component for your model? Press ENTER if using default(your model's name)",
      },
      {
        type: 'input',
        name: 'attributes',
        message: "What are your model's attributes?",
      },
    ],
    actions: (actionData) => {
      const data = actionData;
      const modelName = data.model_name;
      let componentName;
      let viewFileName;
      if (data.name_of_component != null && data.name_of_component !== '') {
        componentName = data.name_of_component.replace(' ', '');
        viewFileName = data.name_of_component.replace(' ', '_').toLowerCase();
      } else {
        componentName = modelName.replace(' ', '');
        viewFileName = modelName.replace(' ', '_').toLowerCase();
      }

      data.attributes = JSON.parse(data.attributes);
      data.model_variable_name = modelName.replace(' ', '_').toLowerCase();
      data.records = `${modelName.replace(' ', '_').toLowerCase()}s`;
      data.component_name = componentName;
      data.view_file_name = viewFileName;
      data.model_name = modelName.replace(' ', '');
      data.app_name = appName;

      console.log(`Component ${data.model_name} created: ${data.attributes}`);

      const actions = [{
        type: 'add',
        path: `src/components/${viewFileName}.jsx`,
        templateFile: 'templates/data_component.hbs',
      }];

      return actions;
    },
  });

  plop.setGenerator('component', {
    description: 'Generates a generic component for your Gravity app',
    prompts: [
      {
        type: 'input',
        name: 'name_of_component',
        message: 'How will you name the component for your model?',
      },
    ],
    actions: (actionData) => {
      const data = actionData;
      const componentName = data.name_of_component.replace(' ', '');
      const viewFileName = data.name_of_component.replace(' ', '_').toLowerCase();

      data.component_name = componentName;
      data.view_file_name = viewFileName;
      data.app_name = appName;

      console.log(`Component ${data.component_name} created`);

      const actions = [
        {
          type: 'add',
          path: `src/components/${viewFileName}.jsx`,
          templateFile: 'templates/component.hbs',
        }];
      return actions;
    },
  });


  plop.setGenerator('page', {
    description: 'Generates a route and view for a page',
    prompts: [
      {
        type: 'input',
        name: 'page_name',
        message: 'What will you name your page?',
      },
      {
        type: 'input',
        name: 'authentication',
        message: "Does this page require authentication? (Type 'y' or 'n')",
      }, {
        type: 'input',
        name: 'dashboard',
        message: "Do you wish to display a dashboard on this page? (Type 'y' or 'n')",
      },
    ],
    actions: (actionData) => {
      const data = actionData;
      const originalName = data.page_name;
      const pageName = data.page_name.replace(' ', '');
      const viewFileName = data.page_name.replace(' ', '_').toLowerCase();
      let authentication;
      let dashboard;
      if (data.authentication === 'y') {
        authentication = true;
      } else {
        authentication = false;
      }

      if (data.dashboard === 'y') {
        dashboard = true;
      } else {
        dashboard = false;
      }

      data.original_name = originalName;
      data.page_name = pageName;
      data.view_file_name = viewFileName;
      data.dashboard = dashboard;
      data.authentication = authentication;
      data.app_name = appName;

      console.log(`View ${data.page_name} created`);

      const actions = [
        {
          type: 'add',
          path: `controllers/${viewFileName}.js`,
          templateFile: 'templates/controller.hbs',
        }, {
          type: 'add',
          path: `views/${viewFileName}.jsx`,
          templateFile: 'templates/view.hbs',
        }];

      if (dashboard) {
        actions.push({
          type: 'modify',
          path: 'views/layout/application.jsx',
          pattern: /({false && 'Generated plop links go here'})/gi,
          templateFile: 'templates/dashboard_link.hbs',
        });
      }
      return actions;
    },
  });


  plop.setGenerator('scaffold', {
    description: 'Generates model, view and controller for collection of Gravity records',
    prompts: [{
      type: 'input',
      name: 'model_name',
      message: "What is your model's name?",
    },
    {
      type: 'input',
      name: 'attributes',
      message: "What are your model's attributes? See Jupiter documentation for proper format.",
    },
    {
      type: 'input',
      name: 'page_name',
      message: "How will you name the page that will display your model's records?",
    },
    {
      type: 'input',
      name: 'multiple_records',
      message: "Will you use your model to record multiple records? ('y' or 'n').",
    },
    {
      type: 'input',
      name: 'dashboard',
      message: "Will you upload a dashboard in this model's view? ('y' or 'n').",
    },
    ],
    actions: (actionData) => {
      // Now that we have the data input variables, we will start assigning and generating
      // the variables that will be used for file generation.
      const data = actionData;
      let dashboard;
      let originalName;
      let componentName;
      let viewFileName;
      let multipleRecords;
      let records;

      if (data.dashboard === 'y') {
        dashboard = true;
      } else {
        dashboard = false;
      }

      if (data.page_name == null || data.page_name === '') {
        if (data.multiple_records === 'y') {
          originalName = `${data.model_name}s`;
        } else {
          originalName = data.model_name;
        }
        componentName = data.model_name.replace(' ', '');
        viewFileName = data.model_name.replace(' ', '_').toLowerCase();
      } else {
        originalName = data.page_name;
        componentName = data.page_name.replace(' ', '');
        viewFileName = data.page_name.replace(' ', '_').toLowerCase();
      }

      if (data.multiple_records === 'y') {
        multipleRecords = true;
        records = `${data.model_name.replace(' ', '_').toLowerCase()}s`;
      } else {
        multipleRecords = false;
        records = `${data.model_name.replace(' ', '_').toLowerCase()}s`;
      }

      const tableName = `${data.model_name.replace(' ', '_').toLowerCase()}s`;

      data.app_name = appName;
      data.original_name = originalName;
      data.page_name = data.page_name.replace(' ', '');
      data.view_file_name = viewFileName;
      data.model_file_name = data.model_name.replace(' ', '_').toLowerCase();
      data.model_variable_name = data.model_name.replace(' ', '_').toLowerCase();
      data.env_name = data.model_name.replace(' ', '_').toUpperCase();
      data.records = records;
      data.table_name = tableName;
      data.model_name = data.model_name.replace(' ', '');
      data.attributes = JSON.parse(data.attributes);
      data.dashboard = dashboard;
      data.component_name = componentName;


      console.log(`Model ${data.model_name} to be created: ${data.attributes}`);
      console.log(`Controller ${data.page_name} to be created`);
      console.log(`Component ${data.component_name} to be created`);
      console.log(`View ${data.page_name} to be created`);

      const actions = [
        {
          type: 'add',
          path: `models/${data.model_file_name}.js`,
          templateFile: 'templates/model.hbs',
        },
        {
          type: 'add',
          path: `controllers/${viewFileName}.js`,
          templateFile: 'templates/data_controller.hbs',
        },
        {
          type: 'add',
          path: `views/${viewFileName}.jsx`,
          templateFile: 'templates/data_view.hbs',
        },
      ];

      if (multipleRecords) {
        actions.push({
          type: 'add',
          path: `src/components/${viewFileName}.jsx`,
          templateFile: 'templates/data_component.hbs',
        });
      } else {
        actions.push({
          type: 'add',
          path: `src/components/${viewFileName}.jsx`,
          templateFile: 'templates/data_component_single.hbs',
        });
      }

      if (dashboard) {
        actions.push({
          type: 'modify',
          path: 'views/layout/application.jsx',
          pattern: /({false && 'Generated plop links go here'})/gi,
          templateFile: 'templates/dashboard_link.hbs',
        });
      }

      return actions;
    },
  });
};
