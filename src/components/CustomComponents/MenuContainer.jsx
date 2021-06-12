import { Component } from 'react';
import axios from 'axios';
import toastr from 'toastr';

class ChannelRow extends Component {
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
          if (response.data.message) {
            toastr.error(response.data.message);
          }
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  handleChannelRoute = (channelInfo) => {
    const url = channelInfo.id;
    window.location.assign(`/channels/${url}`);
  }

  render() {
    const { props } = this;
    const { state } = this;
    const channelInfo = props.parent.props.channels[props.channel];
    const rand = require("crypto").createHash('md5').update(this.state.channelData.id).digest("hex")
    const identicon = "https://www.gravatar.com/avatar/"+rand+"?s=64&d=identicon"

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
                Invite to This Channel
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
                To invite another user to this channel, simply enter his/her alias or JUP ID and click on "Invite".
              </p>
              <div className="form-group">
                <input className="form-control" value={state.invitationAccount} onChange={this.handleChange.bind(this, 'invitationAccount')} />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-custom"
                onClick={this.inviteUser.bind(this)}
                data-dismiss="modal"
              >
                Invite
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                data-dismiss="modal"
              >
                Cancel
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
      <div style={{ position: 'inherit', cursor: 'pointer' }}>
        <li className="new-channels">
          <div
            className="new-channels-link"
            onClick={() => this.handleChannelRoute(channelInfo)}
          >
            <span
              className="d-inline-block text-truncate"
              style={{ maxWidth: '140px'}}
            >
              <img src={ identicon } height="20px" alt="logo" /> {channelInfo.channel_record.name}
            </span>
          </div>
          <a
            className="new-channels-invite"
            href="#"
            data-toggle="modal"
            data-target={`#channelInvite${channelInfo.id}`}
          >
            <i className="fas fa-xs fa-user-plus"></i>
            {' '}
          </a>
          {inviteComponent}
        </li>
      </div>
    );
  }
}

export default class MenuContainer extends Component {
  render() {
    const { props } = this;
    const self = this;
    return (
      <ul className="sidebar navbar-nav float-left channels-list" style={{ position: 'inherit' }}>
        <div className="h4 text-light p-2">Chats</div>
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
