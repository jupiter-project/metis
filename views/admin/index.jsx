import React from 'react';
import ApplicationLayout from '../layout/admin.jsx';

class DataPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <ApplicationLayout data={this.props}>
            <div id="app-admin-dashboard">
            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = DataPage;
