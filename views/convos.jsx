import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class ConvosPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <h1 className="text-center">Channel #{this.props.channelId}</h1>

            <div id="convosComponent">

            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = ConvosPage;
