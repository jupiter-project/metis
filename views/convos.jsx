import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';

class ConvosPage extends Component {
  render() {
    return (
        <ApplicationLayout data={this.props}>
            {/*<div className="page-title">Channel #{this.props.channelId}</div>*/}

            <div id="convosComponent">

            </div>
        </ApplicationLayout>
    );
  }
}

module.exports = ConvosPage;
