import React from 'react';

export default class MessageList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: this.props.user,
    }
  }

  NewdisplayMessages = () => {
    if (this.props.messages[0]) {
      return this.props.messages.map((message, index) => <li key={index}>
      <img src="/img/logo-dark.png" alt="user-img" />
      <div className="message-list_div">
        <span>{message.data.name} | {message.data.date}</span>
        <p>{message.data.message}</p>
      </div>
    </li>)
    } else {
      return 'nothing'
    }
  }

  render() {

    const displayMessages = (
      this.props.messages.map((message, index) => <li key={index}>
        <img src="/img/logo-dark.png" alt="user-img" />
        <div className="message-list_div">
          <span>{message.data.name} | {message.data.date}</span>
          <p>{message.data.message}</p>
        </div>
      </li>)
    );

    const loading = <li>loading...</li>;
    const message = this.NewdisplayMessages();

    return (
      <ul id="messages" className="message-list">
        <div className="message-list_wrapper">
          {this.props.messages[0] ? displayMessages : loading}
        </div>
      </ul>
    );
  }
}
