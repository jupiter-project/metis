import React from 'react';
import ApplicationLayout from './layout/application';



class SetupPage extends React.Component {
    constructor(props){
        super(props);
    }

    render(){

        return(
            <ApplicationLayout data={this.props}>
                <div className="text-center">
                    <h1 className="text-center">2FA Authentication</h1>
                    <hr />
                    <div id="2fa-setup-area">

                    </div>
                </div>
            </ApplicationLayout>
        )
    }
}

module.exports = SetupPage;