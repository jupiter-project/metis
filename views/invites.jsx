import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';

class InvitesPage extends Component {
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
