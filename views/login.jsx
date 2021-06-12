import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';

class LoginPage extends Component {
  render() {
    return (
      <ApplicationLayout data={this.props}>
        <div id="login-form" />
      </ApplicationLayout>
    );
  }
}

module.exports = LoginPage;
