import React from 'react';

export default class UserHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      alias: '',
      account: '',
    }
  }

  componentDidMount() {
    this.getUserDetails();
  }

  getUserDetails() {
    const { props } = this;

    if (props.user) {
      this.setState({
        alias: props.user.record.alias,
        account: props.user.record.account,
      });
    }
  }

  render() {
    const { alias, account } = this.state;

    return (
      <header className="user-header">
        <img src="/img/logo-dark.png" alt="user-img" />
        <div>
          <h3>{alias}</h3>
          <h5>{account}</h5>
        </div>
      </header>
    );
  }
}
