import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class ChannelsPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div id="ChannelsComponent">

            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = ChannelsPage;
