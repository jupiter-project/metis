import React from 'react';
import UserHeader from './UserHeader.jsx';
import ChannelList from './ChannelList.jsx';
import CreateChannelForm from './CreateChannelForm.jsx';

export default class UserSidebar extends React.Component {
  constructor(props) {
    super(props);

  }
  render() {
    const { user, channels, public_key, accessData } = this.props;

    return (
      <React.Fragment>
        <aside data-open={this.props.state.userSidebarOpen}>
          <UserHeader user={user} />
          <ChannelList
            user={user}
            channels={channels}
            actions={this.props.actions}
            state={this.props.state}
          />
          <CreateChannelForm user={user} test='testing123' public_key={public_key} accessData={accessData} />
        </aside>
      </React.Fragment>
    );
  }
}
