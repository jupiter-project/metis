import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class SettingsOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      editing_mode: false,
      currency: '',
      api_key: this.props.user.record.api_key
    };
    this.handleChange = this.handleChange.bind(this);
    this.switchMode = this.switchMode.bind(this);
    this.updateApiKey = this.updateApiKey.bind(this);
    this.enableTwoFactor = this.enableTwoFactor.bind(this);
  }

  handleChange(aField, event) {
    if (aField === 'email') {
      this.setState({ email: event.target.value });
    } else if (aField === 'firstname') {
      this.setState({ firstname: event.target.value });
    } else if (aField === 'lastname') {
      this.setState({ lastname: event.target.value });
    } else if (aField === 'currency') {
      this.setState({ currency: event.target.value });
    } else if (aField === 'address') {
      this.setState({ payment_address: event.target.value });
    } else if (aField === 'charity') {
      this.setState({ charity_address: event.target.value });
    } else if (aField === 'donation') {
      this.setState({ donation: event.target.value });
    }
  }

  switchMode(modeType, event) {
    event.preventDefault();
    if (modeType === 'account') {
      this.setState({ account_editing_mode: !this.state.account_editing_mode });
    }
  }

  updateApiKey(event) {
    event.preventDefault();
    console.log('Updating api key');
    const page = this;
    if (
      window.confirm(
        'Creating a new API Key will delete your previous one. Any external apps or services using your previous key will need to be updated. Are you sure you wish to continue?'
      )
    ) {
      axios
        .post('/update_api_key', {
          id: this.props.user.id,
          api_key: this.props.user.record.api_key
        })
        .then(response => {
          if (response.data.success === true) {
            page.setState({
              api_key: response.data.api_key
            });
            toastr.success('API Key updated!');
          } else {
            toastr.error('There was an error with updating your API Key');
            console.log(response.data.error);
          }
        })
        .catch(error => {
          toastr.error('There was an error with updating your API Key');
          console.log(error);
        });
    }
  }

  enableTwoFactor(event) {
    event.preventDefault();

    if (
      window.confirm(
        'Are you sure you want to enable two factor authentication?'
      ) === true
    ) {
      console.log('Start 2fa process');
    } else {
      console.log('2fa setup cancelled');
    }
  }

  render() {
    return (
      <div className="container">
        <div className="page-title">My Settings</div>

        <div className="row">
          <div className="col-10 mx-auto my-3">
            <div className="card">
              <div className="card-header bg-custom-primary text-light">
                <h5>Two-factor authentication</h5>
              </div>
              <div className="card-body text-center">
                {this.props.user.record.twofa_enabled === true &&
                this.props.user.record.twofa_completed === true ? (
                  <div>
                    <p className="alert alert-success">Enabled</p>
                    <form method="POST" action="/update_2fa_settings">
                      <input type="hidden" name="enable_2fa" value="false" />
                      <button className="btn btn-warning mx-auto" type="submit">
                        Disable 2FA
                      </button>
                    </form>
                  </div>
                ) : null}
                {this.props.user.record.twofa_enabled === true &&
                this.props.user.record.twofa_completed === false ? (
                  <p className="alert alert-danger">
                    Started but not completed
                  </p>
                ) : null}
                {this.props.user.record.twofa_enabled === false ? (
                  <div>
                    <p className="alert alert-warning">Not enabled</p>
                    <form method="POST" action="/update_2fa_settings">
                      <input type="hidden" name="enable_2fa" value="true" />
                      <button className="btn btn-warning mx-auto" type="submit">
                        Enable 2FA
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="col-10 mx-auto my-3">
            <div className="card">
              <div className="card-header bg-custom-primary text-light">
                <h5>API Key</h5>
              </div>
              <div className="card-body">
                <p>
                  Use the API key below if you’re using an external application
                  or bot to record info into the blockchain through your
                  account.
                </p>
                <div className="text-center">
                  <p className="alert alert-info auth-hash">
                    {this.state.api_key}
                  </p>
                </div>
                <div className="text-center">
                  <button
                    className="btn btn-success"
                    type="submit"
                    onClick={this.updateApiKey.bind(this)}
                  >
                    Create new API Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const SettingsExport = () => {
  if (document.getElementById('settings-options') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <SettingsOptions
        user={props.user}
        validation={props.validation}
        messages={props.messages}
      />,
      document.getElementById('settings-options')
    );
  }
};

module.exports = SettingsExport();
