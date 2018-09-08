import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

// place where you'd like in your app

class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      new_jup_account: false,
      jup_account_created: false,
      jup_account: '',
      jup_passphrase: '',
      firstname: '',
      lastname: '',
      email: '',
      enable_two_fa: false,
      generated_passphrase: '',
      passphrase_confirmation: '',
      passphrase_confirmation_page: false,
      passphrase_confirmed: false,
      confirmation_message: '',
      account_object: '',
      public_key: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.registerAccount = this.registerAccount.bind(this);
    this.update2FA = this.update2FA.bind(this);
    this.testConnection = this.testConnection.bind(this);
    this.generatePassphrase = this.generatePassphrase.bind(this);
  }

  componentDidMount() {
    /* if (this.props.messages != null && this.props.messages.signupMessage != null){
            this.props.messages.signupMessage.map(function(message){
                toastr.error(message);
            });
        } */
  }

  testConnection(event) {
    event.preventDefault();
    axios.post('/test_connection', {})
      .then((response) => {
        if (response.data.success) {
          console.log('Success');
          console.log(response.data.response);
        } else {
          console.log('Error');
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  confirmedPassphrase(event) {
    event.preventDefault();

    this.setState({
      passphrase_confirmation_page: true,
    });
  }

  generatePassphrase(event) {
    event.preventDefault();
    const page = this;

    axios
      .get('/create_passphrase')
      .then((response) => {
        if (response.data.success === true) {
          console.log(response.data.message);
          page.setState({
            jup_account_created: true,
            generated_passphrase: response.data.result,
          });
          toastr.success('Passphrase generated!');
        } else {
          toastr.error('There was an error in your passphrase');
        }
      })
      .catch((error) => {
        toastr.error('There was an error in generating passphrase');
        console.log(error);
      });
  }

  confirmPassphrase(event) {
    event.preventDefault();
    const page = this;

    if (
      this.state.generated_passphrase !== this.state.passphrase_confirmation
    ) {
      /* this.setState({
                confirmation_message: 'The passphrase you entered is not correct!'
            }); */
      toastr.error('The passphrase you entered is not correct!');
    } else {
      axios
        .post('/create_jupiter_account', {
          account_data: {
            passphrase: this.state.generated_passphrase,
            email: this.state.email,
            firstname: this.state.firstname,
            lastname: this.state.lastname,
            twofa_enabled: this.state.twofa_enabled,
          },
        })
        .then((response) => {
          if (response.data.success === true) {
            console.log(response.data);
            page.setState({
              account_object: response.data.account,
              public_key: response.data.account.public_key,
              confirmation_message: ` ${response.data.account.account} `,
            });
          } else {
            toastr.error(response.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
          toastr.error('There was an error!');
        });
      this.setState({
        confirmation_message: 'Loading...',
        passphrase_confirmed: true,
      });
    }
  }

  handleChange(iType, event) {
    if (iType === 'account') {
      this.setState({
        jup_account: event.target.value,
      });
    } else if (iType === 'pass') {
      this.setState({
        jup_passphrase: event.target.value,
      });
    } else if (iType === 'firstname') {
      this.setState({
        firstname: event.target.value,
      });
    } else if (iType === 'lastname') {
      this.setState({
        lastname: event.target.value,
      });
    } else if (iType === 'email') {
      this.setState({
        email: event.target.value,
      });
    } else if (iType === 'passphrase_confirm') {
      this.setState({
        passphrase_confirmation: event.target.value,
      });
    }
  }

  registerAccount(event) {
    event.preventDefault();

    const page = this;

    axios
      .post('/create_account', {
        account_data: {
          passphrase: this.state.generated_passphrase,
          email: this.state.email,
          twofa_enabled: this.state.enable_two_fa,
          firstname: this.state.firstname,
          lastname: this.state.lastname,
        },
      })
      .then((response) => {
        console.log(response.data);
        if (response.data.success) {
          console.log(response.data);
        } else {
          console.log('There was an error creating your account');
          page.setState({
            confirmation_message: response.data.message,
          });
        }
      })
      .catch((error) => {
        console.log('There was an error!');
        console.log(error);
      });
  }

  update2FA(iType, event) {
    event.preventDefault();
    if (iType === 'true') {
      this.setState({
        enable_two_fa: true,
      });
    } else {
      this.setState({
        enable_two_fa: false,
      });
    }
  }

  render() {
    const newAccountSummary = (
      <form action="/signup" method="post" className="text-left">
        <div className="col-8 mx-auto alert alert-primary text-center">
          <span>Passphrase confirmed for account</span>
          <br />
          {this.state.confirmation_message}
        </div>
        <div className="text-left">
          <div className="form-group">
            <label className="mb-0">First name</label>
            <input
              value={this.state.firstname}
              name="firstname"
              className="form-control"
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="mb-0">Last name</label>
            <input
              value={this.state.lastname}
              name="lastname"
              className="form-control"
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="mb-0">Email</label>
            <input
              value={this.state.email}
              name="email"
              className="form-control"
              readOnly
            />
          </div>

          <div className="">
            <div>
              <input
                type="hidden"
                name="account"
                value={this.state.account_object.account}
              />
              <input
                type="hidden"
                name="accounthash"
                value={this.state.account_object.account}
              />
              <input
                type="hidden"
                name="twofa_enabled"
                value={this.state.enable_two_fa}
              />
              <input
                type="hidden"
                name="public_key"
                value={this.state.public_key}
              />
              <input
                type="hidden"
                name="key"
                value={this.state.generated_passphrase}
              />
              <input
                type="hidden"
                name="jup_account_id"
                value={this.state.account_object.jup_account_id}
              />
            </div>

            <div className="form-group">
              <lable>
                Enable Two-factor Authentication{' '}
                {this.state.enable_two_fa ? (
                  <p className="m-0">Yes</p>
                ) : (
                  <p className="m-0">No</p>
                )}
              </lable>
            </div>
          </div>

          <div>
            {this.state.account !== ' ' && (
              <button
                value="Complete registration"
                className="btn btn-primary btn-block"
              >
                Complete Registration
              </button>
            )}
          </div>
        </div>
      </form>
    );

    const generatedAccount = (
      <div>
        <h6 className="text-center">Your Account Passphrase</h6>
        <div className="col-8 mx-auto alert alert-primary text-center">
          <span>{this.state.generated_passphrase}</span>
        </div>
        <div className="form-group">
          <label htmlFor="firstname">First Name</label>
          <input
            type="text"
            value={this.state.firstname}
            name="firstname"
            className="form-control"
            onChange={this.handleChange.bind(this, 'firstname')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="inputLastName">Last Name</label>
          <input
            type="text"
            name="inputLastName"
            value={this.state.lastname}
            onChange={this.handleChange.bind(this, 'lastname')}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="text"
            name="email"
            value={this.state.email}
            onChange={this.handleChange.bind(this, 'email')}
            className="form-control"
          />
        </div>
        <div className="form-group text-center">
          <h6>Would you like to enable Two-factor Authentication?</h6>

          <div className="custom-control custom-radio">
            <input
              type="radio"
              id="customRadio1"
              name="customRadio"
              className="custom-control-input"
              selected={this.state.enable_two_fa}
              onChange={this.update2FA.bind(this, 'true')}
            />
            <label className="custom-control-label" htmlFor="customRadio1">
              <p className="mb-0">Yes</p>
            </label>
          </div>
          <div className="custom-control custom-radio">
            <input
              type="radio"
              id="customRadio2"
              name="customRadio"
              className="custom-control-input"
              selected={!this.state.enable_two_fa}
              onChange={this.update2FA.bind(this, 'no')}
            />
            <label className="custom-control-label" htmlFor="customRadio2">
              <p className="mb-0">No</p>
            </label>
          </div>
        </div>
        {this.state.jup_account_created === true ? (
          <div className="form-group">
            <button
              disabled={
                !this.state.firstname
                || !this.state.lastname
                || !this.state.email
              }
              className="btn btn-primary btn-block"
              onClick={this.confirmedPassphrase.bind(this)}
            >
              Submit
            </button>
          </div>
        ) : (
          <div className="form-group">
            <button
              disabled={
                !this.state.firstname
                || !this.state.lastname
                || !this.state.email
              }
              className="btn btn-primary btn-block"
              onClick={this.registerAccount.bind(this)}
            >
              Continue
            </button>
          </div>
        )}
        {this.state.confirmation_message}
      </div>
    );

    const passphraseConfirmationPage = (
      <div className="jupiter-form-confirmation">
        <div className="form-group">
          <div className="text-center">{this.state.confirmation_message}</div>
        </div>
        <div className="form-group" id="jup-confirm">
          Please enter your passphrase to confirm it.
          <input
            type="text"
            className="form-control"
            value={this.state.passphrase_confirmation}
            onChange={this.handleChange.bind(this, 'passphrase_confirm')}
          />
        </div>
        <div className="form-group">
          <button
            className="btn btn-primary btn-block"
            onClick={this.confirmPassphrase.bind(this)}
          >
            Submit
          </button>
        </div>
      </div>
    );

    const signupForm = (
      <div className="jupiter-form">
        {this.state.jup_account_created === true ? (
          generatedAccount
        ) : (
          <div>
            <div className="form-group">
              <strong>This app is based on blockchain technology.</strong> The
              blockchain <strong>will generate</strong> an account for you with
              a secure passphrase. This <strong>12-word</strong> passphrase
              should be written down <strong>carefully</strong> and kept in a
              safe place. If you lose your passphrase, you will permanently lose
              access to your account, there is no way to recover it.
            </div>
            <div className="form-group">
              By continuing you declare that you have taken notice of and agree
              on the following: the app creator has access to read all
              information stored within the app.
            </div>
            <div className="form-group">
              Click on the button below to start.
            </div>
            <div className="form-group">
              <button
                className="btn btn-primary btn-block"
                onClick={this.generatePassphrase.bind(this)}
              >
                Create Passphrase
              </button>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div>
        {this.state.passphrase_confirmation_page === true
          ? this.state.passphrase_confirmed === true
            ? newAccountSummary
            : passphraseConfirmationPage
          : signupForm}
      </div>
    );
  }
}

const SignupExport = () => {
  if (document.getElementById('signup-form') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <SignupForm messages={props.messages} />,
      document.getElementById('signup-form'),
    );
  }
};

module.exports = SignupExport();
