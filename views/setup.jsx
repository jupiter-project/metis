import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';

class SetupPage extends Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div className="text-center">
                <h1 className="text-center">Two-Factor Authentication</h1>
                <hr />
                <div id="2fa-setup-area">
                </div>
            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = SetupPage;
