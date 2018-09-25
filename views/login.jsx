import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class LoginPage extends React.Component {
  render() {
    return (
      <ApplicationLayout data={this.props}>
        <div className="card card-register mx-auto mt-5">
          <div className="card-header bg-custom text-light h5">
            Login
          </div>
          <div className="card-body">
            <div id="login-form" />
          </div>
        </div>
      </ApplicationLayout>
    );
  }
}

module.exports = LoginPage;
