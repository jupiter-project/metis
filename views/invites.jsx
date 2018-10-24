import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class InvitesPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div id="invitesComponent">

            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = InvitesPage;
