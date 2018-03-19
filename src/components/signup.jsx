import React from 'react';
import {render} from 'react-dom';


// place where you'd like in your app

class SignupForm extends React.Component{
    constructor(props){
        super(props);
        this.state={
            new_jup_account: false,
            jup_account_created: false,
            jup_account: '',
            jup_passphrase: '',
            firstname: '',
            lastname: '',
            email: '',
            enable_two_fa: false,
            generated_passphrase: '',
            passphrase_confirmation: '',
            passphrase_confirmation_page: false,
            passphrase_confirmed: false,
            confirmation_message: '',
            account_object: '',
            public_key: ''
        }
        this.handleChange= this.handleChange.bind(this);
        this.registerAccount= this.registerAccount.bind(this);
        this.update2FA= this.update2FA.bind(this);
        this.testConnection= this.testConnection.bind(this);
        this.generatePassphrase= this.generatePassphrase.bind(this);
    }


    componentDidMount() {
        /*if (this.props.messages != null && this.props.messages.signupMessage != null){
            this.props.messages.signupMessage.map(function(message){
                toastr.error(message);
            });
        }*/
    }

    testConnection=(event) => {
        event.preventDefault();

        var axios= require('axios');

        axios.post('/test_connection', {

        }).then(function(response){
            if(response.data.success==true){
                console.log('Success');
                console.log(response.data.response);
            }else{
                console.log('Error');
            }
        }).catch(function(error){
            console.log(error)
        });
    }

    confirmedPassphrase=(event)=>{
        event.preventDefault();

        this.setState({
            passphrase_confirmation_page: true
        })
    }

    generatePassphrase=(event) =>{
        event.preventDefault();

        var axios= require('axios');

        var page= this;

        axios.get('/create_passphrase')
        .then(function(response){
            if(response.data.success==true){
                console.log(response.data.message)
                page.setState({
                    jup_account_created: true,
                    generated_passphrase: response.data.result,
                });

                toastr.success('Passphrase generated!');

            }else{
                toastr.error('There was an error in your passphrase');
            }
        })
        .catch(function(error){
            toastr.error('There was an error in generating passphrase');
            console.log(error);
        });
    }

    confirmPassphrase=(event) =>{
        event.preventDefault();
        var axios= require('axios');

        var page =this;

        if(this.state.generated_passphrase != this.state.passphrase_confirmation){
            /*this.setState({
                confirmation_message: 'The passphrase you entered is not correct!'
            });*/
            toastr.error('The passphrase you entered is not correct!');
        }else{

            axios.post('/create_jupiter_account',{
                account_data: {
                    passphrase: this.state.generated_passphrase,
                    email: this.state.email,
                    firstname: this.state.firstname,
                    lastname: this.state.lastname,
                    twofa_enabled: this.state.twofa_enabled
                }
            })
            .then(function(response){
                if(response.data.success==true){
                    console.log(response.data)
                    page.setState({
                        account_object: response.data.account,
                        public_key: response.data.account.public_key,
                        confirmation_message: 'Passphrase confirmed and Jupiter account '+
                        response.data.account.account+ ' was created for you. Please click below to finalize your account creation.'
                    });
                }else{
                    toastr.error(response.data.message);
                }
            })
            .catch(function(error){
                console.log(error);
                toastr.error('There was an error!');
            })
            this.setState({
                confirmation_message: 'Passphrase confirmed. Please confirm account details!',
                passphrase_confirmed: true
            });
        }
    }

    handleChange=(i_type, event) => {

        if(i_type=='account'){
            this.setState({
                jup_account: event.target.value
            });
        }else if(i_type=='pass'){
            this.setState({
                jup_passphrase: event.target.value
            });
        }else if(i_type=='firstname'){
            this.setState({
                firstname: event.target.value
            });
        }else if(i_type=='lastname'){
            this.setState({
                lastname: event.target.value
            });
        }else if(i_type=='email'){
            this.setState({
                email: event.target.value
            });
        }else if(i_type=='passphrase_confirm'){
            this.setState({
                passphrase_confirmation: event.target.value
            })
        }
    }

    registerAccount(event){
        event.preventDefault();

        var axios = require('axios');

        var page= this;

        axios.post('/create_account',{
            account_data: {
                passphrase: this.state.generated_passphrase,
                email: this.state.email,
                twofa_enabled: this.state.enable_two_fa,
                firstname: this.state.firstname,
                lastname: this.state.lastname
            }
        }).then(function(response){
            console.log(response.data);
            if(response.data.success==true){
                console.log(response.data)
            }else{
                console.log('There was an error creating your account')
                page.setState({
                    confirmation_message: response.data.message
                });
            }
        }).catch(function(error){
            console.log('There was an error!');
            console.log(error);
        });

    }

    update2FA(i_type, event){
        event.preventDefault();
        if(i_type=='true'){
            this.setState({
                enable_two_fa: true
            });
        }else{
            this.setState({
                enable_two_fa: false
            });
        }
    }

    render(){
        var new_account_summary=
            <form action="/signup" method="post" className="">
              <div className="">
                <div className="">
                  <div>
                      <label>First name</label>
                      <input value={this.state.firstname} name="firstname" className="form-control" disabled/>
                      <input type="hidden" value={this.state.firstname} name="firstname" className="form-control"/>
                  </div>

                  <div>
                      <label>Last name</label>
                      <input value={this.state.lastname} name="lastname" className="form-control" disabled/>
                      <input type="hidden" value={this.state.lastname} name="lastname" className="form-control"/>
                  </div>

                  <div>
                      <label>Email</label>
                      <input value={this.state.email} name="email" className="form-control" disabled/>
                      <input type="hidden" value={this.state.email} name="email" className="form-control"/>
                  </div>
                </div>
              </div>
                <div className="">
                  <div>
                      <input type="hidden" name="account" value={this.state.account_object.account} />
                      <input type="hidden" name="accounthash" value={this.state.account_object.account} />
                      <input type="hidden" name="twofa_enabled" value={this.state.enable_two_fa} />
                      <input type="hidden" name="public_key" value={this.state.public_key} />
                      <input type="hidden" name="key" value={this.state.generated_passphrase} />
                      <input type="hidden" name="jup_account_id" value={this.state.account_object.jup_account_id} />
                  </div>

                  <div>
                    <lable><strong>Enable two-factor authentication</strong> {this.state.enable_two_fa== true ? 'Yes' : 'No'}</lable>

                    <p>{this.state.confirmation_message}</p>

                    {this.state.enable_two_fa== true && <p>You requested for two-factor authentication to be enabled. You will be redirected to the two-factor setup after clicking the button below.</p>}

                  </div>

                  <div>
                      {
                          this.state.account != '' && 
                        <input type="submit" value="Complete registration" className="btn btn-primary"/>                    
                     }
                  </div>
                </div>
            </form>

        var generated_account=
            <div className="form-group">
                <div className="">
                  <h4>Your new passphrase:</h4>
                  <form className="form-group">
                    <p className="alert alert-info">{this.state.generated_passphrase}</p>
                  </form>
                </div>
                <div className="">
                  <h4>Acount Details:</h4>
                  <div className="form-group details">
                    <input className="form-control" value={this.state.firstname} onChange={this.handleChange.bind(this, 'firstname')} placeholder="First name" type="text"/>
                    <input className="form-control" value={this.state.lastname} onChange={this.handleChange.bind(this, 'lastname')} placeholder="Last name" type="text"/>
                    <input className="form-control" value={this.state.email} onChange={this.handleChange.bind(this, 'email')} placeholder="Email address" type="email"/>
                  </div>
                </div>
                  <div className="form-group">
                      <h4>Enable 2FA Security:</h4>
                      <div className="yn-button">

                          <button className={"btn" + (this.state.enable_two_fa == true ? ' btn-success active' : ' btn-default')} onClick={this.update2FA.bind(this, 'true')}>Yes</button>
                          <button className={"btn btn-default" +  (this.state.enable_two_fa == false ? '  btn-danger active' : ' btn-default')} onClick={this.update2FA.bind(this, 'false')}>No</button>
                      </div>
                  </div>
                {this.state.jup_account_created == true ?
                    <div className="form-group">
                        <button disabled={!this.state.firstname || !this.state.lastname || !this.state.email } className="btn btn-primary btn-block" onClick={this.confirmedPassphrase.bind(this)}>Create my account</button>
                    </div>:
                    <div className="form-group">
                        <button disabled={!this.state.firstname || !this.state.lastname || !this.state.email } className="btn btn-primary btn-block" onClick={this.registerAccount.bind(this)}>Create my account</button>
                    </div>
                }
                {this.state.confirmation_message}
            </div>


        var passphrase_confirmation_page=
            <form className="">
                <div className="form-group signup" id="jup-confirm">
                    <p>Please enter the passphrase of your newly created Jupiter account
                        to confirm it.
                    </p>
                    <input type="text" className="form-control" value={this.state.passphrase_confirmation} onChange={this.handleChange.bind(this, 'passphrase_confirm')} />
                </div>
                <div className="form-group signup">
                  <button className="btn btn-primary" onClick={this.confirmPassphrase.bind(this)}>Confirm my passphrase</button>
                </div>
                {this.state.confirmation_message}
            </form>

        var signup_form=
            <form className="jupiter-form">
                {this.state.jup_account_created == true ? generated_account :
                    <div className="form-group signup">
                      <div className="form-group paragraph">
                        <p>Gravity is a platform designed to give you quick and easy access to the Jupiter blockchain.</p>
                        <p>Access to the blockchain requires a secure passphrase. This passphrase should be written down and kept in a safe palce.
                        Once you are ready to sign up, click the button below.</p>
                      </div>
                      <br />
                      <button className="btn btn-primary btn-block" onClick={this.generatePassphrase.bind(this)}>Create passphrase</button>
                    </div>
                }
            </form>


        return(
            <div className="">
                {
                    this.state.passphrase_confirmation_page == true ?
                        this.state.passphrase_confirmed == true ?
                            new_account_summary :
                            passphrase_confirmation_page
                    : signup_form
                }
            </div>
        )
    }
};

var SignupExport= () => {
    if(document.getElementById('signup-form') !=null){

        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));
        
        render(<SignupForm messages={props.messages} />, document.getElementById('signup-form'));
    }
}

module.exports= SignupExport();
