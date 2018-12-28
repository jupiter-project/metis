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
        <div className="card card-register mx-auto mt-5">
          <div className="card-body">
            <h3 className="text-center">Welcome</h3>
            <p>To get started you can create your first <a href="/channels">channel</a>, or provide the following invitation code and check your <a href="/invites">invites</a> to accept access.</p>
            <div className="text-center alert alert-warning mb-0">
              {this.state.user ? this.props.user.record.account : 'Invitation Code'}
            </div>
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
