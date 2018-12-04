import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

// place where you'd like in your app

export class SignupForm extends React.Component {
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
      alias: '',
      enable_two_fa: false,
      generated_passphrase: '',
      passphrase_confirmation: '',
      passphrase_confirmation_page: false,
      passphrase_confirmed: false,
      confirmation_message: '',
      account_object: '',
      public_key: '',
      encryption_password: '',
      encryption_password_confirmation: '',
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
      || this.state.encryption_password !== this.state.encryption_password_confirmation
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
            alias: this.state.alias,
            firstname: this.state.firstname,
            lastname: this.state.lastname,
            twofa_enabled: this.state.twofa_enabled,
            encryption_password: this.state.encryption_password,
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
    } else if (iType === 'alias') {
      this.setState({
        alias: event.target.value,
      });
    } else if (iType === 'passphrase_confirm') {
      this.setState({
        passphrase_confirmation: event.target.value,
      });
    } else if (iType === 'encryption_password' || iType === 'encryption_password_confirmation') {
      this.setState({
        [iType]: event.target.value,
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
          alias: this.state.alias,
          twofa_enabled: this.state.enable_two_fa,
          firstname: this.state.firstname,
          lastname: this.state.lastname,
          encryption_password: this.state.encryption_password,
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
          <span>Passphrase confirmed. Your account ID is:</span>
          <br />
          {this.state.confirmation_message}
        </div>
        <div className="text-left">
          <div className="form-group">
            <label htmlFor="alias">Alias</label>
            <input
              type="text"
              value={this.state.alias}
              name="alias"
              className="form-control"
              readOnly
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstname">First Name</label>
            <input
              type="text"
              value={this.state.firstname}
              name="firstname"
              className="form-control"
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              value={this.state.lastname}
              name="lastname"
              className="form-control"
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="text"
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
                defaultValue={this.state.account_object.account}
              />
              <input
                type="hidden"
                name="accounthash"
                defaultValue={this.state.account_object.account}
              />
              <input
                type="hidden"
                name="twofa_enabled"
                defaultValue={this.state.enable_two_fa}
              />
              <input
                type="hidden"
                name="public_key"
                defaultValue={this.state.public_key}
              />
              <input
                type="hidden"
                name="key"
                defaultValue={this.state.generated_passphrase}
              />
              <input
                type="hidden"
                name="jup_account_id"
                defaultValue={this.state.account_object.jup_account_id}
              />
              <input
                type="hidden"
                name="encryption_password"
                defaultValue={this.state.encryption_password}
              />
            </div>

            { /* <div className="form-group">
              <lable>
                Enable Two-Factor Authentication{' '}
                {this.state.enable_two_fa ? (
                  <p className="m-0">Yes</p>
                ) : (
                  <p className="m-0">No</p>
                )}
              </lable>
                </div> */ }
          </div>

          <div className="text-center">
            {this.state.account !== ' ' && (
              this.state.account_object
                ? <button
                id="confirmButton"
                value="Complete registration"
                className="btn btn-custom"
              >
                Complete Registration
              </button>
                : null
            )}
          </div>
        </div>
      </form>
    );

    const generatedAccount = (
      <div>
        <h6 className="text-center">Your Account Passphrase</h6>
        <div className="col-xs-12 col-sm-8 mx-auto alert alert-primary text-center">
          <span>{this.state.generated_passphrase}</span>
        </div>
        <div className="form-group my-4">
          <p>Carefully write down your 12-word passphrase on a piece of paper or
            alternatively, securely save it in an encrypted document.
            The order of the words is important and all are lowercase.</p>
          <p>Never disclose your passphrase!</p>
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
        <div className="form-group">
          <label htmlFor="alias">Alias</label>
          <input
            type="text"
            name="alias"
            value={this.state.alias}
            onChange={this.handleChange.bind(this, 'alias')}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="encryption_password">Encryption Password</label>
          <input
            type="password"
            value={this.state.encryption_password}
            name="encryption_password"
            onChange={this.handleChange.bind(this, 'encryption_password')}
            className="form-control"
          />
        </div>
        { /* <div className="form-group text-center">
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
        </div> */ }
        {this.state.jup_account_created === true ? (
          <div className="form-group text-center">
            <button
              disabled={
                !this.state.firstname
                || !this.state.lastname
                || !this.state.email
                || !this.state.alias
                || !this.state.encryption_password
              }
              className="btn btn-custom"
              onClick={this.confirmedPassphrase.bind(this)}
            >
              Submit
            </button>
          </div>
        ) : (
          <div className="form-group text-center">
            <button
              disabled={
                !this.state.firstname
                || !this.state.lastname
                || !this.state.email
                || !this.state.encryption_password
              }
              className="btn btn-custom"
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
      <form className="jupiter-form-confirmation">
        <div className="form-group">
          <div className="text-center">{this.state.confirmation_message}</div>
        </div>
        <div className="form-group" id="jup-confirm">
          <label htmlFor="confirmPassphrase">Please enter your passphrase and encryption password to verify you wrote them down correctly.</label>
          <input
            type="password"
            name="confirmPassphrase"
            autoComplete="confirm-password"
            className="form-control"
            value={this.state.passphrase_confirmation}
            onChange={this.handleChange.bind(this, 'passphrase_confirm')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Encryption password confirmation</label>
          <input
            type="password"
            value={this.state.encryption_password_confirmation}
            name="encryption_password_confirmation"
            className="form-control"
            onChange={this.handleChange.bind(this, 'encryption_password_confirmation')}
          />
        </div>
        <div className="form-group text-center">
          <button
            className="btn btn-custom"
            onClick={this.confirmPassphrase.bind(this)}
          >
            Verify
          </button>
        </div>
      </form>
    );

    const signupForm = (
      <div className="jupiter-form">
        {this.state.jup_account_created === true ? (
          generatedAccount
        ) : (
          <div>
            <div className="form-group">
              This app is based on blockchain technology. The
              blockchain will generate an account for you with
              a secure passphrase. This 12-word passphrase
              should be written down carefully and kept in a
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
            <div className="form-group text-center">
              <button
                className="btn btn-custom"
                onClick={this.generatePassphrase.bind(this)}
              >
                Generate Passphrase
              </button>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div id="login-container">
        <div className="card card-register mx-auto mt-5">
          <div className="card-header bg-custom text-light h5">
            Account Registration
          </div>
          <div className="card-body">
          {this.state.passphrase_confirmation_page === true
            ? this.state.passphrase_confirmed === true
              ? newAccountSummary
              : passphraseConfirmationPage
            : signupForm}
          </div>
        </div>
        <div className="text-center mt-3 d-block d-lg-none">Or, log in to your account <a href="/login">here.</a></div>
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

export default SignupExport();
