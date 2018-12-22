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
      api_key: this.props.user.record.api_key,
    };

    this.update2FA = this.update2FA.bind(this);
    this.enableTwoFactor = this.enableTwoFactor.bind(this);
  }

  enableTwoFactor(event) {
    event.preventDefault();

    if (
      window.confirm('Are you sure you want to update your two factor authentication settings?')
    ) {
      this.update2FA();
    }
  }

  update2FA() {
    const page = this;
    const { state } = this;

    this.setState({
      submitted: true,
    });

    const twofaEnabled = !state.twofa_enabled;

    axios.put('/account', {
      account: {
        twofa_enabled: twofaEnabled,
      },
    })
      .then((response) => {
        if (response.data.success === true) {
          page.setState({
            twofa_enabled: twofaEnabled,
          });
          toastr.success('Account update pushed to the blockchain for approval.');
        } else {
          if (
            response.data.validations != null
            && response.data.validations.messages != null
          ) {
            response.data.validations.messages.map((message) => {
              toastr.error(message);
              return null;
            });
          }
          toastr.error(response.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  render() {
    return (
      <div className="container">
        <div className="page-title">My Settings</div>
        <div className="col-xs-12 col-sm-10 mx-auto mb-3">
          <div className="card card-register mx-auto">
            <div className="card-header bg-custom text-light h5">
              Two-Factor Authentication
            </div>
            <div className="card-body text-center">
              {this.props.user.record.twofa_enabled === true
              && this.props.user.record.twofa_completed === true ? (
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
              {this.props.user.record.twofa_enabled === true
              && this.props.user.record.twofa_completed === false ? (
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
      document.getElementById('settings-options'),
    );
  }
};

module.exports = SettingsExport();
