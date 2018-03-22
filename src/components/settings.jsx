import React from 'react';
import {render} from 'react-dom';

var axios= require('axios');


class SettingsOptions extends React.Component {
    constructor(props){
        super(props);
        this.state={
            user: this.props.user,
            editing_mode: false,
            currency: '',
            api_key: this.props.user.record.api_key
        }
        this.handleChange= this.handleChange.bind(this);
        this.switch_mode= this.switch_mode.bind(this);
        this.updateApiKey= this.updateApiKey.bind(this);
        this.enableTwoFactor= this.enableTwoFactor.bind(this);

    }


    handleChange(a_field, event){
        if(a_field=='email'){
            this.setState({email: event.target.value});
        }else if(a_field=='firstname'){
            this.setState({firstname: event.target.value});       
        }else if(a_field=='lastname'){
            this.setState({lastname: event.target.value});
        }else if(a_field=='currency'){
            this.setState({currency: event.target.value});
        }
        else if(a_field=='address'){
            this.setState({payment_address: event.target.value});
        }
        else if(a_field=='charity'){
            this.setState({charity_address: event.target.value}); 
        }
        else if(a_field=='donation'){
            this.setState({donation: event.target.value});            
        }
    }

    switch_mode(mode_type,event){
        event.preventDefault();
        if (mode_type=='account'){
            this.setState({account_editing_mode: !this.state.account_editing_mode});            
        }
    }

    updateApiKey(event){
        event.preventDefault();
        console.log('Updating api key');
        var page = this;
        if (confirm('Creating a new API Key will delete your previous one. Any external apps or services using your previous key will need to be updated. Are you sure you wish to continue?')){
            axios.post('/update_api_key',{
                id: this.props.user._id,
                api_key: this.props.user.record.api_key
            })
            .then(function(response){
                if (response.data.success==true){
                    page.setState({
                        api_key: response.data.api_key
                    });
                    toastr.success('API Key updated!');
                }else{
                    toastr.error('There was an error with updating your API Key');
                    console.log(response.data.error);
                }
            }).catch(function(error){
                toastr.error('There was an error with updating your API Key');
                console.log(error);
            });
        }
    }

    enableTwoFactor(event){
        event.preventDefault();

        if(confirm('Are you sure you want to enable two factor authentication?')==true){
            console.log('Start 2fa process');
        }else{
            console.log('2fa setup cancelled');
        }
    }



    render(){

        return(
            <div className="container-fluid">
                <h1 className="page-title text-center">My Settings</h1>
                
                <div className="row">
                    <div className="mx-auto my-4">
                        <div className="">
                            <div className="text-center">
                                <div className="card rounded">
                                    <h3 className="card-header bg-dark text-light">Authentication</h3>
                                    <div className="card-body col-md-8 mx-auto">
                                        {
                                            this.props.user.record.twofa_enabled==true && 
                                            this.props.user.record.twofa_completed==true ?
                                            <div>
                                                <p className="alert alert-success">Enabled</p>
                                                <form method="POST" action="/update_2fa_settings">
                                                    <input type="hidden" name="enable_2fa" value="false" />
                                                    <button className="btn btn-warning" type="submit">Disable 2FA</button>
                                                </form>
                                            </div>:
                                            null
                                        }                                        
                                        {
                                            this.props.user.record.twofa_enabled==true && 
                                            this.props.user.record.twofa_completed===false ?
                                            <p className="alert alert-danger">Started but not completed</p>:
                                            null
                                        }
                                        {
                                            this.props.user.record.twofa_enabled==false  ?
                                            <div>
                                                <p className="alert alert-warning">Not enabled</p>
                                                <form method="POST" action="/update_2fa_settings">
                                                    <input type="hidden" name="enable_2fa" value="true" />
                                                    <button className="btn btn-warning" type="submit">Enable 2FA</button>
                                                </form>
                                            </div>:
                                            null
                                        }
                                    </div>
                                    <br />
                                </div>

                                <div className="card rounded my-4">
                                    <h3 className="card-header bg-dark text-light">API Key</h3>
                                    <div className="card-body col-md-8 p-3 mx-auto">
                                        <p>Use the below API Key if using an external application or bot to record into the blockchain through your account</p>
                                        <div className="text-center">
                                            <p className="alert alert-info auth-hash">{this.state.api_key}</p>
                                        </div>
                                        <div className="text-center">
                                            <button className="btn btn-success" type="submit" onClick={this.updateApiKey.bind(this)}>Create new API Key</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>


                    </div>
                </div>
            </div>
        )
    }
};


var SettingsExport= () => {
    if (document.getElementById('settings-options') != null){

        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));

        render(<SettingsOptions user={props.user} validation={props.validation} messages={props.messages} />, document.getElementById('settings-options'));
    }
}

module.exports= SettingsExport();