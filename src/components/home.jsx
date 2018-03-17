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
                <div className="card">
                    <div className="">
                    <ul className="nav nav-tabs nav-justified nav-fill" id="myTab" role="tablist">
                        <li className="nav-item">
                        <a className="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">Pending Payouts</a>
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Payouts</a>
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" id="contact-tab" data-toggle="tab" href="#contact" role="tab" aria-controls="contact" aria-selected="false">Donations</a>
                        </li>
                        <li className="nav-item">
                        <a className="nav-link" id="next-tab" data-toggle="tab" href="#next" role="tab" aria-controls="next" aria-selected="false">All Transactions</a>
                        </li>
                    </ul>
                    </div>
                    <div className="card-block">
                    <div className="card-body">
                        <div className="tab-content" id="myTabContent">
                        <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <div className="h4 my-4 text-center">Pending Payouts</div>
                            <div className="card p-0">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Sender</th>
                                            <th>Recipient</th>
                                            <th>Fee</th>
                                            <th>Units</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>01/01/2018</td>
                                            <td>Outgoing Transfer</td>
                                            <td>JUP</td>
                                            <td>You</td>
                                            <td>JUP-2342-324235-2342</td>
                                            <td>0.001 MER</td>
                                            <td>0.20000000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        <div className="h4 my-4 text-center">Payouts</div>
                            <div className="card p-0">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Sender</th>
                                            <th>Recipient</th>
                                            <th>Fee</th>
                                            <th>Units</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>01/01/2018</td>
                                            <td>Outgoing Transfer</td>
                                            <td>JUP</td>
                                            <td>You</td>
                                            <td>JUP-2342-324235-2342</td>
                                            <td>0.001 MER</td>
                                            <td>0.20000000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                        <div className="h4 my-4 text-center">Donations</div>
                            <div className="card p-0">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Sender</th>
                                            <th>Recipient</th>
                                            <th>Fee</th>
                                            <th>Units</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>01/01/2018</td>
                                            <td>Outgoing Transfer</td>
                                            <td>JUP</td>
                                            <td>You</td>
                                            <td>JUP-2342-324235-2342</td>
                                            <td>0.001 MER</td>
                                            <td>0.20000000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="tab-pane fade" id="next" role="tabpanel" aria-labelledby="next-tab">
                        <div className="h4 my-4 text-center">All Transactions</div>
                            <div className="card p-0">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Name</th>
                                            <th>Sender</th>
                                            <th>Recipient</th>
                                            <th>Fee</th>
                                            <th>Units</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>01/01/2018</td>
                                            <td>Outgoing Transfer</td>
                                            <td>JUP</td>
                                            <td>You</td>
                                            <td>JUP-2342-324235-2342</td>
                                            <td>0.001 MER</td>
                                            <td>0.20000000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
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
