import React from 'react';
import ReactDom from 'react-dom';

import ApplicationLayout from './layout/application';

class UserListPage extends React.Component{
    constructor(props){
        super(props);
    }


    render(){
        return(
            <ApplicationLayout data={this.props}>
                <h1 className="text-center">User List</h1>

                <div id="UserListComponent">

                </div>
            </ApplicationLayout>
        )
    }
};

module.exports= UserListPage;