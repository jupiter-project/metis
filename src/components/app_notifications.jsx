import React from 'react';
import { render } from 'react-dom';
import toastr from 'toastr';

class AppNotifications extends React.Component {
  componentDidMount() {
    if (this.props.messages != null && this.props.messages.loginMessage != null) {
      this.props.messages.loginMessage.map((message) => {
        toastr.error(message);
        return null;
      });
    }

    if (this.props.messages != null && this.props.messages.signupMessage != null) {
      this.props.messages.signupMessage.map((message) => {
        toastr.error(message);
        return null;
      });
    }
  }

  render() {
    return (null);
  }
}

const NotificationsExport = () => {
  if (document.getElementById('toastrMessages') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));
    render(<AppNotifications messages={props.messages} />, document.getElementById('toastrMessages'));
  }
};

module.exports = NotificationsExport();
