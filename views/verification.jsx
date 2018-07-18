import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class VerificationPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div className="text-center">
                <h1 className="text-center">Two-factor authentication</h1>
                <hr />
                <div id="2fa-verification-area">

                </div>
            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = VerificationPage;
