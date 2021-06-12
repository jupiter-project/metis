import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';

class SettingsPage extends Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div id="settings-options">
            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = SettingsPage;
