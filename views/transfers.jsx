import React from 'react';
import ApplicationLayout from './layout/admin.jsx';

class TransfersPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <h1 className="text-center">Transfers</h1>

            <div id="TransfersComponent">

            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = TransfersPage;
