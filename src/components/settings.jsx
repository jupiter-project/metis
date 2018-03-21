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
        if (confirm('Creating a new api key will delete your previous one. Any external apps or services using your previous key will need to be updated. Are you sure you wish to continue?')){
            axios.post('/update_api_key',{
                id: this.props.user._id,
                api_key: this.props.user.record.api_key
            })
            .then(function(response){
                if (response.data.success==true){
                    page.setState({
                        api_key: response.data.api_key
                    });
                    toastr.success('Api Key updated!');
                }else{
                    toastr.error('There was an error with updating your api key');
                    console.log(response.data.error);
                }
            }).catch(function(error){
                toastr.error('There was an error with updating your api key');
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
                    <div className="card mx-auto my-5 p-0">
                        <div className="col-md-12 col-lg-12">
                            <div className="card-body text-center">
                                <div className="">
                                    <h2>2 Factor Authentication:</h2>
                                    <div>
                                        {
                                            this.props.user.record.twofa_enabled==true && 
                                            this.props.user.record.twofa_completed==true ?
                                            <div>
                                                <p className="alert alert-success">Enabled</p>
                                                <form method="POST" action="/update_2fa_settings">
                                                    <input type="hidden" name="enable_2fa" value="false" />
                                                    <button className="btn btn-warning" type="submit">Disable Two Factor Authentication</button>
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
                                                    <button className="btn btn-warning" type="submit">Enable Two Factor Authentication</button>
                                                </form>
                                            </div>:
                                            null
                                        }
                                    </div>
                                    <br />
                                </div>

                                <h2>Api Key:</h2>
                                <div>
                                    <p>Use the below api key if using an external application or bot to record into the blockchain through your account</p>
                                    <div className="text-center">
                                        <p className="alert alert-info auth-hash">{this.state.api_key}</p>
                                    </div>
                                    <div className="text-center">
                                        <button className="btn btn-success" type="submit" onClick={this.updateApiKey.bind(this)}>Create new api key</button>
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