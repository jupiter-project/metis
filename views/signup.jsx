import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class SignupPage extends React.Component {
  render() {
    return (
      <ApplicationLayout data={this.props}>
        <div className="container" id="login-container">
          <div className="card card-register mx-auto mt-5">
            <div className="card-header bg-custom text-light h5">
              Account Registration
            </div>
            <div className="card-body">
              <div id="signup-form" />
            </div>
          </div>
        </div>
      </ApplicationLayout>
    );
  }
}

module.exports = SignupPage;
