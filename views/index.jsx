import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';

class IndexPage extends Component {
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
