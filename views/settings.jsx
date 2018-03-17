import React from 'react';
import ReactDom from 'react-dom';

import ApplicationLayout from './layout/application';

class SettingsPage extends React.Component{
    constructor(props){
        super(props);
        this.state={

        }
    }

    componentDidMount() {
        if (this.props.messages != null && this.props.messages.signupMessage != null){
            this.props.messages.signupMessage.map(function(message){
                toastr.error(message);
            });
        }
    }

    render(){
        return(
            <ApplicationLayout data={this.props}>
                <div id="settings-options">
                </div>  
            </ApplicationLayout>
        )
    }
};

module.exports= SettingsPage;