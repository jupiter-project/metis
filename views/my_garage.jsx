import React from 'react';
import ReactDom from 'react-dom';

import ApplicationLayout from './layout/application';

class MyGaragePage extends React.Component{
    constructor(props){
        super(props);
    }


    render(){
        return(
            <ApplicationLayout data={this.props}>
                <h1 className="text-center">My Garage</h1>

                <div id="MyGarageComponent">

                </div>
            </ApplicationLayout>
        )
    }
};

module.exports= MyGaragePage;