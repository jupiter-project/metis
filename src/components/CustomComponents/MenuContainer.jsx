import React from 'react';

export default class MenuContainer extends React.Component {
  render() {
    return (
      <ul className="sidebar navbar-nav float-left channels-list">
        <div className="h4 text-light p-2">Channels List</div>
        {this.props.channels ? this.props.channels.map((channel, index) => <li className="channels-list-item text-light nav-item" key={index}><a className="nav-link" href={`/channels/${channel.id}`}><span className="d-inline-block text-truncate" style={{ maxWidth: '180px' }}>{channel.channel_record.name}</span></a></li>) : null}
      </ul>
    );
  }
}
