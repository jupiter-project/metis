import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';
import Notification from 'react-web-notification';

class MetisNotifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invites: [],
      newInvites: [],
      ignore: true,
      title: '',
      notify: false,
      waitingForData: false,
    };
  }

  componentDidMount() {
    if (this.props.user) {
      console.log('user logged in')
      this.loadInvites();
    }
  }

  handlePermissionGranted() {
    console.log('Permission Granted');
    this.setState({
      ignore: false
    });
  }

  handlePermissionDenied() {
    console.log('Permission Denied');
    this.setState({
      ignore: true
    });
  }

  handleNotSupported() {
    console.log('Web Notification not Supported');
    this.setState({
      ignore: true
    });
  }

  notificationsEnabled() {
    if (this.state.ignore) {
      return;
    }

    const now = Date.now().toLocaleString;

    const title = "Metis"
    const body = 'Notifications Are Enabled';
    const tag = now;
    const icon = 'http://localhost:4000/img/shield-dark.png';

    const options = {
      tag,
      body,
      icon,
      lang: 'en',
      dir: 'ltr',
    }

    this.setState({
      title,
      options,
    });
  }

  handleNewInviteNotification() {
    if (this.state.ignore) {
      return;
    }

    const now = Date.now().toLocaleString;

    const title = "Metis"
    const body = 'New Invite!';
    const tag = now;
    const icon = 'http://localhost:4000/img/shield-dark.png';

    const options = {
      tag,
      body,
      icon,
      lang: 'en',
      dir: 'ltr',
    }

    this.setState({
      title,
      options,
    });
  }

  handleButtonClick() {

    if(this.state.ignore) {
      return;
    }

    const now = Date.now().toLocaleString;

    const title = 'React-Web-Notification' + now;
    const body = 'Hello' + new Date();
    const tag = now;
    const icon = 'http://georgeosddev.github.io/react-web-notification/example/Notifications_button_24.png';
    // const icon = 'http://localhost:3000/Notifications_button_24.png';

    // Available options
    // See https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification
    const options = {
      tag: tag,
      body: body,
      icon: icon,
      lang: 'en',
      dir: 'ltr',
      sound: './sound.mp3'  // no browsers supported https://developer.mozilla.org/en/docs/Web/API/notification/sound#Browser_compatibility
    }
    this.setState({
      title: title,
      options: options
    });
  }

  loadInvites() {
    const page = this;

    axios.get('/channels/invites')
      .then((response) => {
        const { records } = response.data;
        if (records) {
          page.setState({
            invites: records,
          }, () => {
            this.handleNewInviteNotification();
          });
        } else {
          toastr.error('No invites');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
      // page.setState({
      //   notify: false,
      // });
  }

  monitorData() {
    const self = this;

    setInterval(() => {
      self.checkInvites();
    }, 1500);
  }

  checkInvites() {
    const page = this;

    const currentInvites = JSON.stringify(page.state.invites);

    axios.get('/channels/invites')
      .then((response) => {
        const responseInvites = response.data.records;
        if (response.data.success) {
          if (currentInvites !== responseInvites && response.data.records) {
            page.setState({
              invites: responseInvites,
              notify: true,
            })
          }
        } else {
          console.log('no new invites')
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  render() {
    const { state } = this;

    if (state.notify) {
      this.handleNewInviteNotification();
    }

    return (
      <div className="text-center">
        <div className="fixed-bottom pb-5">
          <button className="btn btn-custom" onClick={this.handleNewInviteNotification.bind(this)}>Notify Me!</button>
        </div>
        <Notification
          ignore={this.state.ignore && this.state.title !== ''}
          notSupported={this.handleNotSupported.bind(this)}
          onPermissionGranted={this.handlePermissionGranted.bind(this)}
          onPermissionDenied={this.handlePermissionDenied.bind(this)}
          timeout={5000}
          title={this.state.title}
          options={this.state.options}
        />
      </div>
    );
  }
}

const InvitesExport = () => {
  if (document.getElementById('metis-notifications') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <MetisNotifications
        user={props.user}
        validation={props.validation}
        public_key={props.public_key}
        accessData={props.accessData}
      />,
      document.getElementById('metis-notifications'),
    );
  }
};

module.exports = InvitesExport();
