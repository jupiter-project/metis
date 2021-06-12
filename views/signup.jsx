import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';

class SignupPage extends Component {
  render() {
    return (
      <ApplicationLayout data={this.props}>
        <div id="signup-form" />
      </ApplicationLayout>
    );
  }
}

module.exports = SignupPage;
