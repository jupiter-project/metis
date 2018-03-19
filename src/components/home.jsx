import React from 'react';
import {render} from 'react-dom';

var axios= require('axios');


class HomeComponent extends React.Component {
    constructor(props){
        super(props);
        this.state={
            user: this.props.user
        }
    }

    componentDidMount(){

    }


    render(){

        return(
            
              <div className="container">
                <h1 className="text-center mt-3 mb-5">Welcome to the Gravity Platform</h1>

              </div>
            
        )
    }
};

var HomeExport= () => {
    if(document.getElementById('home-dashboard') !=null){
        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));
        render(<HomeComponent user={props.user} messages={props.messages} />, document.getElementById('home-dashboard'));
    }
}

module.exports= HomeExport();
