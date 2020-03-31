import React from 'react';
import axios from 'axios';
import toastr from 'toastr';

export default class ChannelList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      update_submitted: false,
      invitationAccount: '',
    }

    this.actions = {
      setCurrentChannel: this.props.actions.setCurrentChannel,
    }
  }

  inviteUser(event, channel) {
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
      event.preventDefault();
  }

  handleChannelRoute = (channel) => {
    const id = channel.id;
    window.location.assign(`/channels/${id}`);
  }

  render() {
    return (
      <ul className="channel-list">
      {this.props.channels.map((channel, index) => <li key={index} onClick={() => this.actions.setCurrentChannel(channel)}>
      <img src="/img/logo-dark.png" alt="channel-img" />
          <div className="custom-col">
            <p>{channel.channel_record.name}</p>
            {/* <span>id: {channel.id}</span> */}
          </div>
          <label onClick={() => console.log(channel)}><i className="fas fa-user-plus fa-sm"></i></label>
          <div>
            <div>
            </div>
          </div>
        </li>
      )}
      </ul>
    );
  }
}