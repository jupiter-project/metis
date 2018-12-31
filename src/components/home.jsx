import React from 'react';
import { render } from 'react-dom';

export class HomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <div className="card card-register mx-auto mt-5 text-center" style={{ border: '0' }}>
          <div className="card-body">
            <h3>Welcome</h3>
            <p>To get started you can create your first <a href="/channels">channel</a>, or provide your account ID to a friend to get invited to a channel and check your <a href="/invites">invites</a> to accept access.</p>
            <h5>
              <div className="mb-2">
                Account ID
              </div>
              <div>
                {this.state.user ? this.props.user.record.account : 'Account ID'}
              </div>
            </h5>
            {/* <div className="text-center alert alert-primary mb-0">
              {this.state.user ? this.props.user.record.account : 'Account ID'}
            </div> */}
          </div>
        </div>
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
