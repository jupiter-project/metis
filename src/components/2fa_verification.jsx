import React from 'react';
import {render} from 'react-dom';


class TwoFAVerificationForm extends React.Component {
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

        axios.post('/verify_code',{
            verification_code: this.state.verification_code,
            id: this.props.user._id
        }).then(function(response){
            //console.log(response);
            if(response.data.status=='success'){
                window.location.replace('/');
            }else{
                toastr.error(response.data.message);
            }

        }).catch(function(error){
            console.log(error);
            toastr.error('There was an error');
        });
    }


    render(){

        var verification_form=
            <form>
                <div className="row r-2">
                    <div className="offset-xs-0 col-xs-12 offset-sm-4 col-sm-4">
                        <input type="text" className="form-control" value={this.state.verification_code} onChange={this.handleUpdate.bind(this)} /><br />
                        <br />
                        <button type="submit" className="btn btn-primary" onClick={this.verifyCode.bind(this)}>Verify code</button>
                    </div>
                </div>
            </form>


        return(
            <div>
                {verification_form}
            </div>
        )
    }
};


var TwofaVerificationExport= () => {
    if(document.getElementById('2fa-verification-area') !=null){
        
        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));

        render(<TwoFAVerificationForm user={props.user} messages={props.messages} />, document.getElementById('2fa-verification-area'));
    }
}

module.exports = TwofaVerificationExport();
