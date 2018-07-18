import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class IndexPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div id="home-dashboard">
            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = IndexPage;
