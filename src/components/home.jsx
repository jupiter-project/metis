import React from 'react';
import { render } from 'react-dom';

class HomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div className="container">
        <div className="page-title">Welcome to your Gravity app</div>
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
      document.getElementById('home-dashboard')
    );
  }
};

module.exports = HomeExport();
