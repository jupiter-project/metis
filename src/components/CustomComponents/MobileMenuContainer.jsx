import React from 'react';

export default class MobileMenuContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inviteUser: false,
      channels: [],
      channelData: 'channelData',
      invitationAccount: '',
      openInvite: false,
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(aField, event) {
    if (aField === 'invitationAccount') {
      this.setState({ invitationAccount: event.target.value});
    }
  }

  toggleInvite = () => {
    this.setState({openInvite: !this.state.openInvite});
    console.log(this.state.openInvite);
  }

  inviteButton = (event) => {
    event.preventDefault();
    console.log(this.state.channelData);
  }

  render() {
    const { props } = this;
    const { state } = this;
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
                {props.channels ? props.channels.map((channel, index) => <li className="channels-item" key={index}>
                  <span className="d-block-inline text-truncate" style={{ maxWidth: '140px'}}><a className="channels-link" href={`/channels/${channel.id}`}>{channel.channel_record.name}
                  </a></span>
                    {
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
                                    onClick={this.inviteButton.bind(this)}
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
                    }
                  <span className="float-right"><a className="text-light mr-1" onClick={this.toggleInvite}>invite</a>
                    </span>
                </li>) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}