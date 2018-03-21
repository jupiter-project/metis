import React from 'react';
import {render} from 'react-dom';

class LoginForm extends React.Component{
    constructor(props){
        super(props);
        this.state={
            jup_passphrase:'',
            response_message: '',
            response_type: '',
            confirmation_page: false,
            account: '',
            accounthash: '',
            public_key: '',
        }
        this.handleChange= this.handleChange.bind(this);
        this.logIn= this.logIn.bind(this);
    }

    componentDidMount() {
        /*if (this.props.messages != null && this.props.messages.loginMessage != null){
            this.props.messages.loginMessage.map(function(message){
                toastr.error(message);
            });
        }*/
    }

    handleChange(event){
        this.setState({
            jup_passphrase: event.target.value
        });
    }

    logIn(event){
        event.preventDefault();
        //toastr.info('Logging in now!');
        console.log('Authentication submitted!');
        var events= require('events');
        var eventEmitter = new events.EventEmitter();
        var axios= require('axios');
        var page = this;
        var accountRS;

        axios.post('/get_jupiter_account', {
                jup_passphrase: this.state.jup_passphrase
            })
            .then(function(response) {
                //new_account_created = true;
                //bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
                //console.log(response.data) ;
                if (response.data.success==true){
                    page.setState({
                        confirmation_page: true,
                        account: response.data.account,
                        accounthash: response.data.accounthash,
                        public_key: response.data.public_key
                    });
                }else{
                    toastr.error(response.data.message);
                }
            })
            .catch(function(error) {
                //console.log(error);
                toastr.error('There was an error in verifying the passphrase with the blockchain.');
            });

    }

    render(){
        var confirmation_page=
        <form action="/login" method="post" className="">
            <div className="form-group text-center">
              <p>You are about to login to the account:</p>
              <div className="h4">{this.state.account}</div>
            </div>
            <input type="hidden" name="account" value={this.state.account} />
            <input type="hidden" name="accounthash" value={this.state.accounthash} />
            <input type="hidden" name="public_key" value={this.state.public_key} />
            <input type="hidden" name="jupkey" value={this.state.jup_passphrase} />
            <input type="hidden" name="jup_account_id" value={this.state.jup_account_id} />

            <div className="form-group">
                <button type="submit" className="btn btn-primary btn-block">Continue</button>
            </div>
        </form>

        var login_form=
            <form className="form-group">
                <div className="form-group">
                    <label htmlFor="inputPassphrase" className="h4 text-center">Enter your Passphrase:</label>
                    <input className="form-control" id="inputPassphrase" type="password" value={this.state.jup_passphrase} onChange={this.handleChange.bind(this)} placeholder="Your Jupiter Passphrase" autoComplete="current-password" />
                </div>
                <div className="form-group">
                    <button className="btn btn-primary btn-block" onClick={this.logIn.bind(this)}>Login</button>
                </div>
            </form>
        return(
            <div>
                {this.state.confirmation_page == true ?  confirmation_page : login_form}


            </div>
        )
    }
};


var LoginExport= () => {
    if(document.getElementById('login-form') !=null){
        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));
        
        render(<LoginForm messages={props.messages} server= {props.server}/>, document.getElementById('login-form'));
    }
}

module.exports= LoginExport();

