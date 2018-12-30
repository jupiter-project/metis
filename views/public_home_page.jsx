import React from 'react';
import ApplicationLayout from './layout/application.jsx';

class PublicHomePageView extends React.Component {
  render() {
    return (
      <ApplicationLayout data={this.props}>
        <div className="page-title">Welcome to Metis</div>
        <div className="card card-register mx-auto my-5">
          <div className="card-body">
            <p>Metis is a decentralized chat application. Think Telegram or Rocket Chat, but 100% private, decentralized, and fully encrypted GROUP messaging. Every message is encrypted and can ONLY be read by the group participants. The channel creator sends initial invites to Metis users, and next, everyone in the channel can invite other people. Want to add your friends to your favorite group? Let them sign up at</p>
            <h4 className="text-center"><a href="https://metis.sigwo.tech/signup">metis.sigwo.tech</a></h4>
          </div>
        </div>
      </ApplicationLayout>
    );
  }
}

module.exports = PublicHomePageView;
