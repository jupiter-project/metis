import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jup_passphrase: '',
      response_message: '',
      response_type: '',
      confirmation_page: false,
      account: '',
      accounthash: '',
      public_key: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.logIn = this.logIn.bind(this);
  }

  componentDidMount() {
    /* if (this.props.messages != null && this.props.messages.loginMessage != null){
            this.props.messages.loginMessage.map(function(message){
                toastr.error(message);
            });
        } */
  }

  handleChange(event) {
    this.setState({
      jup_passphrase: event.target.value
    });
  }

  logIn(event) {
    event.preventDefault();
    const page = this;
    // toastr.info('Logging in now!');
    console.log('Authentication submitted!');

    axios
      .post('/get_jupiter_account', {
        jup_passphrase: this.state.jup_passphrase
      })
      .then(response => {
        if (response.data.success === true) {
          page.setState({
            confirmation_page: true,
            account: response.data.account,
            accounthash: response.data.accounthash,
            public_key: response.data.public_key
          });
        } else {
          toastr.error(response.data.message);
        }
      })
      .catch(error => {
        console.log(error);
        toastr.error(
          'There was an error in verifying the passphrase with the blockchain.'
        );
      });
  }

  render() {
    const confirmationPage = (
      <form action="/login" method="post" className="">
        <div className="form-group text-center">
          <p>You are about to login to the account:</p>
          <div className="h4">{this.state.account}</div>
        </div>
        <input type="hidden" name="account" value={this.state.account} />
        <input
          type="hidden"
          name="accounthash"
          value={this.state.accounthash}
        />
        <input type="hidden" name="public_key" value={this.state.public_key} />
        <input type="hidden" name="jupkey" value={this.state.jup_passphrase} />
        <input
          type="hidden"
          name="jup_account_id"
          value={this.state.jup_account_id}
        />

        <div className="form-group">
          <button type="submit" className="btn btn-primary btn-block">
            Continue
          </button>
        </div>
      </form>
    );

    const loginForm = (
      <form>
        <div className="form-group">
          <label htmlFor="inputPassword">Enter your Passphrase</label>
          <input
            type="password"
            id="inputPassword"
            className="form-control"
            required="required"
            value={this.state.jup_passphrase}
            onChange={this.handleChange.bind(this)}
            autoComplete="password"
          />
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={this.logIn.bind(this)}
        >
          Submit
        </button>
      </form>
    );
    return (
      <div>
        {this.state.confirmation_page === true ? confirmationPage : loginForm}
      </div>
    );
  }
}

const LoginExport = () => {
  if (document.getElementById('login-form') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <LoginForm messages={props.messages} server={props.server} />,
      document.getElementById('login-form')
    );
  }
};

module.exports = LoginExport();
