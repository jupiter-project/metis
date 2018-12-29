import React from 'react';
import axios from 'axios';
import toastr from 'toastr';

class MobileChannelRow extends React.Component {
  constructor(props) {
    super(props);
    const channel = props.parent.props.channels[props.channel];
    const record = channel.channel_record;

    this.state = {
      channelData: props.parent.props.channels[props.channel],
      passphrase: record.passphrase,
      account: record.account,
      name: record.name,
      password: record.password,
      channels: [],
      edit_mode: false,
      confirmed: record.confirmed,
      date: (new Date(channel.date)).toLocaleString(),
      submitted: false,
      invitationAccount: '',
      openInvite: false,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(aField, event) {
    this.setState({
      [aField]: event.target.value,
    });
  }

  inviteUser(event) {
    event.preventDefault();
    const { state } = this;
    const page = this;
    const invite = {
      recipient: state.invitationAccount,
      channel: state.channelData,
    };

    axios.post('/channels/invite', { data: invite })
      .then((response) => {
        // console.log(response);
        if (response.data.success) {
          page.props.parent.setState({
            update_submited: false,
          });
          this.setState({
            openInvite: false,
          });

          toastr.success('Invite sent!');
        } else {
          toastr.error('There was an error sending your invite.');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  toggleInvite = () => {
    this.setState({ openInvite: !this.state.openInvite });
  }

  handleChangeRoute = (channelInfo) => {
    const url = channelInfo.id;
    window.location.assign(`/channels/${url}`);
  }

  newHandleInvite = () => {
    console.log('invited');
    console.log(this.state.channelData);
  }

  render() {
    const { props } = this;
    const { state } = this;
    const channelInfo = props.parent.props.channels[props.channel]

    const Row = (
      this.state.openInvite ? (
        <div className="add-user-modal">
          <div className="add-user-modal-content">
            <div className="add-user-modal-header bg-custom text-light">
              <h5 className="modal-title">Invite User</h5>
              <button type="button" className="close text-light" onClick={this.toggleInvite}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="add-user-modal-body">
              <div className="add-user-modal-inputbox">
                <div className="mb-2">
                  To invite another user to this channel,
                  simply input the JUP Address below and
                  click "Invite".
                </div>
                <input
                  className="form-control"
                  value={state.invitationAccount}
                  onChange={this.handleChange.bind(this, 'invitationAccount')}
                />
                <div className="text-right mt-3">
                  <button
                    className="btn btn-custom mr-2"
                    // onClick={this.newHandleInvite}
                    onClick={this.inviteUser.bind(this)}
                    data-dismiss="modal"
                  >
                    invite
                  </button>
                  <button
                    className="btn btn-custom"
                    onClick={this.toggleInvite}
                  >
                    cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null
    );

    return (
      <li className="new-mobile-channels">
        <div
          className="new-mobile-channels-link"
          onClick={() => this.handleChangeRoute(channelInfo)}
        >
          <span
            className="d-inline-block text-truncate"
            style={{ maxWidth: '140px' }}
          >
            {channelInfo.channel_record.name}
          </span>
        </div>
        <a
          className="new-mobile-channels-invite"
          onClick={this.toggleInvite}
        >
          <i className="fas fa-xs fa-user-plus"></i>
          {' '}
        </a>
        {Row}
      </li>
    )
  }
}

export default class MobileMenuContainer extends React.Component {
  render() {
    const { props } = this;
    const self = this;
    return (
      <div className="modal fade" id="channelsModal" tabIndex="-1" role="dialog" aria-labelledby="channelsModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content border-none">
            <div className="modal-header bg-custom text-light">
              <h5 className="modal-title" id="channelsModalLabel">Channels</h5>
              <button type="button" className="close text-light" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <ul className="mobile-channels-list list-unstyled mb-0">
                {props.channels ? props.channels.map((channel, index) => (
                  <MobileChannelRow
                    parent={self}
                    channel={index}
                    user={props.user}
                    public_key={props.public_key}
                    key={`row${channel.id}`}
                  />
                )) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}