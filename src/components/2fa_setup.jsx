import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';
import QRCode from 'qrcode';


class TwoFAForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      twofa_enabled: this.props.user.record.twofa_enabled || false,
      response_message: '',
      authentication_requested: false,
      two_factor_completed: this.props.user.record.twofa_completed || false,
      qrcode_url: '',
      secret_key: this.props.user.record.secret_key,
      verification_code: '',
      verification_response: '',
    };

    this.start2fa = this.start2fa.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
  }

  handleUpdate(event) {
    this.setState({
      verification_code: event.target.value,
    });
  }

  verifyCode(event) {
    event.preventDefault();

    axios.post('/verify_code_and_save', {
      verification_code: this.state.verification_code,
      id: this.props.user.id,
    }).then((response) => {
      if (response.data.status === 'success') {
        window.location.replace('/');
      } else {
        toastr.error(response.data.message);
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  start2fa(event) {
    event.preventDefault();
    const self = this;

    axios.post('/start2fa', {
      id: this.props.user.record.id,
    }).then((response) => {
      if (response.data.status === 'error') {
        console.log('There was an error');
      } else if (response.data.status === 'success') {
        console.log(response.data);
        QRCode.toDataURL(response.data.secret, (err, imageData) => {
          if (err) {
            toastr.error('Error retrieving QR code');
          }
          self.setState({
            authentication_requested: true,
            qrcode_url: imageData,
          });
        });
      }
    }).catch((error) => {
      console.log(error);
      self.setState({
        response_message: 'There was an error',
      });
    });
  }

  render() {
    const registrationForm = (
        <form>
            <div className="panel panel-primary">
              <div className="form-group">
                  <div className="">
                    <p>You have indicated you would like to add an extra layer of security
                        to your account via two-factor authentication. If you would like to proceed,
                        please click on the button below.
                    </p>
                    <p>
                        Once you have enabled two-factor authentication,
                        you will need to provide a verification code every time you wish to login.
                    </p>

                    <br />
                    <button className="btn btn-primary" onClick={this.start2fa.bind(this)}>Enable two-factor authentication</button>
                    <form method="POST" action="/update_2fa_settings">
                        <input type="hidden" name="enable_2fa" value={false} />
                        <br />
                        <button className="btn btn-danger" type="submit">Cancel</button>
                    </form>
                  </div>
              </div>
              </div>
            <br />
            {this.state.response_message}
        </form>
    );

    const verificationForm = (
        <form className="row p-2">
            <div className="offset-xs-0 col-xs-12 offset-sm-4 col-sm-4">
                <input type="text" className="form-control" value={this.state.verification_code} onChange={this.handleUpdate.bind(this)} /><br />
                <br />
                <button type="submit" className="btn btn-primary" onClick={this.verifyCode.bind(this)}>Verify code</button>
                <br />
                {this.state.response_message}
            </div>
        </form>
    );

    const qrcodeToScan = (
        <div className="text-center">
            <p>Scan the QR-code below with Google Authenticator.</p>
            <img src={this.state.qrcode_url} className="qr-code-image" />
            <div className="container-fluid text-center">
                Once you have scanned the QR-code, enter the 6-digit authentication code in the
                field below and click on the “Verify code” button.
                {verificationForm}
            </div>
        </div>
    );

    return (
            <div>
                {this.state.secret_key != null && this.state.secret_key !== '' && this.state.twofa_completed === true
                  ? <div>
                        Your already have a secret key on file<br />
                        {verificationForm}<br />
                        {this.state.verification_response}
                    </div>
                  : <div>
                        {this.state.authentication_requested === true
                          ? qrcodeToScan : registrationForm}
                    </div>
                }

            </div>
    );
  }
}


const TwofaExport = () => {
  if (document.getElementById('2fa-setup-area') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(<TwoFAForm user={props.user} messages={props.messages}/>, document.getElementById('2fa-setup-area'));
  }
};

module.exports = TwofaExport();
