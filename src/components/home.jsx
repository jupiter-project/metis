import React from 'react';
import { render } from 'react-dom';
import MetisNotification from './CustomComponents/MetisNotifications.jsx';

export class HomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }

  render() {
    return (
      <div>
        <div className="card card-register mx-auto mt-5 text-center">
          <div className="card-body">
            <h3>Welcome</h3>
            <p className="text-justify">To get started you can create your first <a href="/channels">channel</a>, or provide your account ID to a friend to get invited to a channel and check your <a href="/invites">invites</a> to accept access.</p>
            <div className="mt-5">
              <h5>
                Account ID
              </h5>
              <h6>
                {this.state.user ? this.props.user.record.account : 'Account ID'}
              </h6>
            </div>
            {/* <div className="text-center alert alert-primary mb-0">
              {this.state.user ? this.props.user.record.account : 'Account ID'}
            </div> */}
          </div>
        </div>
        <MetisNotification
          user={this.props.user}
        />
      </div>
    );
  }
}

const HomeExport = () => {
  if (document.getElementById('home-dashboard') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));
    render(
      <HomeComponent user={props.user} messages={props.messages} />,
      document.getElementById('home-dashboard'),
    );
  }
};

export default HomeExport();
