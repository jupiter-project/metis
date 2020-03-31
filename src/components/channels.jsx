
import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';
// import MenuContainer from './CustomComponents/MenuContainer.jsx';
// import MobileMenuContainer from './CustomComponents/MobileMenuContainer.jsx';

// new chat-ui components
import UserSidebar from './CustomComponents/UserSidebar.jsx';
import ChannelHeader from './CustomComponents/ChannelHeader.jsx';
import TypingIndicator from './CustomComponents/TypingIndicator.jsx';
import CreateMessageForm from './CustomComponents/CreateMessageForm.jsx';
import MessageList from './CustomComponents/MessageList.jsx';
import MemberList from './CustomComponents/MemberList.jsx';

class ChannelsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passphrase: '',
      name: '',
      password: '',
      channels: [],
      messages: [],
      loading: true,
      inviteUser: false,
      invitationAccount: '',
      // new state data
      userSidebarOpen: false,
      currentChannel: {},
      currentChannelId: '',
      currentChannelMessages: [],
      tableData: {},
      memberListOpen: window.innerWidth > 1000,
      public_key: '',
      queryScope: 'all',
      firstIndex: 0,
      waitingForData: false,
      monitoring: false,
      submitted: false,
      update_submitted: false,
      transactionIds: [],
      localMessages: [],
      remoteMessages: [],
    };

    this.actions = {
      setUserSidebar: userSidebarOpen => this.setState({ userSidebarOpen }),
      setMemberList: memberListOpen => this.setState({ memberListOpen }),
      setCurrentChannel: (channel) => this.setState({ currentChannel: channel.channel_record, currentChannelId: channel.id }, () => this.loadMessages(channel)),
    }

    this.handleChange = this.handleChange.bind(this);
    this.createRecord = this.createRecord.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate() {
    console.log('currentChannel: ', this.state.currentChannel);
    console.log('currentChannelId: ', this.state.currentChannelId);
    console.log('currentChannelMessages: ', this.state.currentChannelMessages);
  }

  setTransactionIds(messages) {
    const transactionIds = [];
    for (let x = 0; x < messages.length; x += 1) {
      const thisMessage = messages[x];
      if (thisMessage && thisMessage.fullRecord) {
        transactionIds.push(thisMessage.fullRecord.transaction);
      }
    }

    this.setState({
      transactionIds,
    });
  }

  loadMessages(channel) {
    const page = this;
    const { props, state } = this;

    this.setState({
      waitingForData: true,
    });

    const currentData = JSON.stringify(state.messages);

    const config = {
      headers: {
        user_api_key: props.user.record.api_key,
        user_public_key: props.public_key,
        accessdata: props.accessData,
        channelaccess: channel.channel_record.passphrase,
        channeladdress: channel.channel_record.account,
        channelkey: channel.channel_record.password,
        channelpublic: channel.channel_record.publicKey,
        // channelaccess: state.currentChannel.passphrase,
        // channeladdress: state.currentChannel.account,
        // channelkey: state.currentChannel.password,
        // channelpublic: state.currentChannel.publicKey,
      },
    };

    const index = state.queryScope === 'unconfirmed' ? 0 : state.firstIndex;

    axios.get(`/data/messages/${state.queryScope}/${index}`, config)
      .then((response) => {
        if (response.data.success) {
          if (page.state.queryScope === 'all') {
            const responseData = JSON.stringify(response.data.messages);

            if (currentData !== responseData && response.data.messages) {
              page.setTransactionIds(response.data.messages);
              page.setState({
                messages: response.data.messages,
                currentChannelMessages: response.data.messages,
                queryScope: 'unconfirmed',
                loading: false,
              });
            }
          } else if (page.state.queryScope === 'unconfirmed') {
            const newMessages = response.data.messages;
            if (newMessages.length > 0) {
              page.handleNewData(response.data.messages);
            }
          }
          page.setState({
            waitingForData: false,
            loading: false,
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
            loading: false,
          });
          toastr.error('No record history');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      })
  }

  loadData() {
    const page = this;
    const { props, state } = this;
    const config = {
      headers: {
        user_api_key: this.props.user.record.api_key,
        user_public_key: this.props.public_key,
        accessData: this.props.accessData,
      },
    };

    axios.get(`/api/users/${props.user.id}/channels`, config)
      .then((response) => {
        if (response.data.success) {
          page.setState({
            channels: response.data.channels,
            loading: false,
          });
          page.monitorData();
        } else {
          page.setState({
            loading: false,
          })
          toastr.error('No record table in database.');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
      // page.loadMessages();
  }

  checkUpdates() {
    const { state } = this;
    if (!state.waitingForData) {
      // this.loadMessages();
    }
  }

  resetRecords(newData) {
    this.setState({
      channels: newData,
    });
  }

  handleNewData(messages) {
    const { state } = this;
    const ids = state.transactionIds;
    const currentMessages = state.messages;
    const currentChannelMessages = state.currentChannelMessages;
    for (let x = 0; x < messages.length; x += 1) {
      const thisMessage = message[x];

      if (!ids.includes(thisMessage.fullRecord.transaction)) {
        currentMessages.push(thisMessage);
        currentChannelMessages.push(thisMessage);
        ids.push(thisMessage.fullRecord.transaction);
      }
    }

    this.setState({
      transactionIds: ids,
      messages: currentMessages,
      currentChannelMessages: currentMessages,
    });
  }

  monitorData() {
    const self = this;

    setInterval(() => {
      if (!(self.state.submitted || self.state.update_submitted)) {
        self.checkUpdates();
      }
    }, 1500);
  }

  handleChange(aField, event) {
    if (aField === 'passphrase') {
      this.setState({ passphrase: event.target.value });
    } else if (aField === 'name') {
      this.setState({ name: event.target.value });
    } else if (aField === 'password') {
      this.setState({ password: event.target.value });
    } else if (aField === 'invitationAccount') {
      this.setState({ invitationAccount: event.target.value});
    }
  }

  createRecord(event) {
    event.preventDefault();
    this.setState({
      submitted: true,
    });

    const page = this;

    const record = {
      passphrase: this.state.passphrase,
      name: this.state.name,
      password: this.state.password,
      address: this.props.user.record.account,
      date_confirmed: Date.now(),
      user_id: this.props.user.id,
      user_api_key: this.props.user.record.api_key,
      public_key: this.props.public_key,
      user_address: this.props.user.record.account,
    };

    axios.post('/api/channels', { data: record, user: this.props.accessData })
      .then((response) => {
        if (response.data.success) {
          page.setState({
            passphrase: '',
            name: '',
            password: '',
            submitted: false,
          });
        } else {
          // console.log(response.data);
          toastr.error(response.data.message);
          response.data.validations.messages.map((message) => {
            toastr.error(message);
            return null;
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  inviteUser(event, channel) {
    event.preventDefault();
    const { state } = this;
    const page = this;
    const invite = {
      recipient: state.invitationAccount,
      channel: channel,
    };

    axios.post('/channels/invite', { data: invite })
      .then((response) => {
        // console.log(response);
        if (response.data.success) {
          page.setState({
            update_submitted: false,
          });

          toastr.success('Invite sent!');
        } else {
          toastr.error('There was an error in sending your invite.')
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  inviteButton = (channel) => {
    const channelData = channel;
    this.setState({ channelData });

    (
      <a className="text-light mr-1">
        invite {channel.id}
      </a>
    )
  }

  handleInvite = () => {
    this.setState({inviteUser: true});
  }

  handleInviteClose = () => {
    this.setState({inviteUser: false});
  }

  handleInviteSave = () => {
    console.log('invite saved');
    // channelData should grab the current channel selected.
    // const channelData = this.state.channels[channel]
    // this.setState({ channelData });
    console.log(channelData);
  }

  render() {
    const { channels, messages, currentChannelMessages, userSidebarOpen, currentChannel, memberListOpen } = this.state;
    const { user, public_key, accessData } = this.props;
    const { state, actions } = this;

    return (
      <div className="main-wrapper">
        <UserSidebar
          user={user}
          channels={channels}
          state={state}
          public_key={public_key}
          accessData={accessData}
          actions={actions}
        />
        <div className="section">
          <ChannelHeader
            user={user}
            channelData={currentChannel}
            state={state}
            actions={actions}
          />
          <div className="custom-row">
            <div className="custom-col">
              <MessageList
                state={state}
                messages={currentChannelMessages}
                loading={this.state.loading}
              />
              <TypingIndicator />
              <CreateMessageForm />
            </div>
            {memberListOpen && (
                <MemberList user={user} />
              )}
          </div>
        </div>
        {/* <MetisNotification
          user={this.props.user}
        /> */}
        {/* <MenuContainer channels={state.channels} /> */}
        {/* {state.loading ? loading : content} */}
        {/* <MobileMenuContainer channels={state.channels} /> */}
      </div>
    );
  }
}

const ChannelsExport = () => {
  if (document.getElementById('ChannelsComponent') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <ChannelsComponent
      user={props.user}
      validation={props.validation}
      public_key={props.public_key}
      accessData = {props.accessData}
      />,
      document.getElementById('ChannelsComponent'),
    );
  }
};

module.exports = ChannelsExport();