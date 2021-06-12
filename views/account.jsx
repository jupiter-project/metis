import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';

class AccountPage extends Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div id="account-section">

            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = AccountPage;
