import React from 'react';
import axios from 'axios';
import toastr from 'toastr';

export default class InviteNotifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invites: [],
    }
  }

  componentDidMount() {
    // this.monitorInvites();
    this.loadInvites();
  }

  monitorInvites() {
    const self = this;

    setInterval(() => {
      self.loadInvites();
    }, 1500);
  }

  requestDesktopNotificationPermission(){
    if(Notification && Notification.permission === 'default') {
      Notification.requestPermission(function (permission) {
         if(!('permission' in Notification)) {
           Notification.permission = permission;
         }
      });
    }
  }

  newInviteNotification = (response) => {
    if (Notification.permission === 'granted') {
      var text = `${response.data.records.length} new invites!`;
      this.sendNewInviteNotification(text);
    }
  }

  sendNewInviteNotification = (text) => {
    let notification = new Notification('Metis - Public Test', {
      icon: '/img/logo-dark.png',
      body: text,
      tag: 'metis-invite-tag'
    });

    //3. handle notification events and set timeout 
    notification.onclick = function() {
        window.location.assign('invites');
        window.focus();
        this.close();
      };
      setTimeout(notification.close.bind(notification), 5000);
  }

  loadInvites() {
    const page = this;

    axios.get('/channels/invites')
      .then((response) => {
        if (response.data.records) {
          page.setState({
            invites: response.data.records,
          }, () => {
            this.newInviteNotification(response);
          })
        }
        else {
          toastr.error('No invites');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  render() {
    return (
      <div style={{ display: 'none' }}>
        Invite-Notifications
      </div>
    );
  }
}
