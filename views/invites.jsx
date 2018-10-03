import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class InvitesPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <h1 className="text-center">Your Invites</h1>

            <div id="invitesComponent">

            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = InvitesPage;
