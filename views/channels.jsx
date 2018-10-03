import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class ChannelsPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <h1 className="text-center">Your Channels</h1>

            <div id="ChannelsComponent">

            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = ChannelsPage;
