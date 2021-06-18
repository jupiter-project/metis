import { Component } from 'react';
import ApplicationLayout from './layout/application.jsx';
import { gravity } from '../config/gravity.cjs';

class PublicHomePageView extends Component {
  render() {
    return (
      <ApplicationLayout data={this.props}>
        <div className="page-title">Welcome to Metis</div>
        <div className="card card-register mx-auto mt-5">
          <div className="card-body">
            <p className="text-justify">Metis is a decentralized chat application that syncs across all platforms. Think Telegram or
            Rocket Chat, but 100% private, decentralized, and fully encrypted GROUP messaging. Every
            message is encrypted and can ONLY be read by the group participants. The channel creator
            sends initial invites to Metis users, and next, everyone in the channel can invite other
            people. Want to add your friends to your favorite group? Let them sign up at</p><br />
            <h4 className="text-center"><a href="https://metis.gojupiter.tech/signup">metis.gojupiter.tech</a></h4>
            <div className="text-center mt-3">or download the latest release
              <a href="https://github.com/jupiter-project/metis/releases"> here</a>.
            </div>
            <div className="text-center mt-3">
              Returning user? Log in <a href="login">here</a>.
              <div className="text-right">{gravity.version}</div>
            </div>
          </div>
        </div>
      </ApplicationLayout>
    );
  }
}

module.exports = PublicHomePageView;
