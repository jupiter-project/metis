import React from 'react';
import { render } from 'react-dom';
import toastr from 'toastr';
import io from 'socket.io-client';

class AppNotifications extends React.Component {
  constructor(props) {
    super(props);
    this.socket = io(this.props.connection);
  }

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

    this.socket.on('disconnect', () => {
      toastr.error('Connection interrupted');
    });

    if (this.props.user) {
      this.socket.on(`fullyRegistered#${this.props.user.record.account}`, () => {
        toastr.success('Registration details have been completed!');
      });
    }

    if (this.props.user) {
      this.socket.on(`channelsCreated#${this.props.user.record.account}`, () => {
        toastr.success('Channels are now enabled! You may create new channels or accept channel invitations');
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
    render(<AppNotifications user={props.user} messages={props.messages} />, document.getElementById('toastrMessages'));
  }
};

module.exports = NotificationsExport();
