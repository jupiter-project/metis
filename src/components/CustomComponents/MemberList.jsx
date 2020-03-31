import React from 'react';

export default class MemberList extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      userAlias: '',
    }
  }

  componentDidMount() {
    this.getUserAlias();
  }

  getUserAlias = () => {
    let userAlias;

    if (this.props.user) {
      userAlias = this.props.user.record.alias
      this.setState({
        userAlias
      })
    }
  }

  render() {
    const { userAlias } = this.state;

    const displayUserAlias = (
      <li className="online" style={{ order: '-1' }}>
        <img src="/img/logo-dark.png" alt="user-img" />
        <p>{userAlias}</p>
      </li>
    );

    return (
      <ul className="member-list">
        {displayUserAlias}
      </ul>
    );
  }
}
