import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class TwoFAVerificationForm extends React.Component {
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

    axios.post('/verify_code', {
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
      toastr.error('There was an error');
    });
  }


  render() {
    const verificationForm = (
        <form>
            <div className="row r-2">
                <div className="offset-xs-0 col-xs-12 offset-sm-4 col-sm-4">
                    <p>Please put in your 6-digit authentication code.</p>
                    <input type="text" className="form-control" value={this.state.verification_code} onChange={this.handleUpdate.bind(this)} /><br />
                    <br />
                    <button type="submit" className="btn btn-primary" onClick={this.verifyCode.bind(this)}>Verify code</button>
                </div>
            </div>
        </form>
    );

    return (
        <div>
            {verificationForm}
        </div>
    );
  }
}


const TwofaVerificationExport = () => {
  if (document.getElementById('2fa-verification-area') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(<TwoFAVerificationForm user={props.user} messages={props.messages} />, document.getElementById('2fa-verification-area'));
  }
};

module.exports = TwofaVerificationExport();
