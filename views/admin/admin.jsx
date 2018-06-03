import React from 'react';
import ReactDom from 'react-dom';

import ApplicationLayout from '../layout/admin';

class DataPage extends React.Component{
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

        if (this.props.messages != null && this.props.messages.generalMessages != null){
            this.props.messages.generalMessages.map(function(message){
                toastr.error(message);
            });
        }
    }

    render(){
        return(
            <ApplicationLayout data={this.props}>
                <div id="app-data">
                
                </div>
            </ApplicationLayout>
        )
    }
};

module.exports= DataPage;
