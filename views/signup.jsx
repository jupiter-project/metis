import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class SignupPage extends React.Component {
  render() {
    return (
      <ApplicationLayout data={this.props}>
        <div id="signup-form" />
      </ApplicationLayout>
    );
  }
}

module.exports = SignupPage;
