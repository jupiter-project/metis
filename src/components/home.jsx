import React from 'react';
import { render } from 'react-dom';

// custom component imports
import Title from './CustomComponents/Title.jsx';
import MessageList from './CustomComponents/MessageList.jsx';
import SendMessageForm from './CustomComponents/SendMessageForm.jsx';

class HomeComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        {/* <div className="page-title">Welcome to Metis</div> */}
        {console.log(this.state.user.record.firstname)}
        <Title />
        <MessageList />
        <SendMessageForm />
      </div>
    );
  }
}

const HomeExport = () => {
  if (document.getElementById('home-dashboard') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));
    render(
      <HomeComponent user={props.user} messages={props.messages} />,
      document.getElementById('home-dashboard'),
    );
  }
};

module.exports = HomeExport();
