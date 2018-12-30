import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class SecurityPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div id="security-options">
            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = SecurityPage;
