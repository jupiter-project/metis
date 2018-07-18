import React from 'react';
import { render } from 'react-dom';

class HomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }

  render() {
    return (
        <div className="container">
            <h1 className="text-center mt-3 mb-5">Welcome to Gravity</h1>
        </div>
    );
  }
}

const HomeExport = () => {
  if (document.getElementById('home-dashboard') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(<HomeComponent user={props.user} messages={props.messages} />, document.getElementById('home-dashboard'));
  }
};

module.exports = HomeExport();
