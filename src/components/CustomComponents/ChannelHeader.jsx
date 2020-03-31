import React from 'react';

export default class ChannelHeader extends React.Component {
  constructor(props) {
    super(props);

    this.actions = {
      setMemberList: this.props.actions.setMemberList,
      setUserSidebar: this.props.actions.setUserSidebar,
    }
  }

  // displayChannelName = () => {
  //   const { channel_record } = this.props.channelData;
  //   let ChannelName;
  //   if (!channel_record) {
  //     ChannelName = 'loading'
  //   } else {
  //     ChannelName = channel_record.name
  //   }
  //   return ChannelName;
  // };

  render() {
    const { memberListOpen, userSidebarOpen } = this.props.state;

    return (
      <header className="channel-header">
        <button onClick={e => this.actions.setUserSidebar(!userSidebarOpen)}>
          {/* <svg>
            <use xlinkHref="index.svg#menu" />
          </svg> */}
          <i className="fas fa-bars"></i>
        </button>
        {/* <h1>channel</h1> */}
        {/* <h1>{this.displayChannelName()}</h1> */}
        <h1>{this.props.channelData ? this.props.channelData.name : 'Welcome'}</h1>
        <div onClick={e => this.actions.setMemberList(!memberListOpen)}>
          <span>1</span>
          {/* <svg>
            <use xlinkHref="index.svg#members" />
          </svg> */}
          <i className="fas fa-user"></i>
        </div>
      </header>
    );
  }
}