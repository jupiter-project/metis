import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class UserListPage extends React.Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            <h1 className="text-center">User List</h1>
            <div id="UserListComponent">
            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = UserListPage;
