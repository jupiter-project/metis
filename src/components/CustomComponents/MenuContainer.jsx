import React from 'react';
import axios from 'axios';
import toastr from 'toastr';


class ChannelRow extends React.Component {
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
            update_submitted: false,
          });

          toastr.success('Invite sent!');
        } else {
          toastr.error('There was an error in sending your invite');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  render() {
    const { props } = this;
    const { state } = this;
    const channelInfo = props.parent.props.channels[props.channel];

    const inviteComponent = (
      <div
        className="modal fade"
        id={`channelInvite${channelInfo.id}`}
        role="dialog"
        aria-labelledby={`channelInvite${channelInfo.id}`}
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content" style={{ position: 'fixed', zIndex: 2000, color: 'black' }}>
            <div className="modal-header">
              <h5 className="modal-title" id=" ">
                Invite to this channel
              </h5>
              <button
                className="close"
                type="button"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              {/* Use this form to invite another user to this channel. Please write the
              JUP account you wish to invite below and press on the Invite button. */}
              <p>
                To invite another user to this channel,
                simply input the JUP Address below and click "Invite".
              </p>
              <div className="form-group">
                <input className="form-control" value={state.invitationAccount} onChange={this.handleChange.bind(this, 'invitationAccount')} />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                type="button"
                data-dismiss="modal"
              >
                Cancel
              </button>
              <button className="btn btn-custom" onClick={this.inviteUser.bind(this)} data-dismiss="modal">
                Invite
              </button>
            </div>
          </div>
        </div>
      </div>);

    /* const readOnly = (
      <tr className="text-center" key={`row-${(channelInfo.id)}-data`}>
          <td>
            <a className="btn btn-link" href={`/channels/${state.channelData.id}`}>
              {channelInfo.channel_record.name}
            </a>
          </td>
          <td>{channelInfo.channel_record.account}</td>
          <td>{state.date}</td>
          <td>{state.confirmed
            ? <i className="fas fa-fw fa-check" /> : <i className="fas fa-fw fa-times" />}</td>
          <td>
            <a
                className="btn btn-custom"
                href="#"
                data-toggle="modal"
                data-target="#channelInvite"
              >
                <i className="fas fa-fw fa-user-plus" />
                {' '}
                <span>Invite</span>
              </a>
          </td>
          {inviteComponent}
      </tr>
    ); */

    return (
      <li className="channels-item text-light nav-item" key={props.channel}>
        <div className="new-channels">
          <a href={`/channels/${channelInfo.id}`} className="new-channels-link d-block text-truncate float-left">
            {channelInfo.channel_record.name}
          </a>
          <span onClick={this.handleInvite} className="new-invite-link">
            <a 
                className="float-right"
                href="#"
                data-toggle="modal"
                data-target={`#channelInvite${channelInfo.id}`}
              >
                <i className="fas fa-user-plus fa-sm"></i>
                {' '}
            </a>
          </span>
        </div>
        {inviteComponent}
      </li>
    );
  }
}

export default class MenuContainer extends React.Component {
  render() {
    const { props } = this;
    const self = this;
    return (
      <ul className="sidebar navbar-nav float-left channels-list" style={{ position: 'inherit' }}>
        <div className="h4 text-light p-2">Channels List</div>
        {props.channels ? props.channels.map((channel, index) => (
          <ChannelRow
            parent={self}
            channel={index}
            user={props.user}
            public_key={props.public_key}
            key={`row${(channel.id)}`}
            />
        )) : null}
      </ul>
    );
  }
}
