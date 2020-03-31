import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

// place where you'd like in your app

export class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jup_account_created: false,
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
      aliasIsAvailable: false,
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


  async aliasCheckup() {
    const { state } = this;
    const aliasCheckup = await axios.get(`/jupiter/alias/${state.alias}`);

    return aliasCheckup.data;
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
      page.state.generated_passphrase !== page.state.passphrase_confirmation
      || page.state.encryption_password !== page.state.encryption_password_confirmation
    ) {
      /* this.setState({
                confirmation_message: 'The passphrase you entered is not correct!'
            }); */
      toastr.error('The passphrase you entered is not correct!');
    } else {
      axios
        .post('/create_jupiter_account', {
          account_data: {
            passphrase: page.state.generated_passphrase,
            email: page.state.email,
            alias: page.state.alias,
            firstname: page.state.alias,
            lastname: '',
            twofa_enabled: page.state.twofa_enabled,
            encryption_password: page.state.encryption_password,
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
    if (iType === 'alias') {
      const self = this;
      this.setState({
        alias: event.target.value,
      }, async () => {
        const aliasCheckup = await self.aliasCheckup();
        const aliasIsAvailable = aliasCheckup.available || false;

        self.setState({
          aliasIsAvailable,
        });
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
          passphrase: page.state.generated_passphrase,
          email: page.state.email,
          alias: page.state.alias,
          twofa_enabled: page.state.enable_two_fa,
          firstname: page.state.firstname,
          lastname: page.state.lastname,
          encryption_password: page.state.encryption_password,
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
    const { state } = this;
    const newAccountSummary = (
      <form action="/signup" method="post" className="text-left">
        <div className="col-8 mx-auto alert alert-primary text-center">
          <span>Passphrase and encryption password confirmed. Your Account ID is:</span>
          <br />
          {state.confirmation_message}
        </div>
        <div className="text-left">
          <div className="form-group">
            <label htmlFor="alias">
              Alias
              <input
                type="text"
                name="alias"
                value={state.alias}
                className="form-control"
                readOnly
              />
            </label>
          </div>

          <div className="">
            <div>
              <input
                type="hidden"
                name="account"
                defaultValue={state.account_object.account}
              />
              <input
                type="hidden"
                name="accounthash"
                defaultValue={state.account_object.account}
              />
              <input
                type="hidden"
                name="twofa_enabled"
                defaultValue={state.enable_two_fa}
              />
              <input
                type="hidden"
                name="public_key"
                defaultValue={state.public_key}
              />
              <input
                type="hidden"
                name="key"
                defaultValue={state.generated_passphrase}
              />
              <input
                type="hidden"
                name="jup_account_id"
                defaultValue={state.account_object.jup_account_id}
              />
              <input
                type="hidden"
                name="encryption_password"
                defaultValue={state.encryption_password}
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
            {state.account !== ' ' && (
              state.account_object
                ? (
                  <button
                    type="button"
                    id="confirmButton"
                    value="Complete registration"
                    className="btn btn-custom"
                  >
                    Complete Registration
                  </button>
                ) : null
            )}
          </div>
        </div>
      </form>
    );

    const generatedAccount = (
      <div>
        <h6 className="text-center">Your Account Passphrase</h6>
        <div className="col-xs-12 col-sm-8 mx-auto alert alert-primary text-center">
          <span>{state.generated_passphrase}</span>
        </div>
        <div className="form-group my-4">
          <p className="text-justify">
            Carefully write down your 12-word passphrase as well as
            your encryption password (see below) on a piece of paper or
            alternatively, securely save it in an encrypted document.
            The order of the words of the passphrase is important and all are lowercase.
          </p>
          <p className="text-center">Never disclose your passphrase or encryption password!</p>
        </div>
        <div className="form-group">
          <label htmlFor="alias">
            Alias
            <input
              type="text"
              name="alias"
              value={state.alias}
              onChange={this.handleChange.bind(this, 'alias')}
              className="form-control"
            />
          </label>
          <div className={`alert ${state.aliasIsAvailable ? 'alert-success' : 'alert-danger'}`}>
            <i className={`far ${state.aliasIsAvailable ? 'fa-check-circle' : 'fa-times-circle'}`} />
            <span>{state.aliasIsAvailable ? ' Alias available' : ' Invalid alias'}</span>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="encryption_password">
            Encryption Password
            <input
              type="password"
              name="encryption_password"
              value={state.encryption_password}
              onChange={this.handleChange.bind(this, 'encryption_password')}
              className="form-control"
            />
          </label>
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
        {state.jup_account_created === true ? (
          <div className="form-group text-center">
            <button
              type="button"
              disabled={
                !state.alias
                || !state.aliasIsAvailable
                || !state.encryption_password
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
              type="button"
              disabled={
                !state.alias
                || !state.aliasIsAvailable
                || !state.encryption_password
              }
              className="btn btn-custom"
              onClick={this.registerAccount.bind(this)}
            >
              Continue
            </button>
          </div>
        )}
        {state.confirmation_message}
      </div>
    );

    const passphraseConfirmationPage = (
      <form className="jupiter-form-confirmation">
        <div className="form-group">
          <div className="text-center">{state.confirmation_message}</div>
        </div>
        <div className="form-group">
          <p className="text-justify">Please enter your passphrase and encryption password to verify you wrote them down correctly.</p>
        </div>
        <div className="form-group" id="jup-confirm">
          <label htmlFor="confirmPassphrase">
            Passphrase
            <input
              type="password"
              name="confirmPassphrase"
              className="form-control"
              value={state.passphrase_confirmation}
              onChange={this.handleChange.bind(this, 'passphrase_confirm')}
            />
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="encryption_password_confirmation">
            Encryption Password
            <input
              type="password"
              value={state.encryption_password_confirmation}
              name="encryption_password_confirmation"
              className="form-control"
              onChange={this.handleChange.bind(this, 'encryption_password_confirmation')}
            />
          </label>
        </div>
        <div className="form-group text-center">
          <button
            type="button"
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
        {state.jup_account_created === true ? (
          generatedAccount
        ) : (
          <div>
            <div className="form-group text-justify">
              This app is based on blockchain technology. The
              blockchain will generate an account for you with
              a secure passphrase. This 12-word passphrase
              should be written down carefully and kept in a
              safe place. If you lose your passphrase, you will permanently lose
              access to your account, there is no way to recover it.
            </div>
            <div className="form-group text-justify">
              Proceed with CAUTION! This is a test release. You may lose data. 
              Encryption of data doesn’t prevent copy and paste or screen shots of the 
              conversation. The Jupiter Project or Sigwo Technologies LLC are 
              not responsible for any loss of data. Use at your own risk.
            </div>
            <div className="form-group text-center">
              Click on the button below to start.
            </div>
            <div className="form-group text-center">
              <button
                type="button"
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

    console.log(this.state);

    return (
      <div>
        <div className="card card-register mx-auto mt-5">
          <div className="card-header bg-custom text-light h5">
            Account Registration
          </div>
          <div className="card-body">
            {state.passphrase_confirmation_page === true
              ? state.passphrase_confirmed === true
                ? newAccountSummary
                : passphraseConfirmationPage
              : signupForm}
          </div>
        </div>
        <div className="d-block d-lg-none text-center mt-3">
          Log into your account
          <a href="/login">here</a>
          .
        </div>
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
