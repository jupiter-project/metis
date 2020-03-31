import React from 'react';
import axios from 'axios';
import toastr from 'toastr';
import Notification from 'react-web-notification/lib/components/Notification';

export default class MetisNotifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invites: [],
      messages: [],
      tableData: {},
      waitingForData: false,
      monitoring: false,
      queryScope: 'all',
      transactionIds: [],
      firstIndex: 0,
      loading: true,
      ignore: true,
      title: '',
    }
  }

  componentDidMount() {
    // this.monitorInvites();
    this.loadInvites();
    this.loadMessages();
  }

  // Handle Permissions
  handlePermissionGranted = () => {
    console.log('Permission Granted');
    this.setState({
      ignore: false,
    });
  }

  handlePermissionDenied = () => {
    console.log('Permission Denied');
    this.setState({
      ignore: true,
    });
  }

  handleNotSupported = () => {
    console.log('Web Notification not Supported');
    this.setState({
      ignore: true,
    });
  }

  handleNotificationOnClick = (e, tag) => {
    console.log(e, 'Notification clicked tag: ' + tag);
  }

  handleNotificationOnError = (e, tag) => {
    console.log(e, 'Notification error tag: ' + tag);
  }

  handleNotificationOnClose = (e, tag) => {
    console.log(e, 'Notification close tag: ' + tag);
  }

  handleNotificationOnShow = (e, tag) => {
    this.playSound();
    console.log(e, 'Notification shown tag: ' + tag);
  }

  playSound(filename) {
    document.getElementById('sound').play();
  }

  handleButtonClick = () => {
    if (this.state.ignore) {
      return;
    }

    const now = Date.now();

    const title = 'React-Web-Notification' + now;
    const body = 'Hello ' + new Date();
    const tag = now;
    const icon = 'http://georgeosddev.github.io/react-web-notification/example/Notifications_button_24.png';
    // const icon = 'http://localhost:4000/img/logo-dark.png';

    const options = {
      tag,
      body,
      icon,
      lang: 'en',
      dir: 'ltr',
      // sound: './sound.mp3',
    }
    this.setState({
      title,
      options,
    });
  }

  loadInvites() {
    const page = this;

    axios.get('/channels/invites')
      .then((response) => {
        if (response.data.records) {
          page.setState({
            invites: response.data.records,
          }, () => {
            // this.handleButtonClick();
          })
        }
        else {
          toastr.error('No invites');
        }
        console.log(this.state.invites);
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  loadMessages() {
    const page = this;
    this.setState({
      waitingForData: true,
    });

    const currentData = JSON.stringify(this.state.messages);

    const config = {
      headers: {
        user_api_key: this.props.user.record.api_key,
        user_public_key: this.props.public_key,
        accessdata: this.props.accessData,
        channelaccess: this.state.tableData.passphrase,
        channeladdress: this.state.tableData.account,
        channelkey: this.state.tableData.password,
        channelpublic: this.state.tableData.publicKey,
      },
    };
    const index = this.state.queryScope === 'unconfirmed' ? 0 : this.state.firstIndex;

    axios.get(`/data/messages/${this.state.queryScope}/${index}`, config)
      .then((response) => {
        // console.log(response.data);
        if (response.data.success) {
          if (page.state.queryScope === 'all') {
            const responseData = JSON.stringify(response.data.messages);

            if (currentData !== responseData
              && response.data.messages) {
              page.setTransactionsIds(response.data.messages);
              page.setState({
                messages: response.data.messages,
                queryScope: 'unconfirmed',
                loading: false,
              });
            }
          }
          else if (page.state.queryScope === 'unconfirmed') {
            const newMessages = response.data.messages;
            if (newMessages.length > 0) {
              page.handleNewData(response.data.messages);
            }
          }
          page.setState({
            waitingForData: false,
          }, () => {
            if (!page.state.monitoring) {
              page.setState({
                monitoring: true,
              }, () => {
                page.monitorData();
              });
            }
          });
        } else {
          page.setState({
            waitingForData: false,
          });
          console.log(this.state.messages);
          // toastr.error('No record history');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  checkUpdates() {
    if (!this.state.waitingForData) {
      this.loadMessages();
    }
  }

  monitorData() {
    const self = this;

    setInterval(() => {
      if (!(self.state.submitted || self.state.update_submitted)) {
        self.checkUpdates();
      }
    }, 1500);
  }

  handleNewData(messages) {
    const ids = this.state.transactionIds;
    const currentMessages = this.state.messages;
    for (let x = 0; x < messages.length; x += 1) {
      const thisMessage = messages[x];

      if (!ids.includes(thisMessage.fullRecord.transaction)) {
        currentMessages.push(thisMessage);
        ids.push(thisMessage.fullRecord.transaction);
      }
    }

    this.setState({
      transactionIds: ids,
      messages: currentMessages,
    });
  }

  render() {
    return (
      <div>
        <Notification
          ignore={this.state.ignore && this.state.title !== ''}
          handleNotSupported={this.handleNotSupported}
          onPermissionGranted={this.handlePermissionGranted}
          onPermissionDenied={this.handlePermissionDenied}
          onShow={this.handleNotificationOnShow}
          onClick={this.handleNotificationOnClick}
          onClose={this.handleNotificationOnClose}
          onError={this.handleNotificationOnError}
          timeout={1000}
          title={this.state.title}
          options={this.state.options}
        />
        {/* <audio id='sound' preload='auto'>
          <source src='./sound.mp3' type='audio/mpeg' />
          <source src='./sound.ogg' type='audio/ogg' />
          <embed hidden='true' autostart='false' loop='false' src='./sound.mp3' />
        </audio> */}
      </div>
    );
  }
}
