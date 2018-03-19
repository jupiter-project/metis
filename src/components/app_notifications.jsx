import React from 'react';
import {render} from 'react-dom';



class AppNotifications extends React.Component {
    constructor(props){
        super(props);
        this.state={

        }
    }

    componentDidMount(){
        if (this.props.messages != null && this.props.messages.loginMessage != null){
            this.props.messages.loginMessage.map(function(message){
                toastr.error(message);
            });
        }

        if (this.props.messages != null && this.props.messages.signupMessage != null){
            this.props.messages.signupMessage.map(function(message){
                toastr.error(message);
            });
        }
    }

    render(){
        return(null);
    }
};

var NotificationsExport= () => {
    if(document.getElementById('toastrMessages') !=null){
        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));
        render(<AppNotifications messages={props.messages} />, document.getElementById('toastrMessages'));
    }
}

module.exports= NotificationsExport();
