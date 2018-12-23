import React from 'react';

export default class MenuContainer extends React.Component {
  handleInvite = () => {
    console.log('Invite user');
  }

  render() {
    return (
      <ul className="sidebar navbar-nav float-left channels-list">
        <div className="h4 text-light p-2">Channels List</div>
        {this.props.channels ? this.props.channels.map((channel, index) => <li className="channels-item text-light nav-item" key={index}>
          <div className="new-channels">
            <a href={`/channels/${channel.id}`} className="new-channels-link">{channel.channel_record.name}</a><span onClick={this.handleInvite} className="new-invite-link"><i className="fas fa-user-plus fa-sm"></i></span>
          </div>
        </li>) : null}
      </ul>
    );
  }
}
