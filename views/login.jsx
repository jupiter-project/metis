import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class LoginPage extends React.Component {
  render() {
    return (
      <ApplicationLayout data={this.props}>
        <div className="card card-login mx-auto mt-5">
          <div className="card-header bg-custom-primary text-light">
            <h5>Login</h5>
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
