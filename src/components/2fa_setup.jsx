import React from 'react';
import {render} from 'react-dom';


class TwoFAForm extends React.Component {
    constructor(props){
        super(props);
        this.state={
            twofa_enabled: this.props.user.record.twofa_enabled==true ? true : false,
            response_message: '',
            authentication_requested: false,
            two_factor_completed: this.props.user.record.twofa_completed== true ? true: false,
            qrcode_url: '',
            secret_key: this.props.user.record.secret_key,
            verification_code: '',
            verification_response: ''
        }
        this.start2fa= this.start2fa.bind(this);
        this.handleUpdate= this.handleUpdate.bind(this);
        this.verifyCode= this.verifyCode.bind(this);

    }

    handleUpdate(event){
        this.setState({
            verification_code: event.target.value
        });
    }

    verifyCode(event){
        event.preventDefault();
        var axios= require('axios');
        var that= this;

        axios.post('/verify_code_and_save',{
            verification_code: this.state.verification_code,
            id: this.props.user._id
        }).then(function(response){
            console.log(response.data);

            if(response.data.status=='success'){
                window.location.replace('/');
            }else{
                toastr.error(response.data.message);
            }
        }).catch(function(error){
            console.log(error);
        });
    }

    start2fa(event){
        event.preventDefault();

        var axios= require('axios');
        var QRCode= require('qrcode');
        var that= this;

        axios.post('/start2fa',{
            id: this.props.user.record.id
        }).then(function(response){
            if (response.data.status=='error'){
                console.log('There was an error');
            }else if(response.data.status=='success'){
                console.log(response.data);
                QRCode.toDataURL(response.data.secret, function(err,image_data){
                    that.setState({
                        authentication_requested: true,
                        qrcode_url: image_data
                    });
                });
            }

        }).catch(function(error){
            console.log(error);
            that.setState({
                response_message: 'There was an error'
            })
        });



    }

    render(){
        var registration_form=
        <div>
            <div className="panel panel-primary">
              <div className="panel-heading text-center lead">
                Two-factor authentication
              </div>

              <div className="form-group">
                  <div className="">
                    <p>You have indicated you would like to signup for two-factor authentication. If you would like to proceed,
                        please click on the button below.
                    </p>
                    <p>Once you set up two-factor authentication, you will need to provide a
                        verification code everytime you wish to login or perform account actions.
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
        </div>

        var verification_form=
            <div className="row p-2">
                <div className="offset-xs-0 col-xs-12 offset-sm-4 col-sm-4">
                    <input type="text" className="form-control" value={this.state.verification_code} onChange={this.handleUpdate.bind(this)} /><br />
                    <br />
                    <button type="submit" className="btn btn-primary" onClick={this.verifyCode.bind(this)}>Verify code</button>
                    <br />
                    {this.state.response_message}
                </div>
            </div>

        var qrcode_to_scan=
            <div className="text-center">
                <p>Scan the authentication QR-code below with Google Authenticator and enter the received code to complete the two-factor authentication setup.</p>
                <img src={this.state.qrcode_url} className="qr-code-image" />
                <div className="container-fluid text-center">Once you have scanned the barcode, enter the authetization code below to complete the two Factor
                    authentication setup
                    {verification_form}
                </div>
            </div>

        return(
            <div>
                {this.state.secret_key != null && this.state.secret_key != ''  &&this.state.twofa_completed==true?
                    <div>
                        Your already have a secret key on file<br />
                        {verification_form}<br />
                        {this.state.verification_response}
                    </div>:
                    <div>
                        {this.state.authentication_requested==true ? qrcode_to_scan : registration_form}
                    </div>
                }

            </div>
        )
    }
};


var TwofaExport= (element, props) => {
    if (document.getElementById('2fa-setup-area') != null){
        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));
        
        render(<TwoFAForm user={props.user} messages={props.messages}/>, document.getElementById('2fa-setup-area'));
    }
}

module.exports = TwofaExport();
