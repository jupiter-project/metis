import React from 'react';
import ReactDom from 'react-dom';

import ApplicationLayout from './layout/application';

class AccountPage extends React.Component{
    constructor(props){
        super(props);
    }


    render(){
        return(
            <ApplicationLayout data={this.props}>
                <div id="account-section">

                </div>
            </ApplicationLayout>
        )
    }
};

module.exports= AccountPage;