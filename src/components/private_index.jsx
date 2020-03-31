import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';
import MetisNotification from './CustomComponents/MetisNotifications.jsx';
import UserSidebar from './CustomComponents/UserSidebar.jsx';
import ChannelHeader from './CustomComponents/ChannelHeader.jsx';
import MessageList from './CustomComponents/MessageList.jsx';
import TypingIndicator from './CustomComponents/TypingIndicator.jsx';
import CreateMessageForm from './CustomComponents/CreateMessageForm.jsx';
import MemberList from './CustomComponents/MemberList.jsx';

export class ChatUIComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      aliases: [],
      members: [],
      messages: [],
      message: '',
      submitted: false,
      update_submitted: false,
      // user: this.props.user,
      channels: [],
      currentChannel: {},
      tableData: {},
      waitingForData: false,
      monitoring: false,
      queryScope: 'all',
      transactionsIds: [],
      firstIndex: 0,
      loading: true,
      memberListOpen: window.innerWidth > 1000,
      userSidebarOpen: false,
    };

    this.actions = {
      setMemberList: memberListOpen => this.setState({ memberListOpen }),
      setUserSidebar: userSidebarOpen => this.setState({ userSidebarOpen }),
    }
  }

  componentDidMount() {
    this.loadTableData();
  }

  // componentDidUpdate() {
  //   console.log(this.state);
  // }

  setTransactionsIds(messages) {
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

  checkUpdates() {
    const { state } = this;
    if (!state.waitingForData) {
      this.loadData();
    }
  }

  loadData() {
    const page = this;
    const { props } = this;
    const { state } = this;
    this.setState({
      waitingForData: true,
    });

    const currentData = JSON.stringify(state.messages);

    const config = {
      headers: {
        user_api_key: props.user.record.api_key,
        user_public_key: props.public_key,
        accessdata: props.accessData,
        channelaccess: state.tableData.passphrase,
        channeladdress: state.tableData.account,
        channelkey: state.tableData.password,
        channelpublic: state.tableData.publicKey,
      },
    };
    const index = state.queryScope === 'unconfirmed' ? 0 : state.firstIndex;

    axios.get(`/data/messages/${state.queryScope}/${index}`, config)
      .then((response) => {
        // console.log('loadData response');
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
              // page.scrollToBottom();
            }
          } else if (page.state.queryScope === 'unconfirmed') {
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
          // toastr.error('No record history');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  loadTableData() {
    const page = this;
    const { props } = this;
    const config = {
      headers: {
        user_api_key: props.user.record.api_key,
        user_public_key: props.public_key,
        accessData: props.accessData,
      },
    };

    axios.get(`/api/users/${props.user.id}/channels`, config)
      .then((response) => {
        if (response.data.success) {
          // console.log('loadTableData response');
          // console.log(response);
          page.setState({
            channels: response.data.channels,
            currentChannel: response.data.channels[0],
            loading: false,
          });
          page.monitorData();
          console.log('props.channelId', props.channelId)
          for (let x = 0; x < response.data.channels.length; x += 1) {
            const thisChannel = response.data.channels[x];

            if (thisChannel.id === props.channelId) {
              this.setState({
                tableData: thisChannel.channel_record,
              }, () => {
                page.loadData('all');
                page.loadMembersList();
              });
            }
          }
        } else {
          toastr.error('No record history');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  async loadMembersList() {
    const { state } = this;
    const { props } = this;
    const self = this;
    const config = {
      headers: {
        channeladdress: state.tableData.account,
        channelkey: state.tableData.password,
        channelpublic: state.tableData.publicKey,
      },
    };

    let response;

    try {
      response = await axios.get('/data/members', config);
    } catch (e) {
      response = e;
    }

    if (!response.data.error) {
      const { members } = response.data;
      const { aliases } = response.data;
      this.setState({
        members,
        aliases,
      }, async () => {
        const { alias } = props.user.record;
        if (!self.state.members.includes(alias) && !self.state.aliases.includes(alias)) {
          const res = await self.addMember();
          if (res.success) {
            toastr.success("Your alias has been added to this channel's member list");
          } else {
            console.log(res);
          }
        }
      });
    }
    return response.data;
  }

  async addMember() {
    const { state } = this;

    const params = {
      channeladdress: state.tableData.account,
      channelkey: state.tableData.password,
      channelpublic: state.tableData.publicKey,
    };

    let response;

    try {
      response = await axios.post('/data/members', params);
    } catch (e) {
      response = e;
      return e;
    }

    return response.data;
  }

  handleNewData(messages) {
    const { state } = this;
    const ids = state.transactionIds;
    const currentMessages = state.messages;
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

    // this.scrollToBottom();
  }

  monitorData() {
    const self = this;

    setInterval(() => {
      if (!(self.state.submitted || self.state.update_submitted)) {
        self.checkUpdates();
      }
    }, 1500);
  }

  render() {
    const { memberListOpen, channels, currentChannel, userSidebarOpen } = this.state;
    const { user } = this.props;
    const { state, actions } = this;

    return (
      <div className="main-wrapper">
        <UserSidebar
          user={user}
          channels={channels}
          state={state}
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
              <MessageList />
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
      </div>
    );
  }
}



const ChatUIExport = () => {
  if (document.getElementById('chat-ui') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));
    render(
      <ChatUIComponent
        user={props.user}
        messages={props.messages}
        validation={props.validation}
        public_key={props.public_key}
        accessData = {props.accessData}
        channelId={props.channelId}
      />,
      document.getElementById('chat-ui'),
    );
  }
};

export default ChatUIExport();
