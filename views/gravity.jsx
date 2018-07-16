import React from 'react';
import ReactDom from 'react-dom';

import ApplicationLayout from './layout/application';

class GravityPage extends React.Component{
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
              <div className="">
                <div className="row">
                  <h1 className="mx-auto text-light my-5 py-3">Welcome to Gravity</h1>
                  <div className="col-12 col-md-10 mx-auto card p-3">
                    <div className="card p-0 rounded">
                      <div className="">
                        <ul className="nav nav-tabs nav-fill h5" id="myTab" role="tablist">
                          <li className="nav-item">
                            <a className="nav-link text-primary active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">App Status</a>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link text-primary" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">Getting Started</a>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link text-primary" id="contact-tab" data-toggle="tab" href="#contact" role="tab" aria-controls="contact" aria-selected="false">Documentation</a>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link text-primary" id="next-tab" data-toggle="tab" href="#next" role="tab" aria-controls="next" aria-selected="false">What's Next?</a>
                          </li>
                        </ul>
                      </div>
                      <div className="card-block">
                        <div className="card-body">
                          <div className="tab-content" id="myTabContent">
                            <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                              <div className="card p-0">
                                <table className="table mb-0">
                                  <tbody>
                                    <tr>
                                      <th scope="row">Application Passphrase</th>
                                      <td className={this.props.requirements.passphrase ? "text-success":"text-danger"}>{this.props.requirements.passphrase ? 'Connected' : 'Missing'}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Application Address</th>
                                      <td className={this.props.requirements.address ? "text-success":"text-danger"}>{this.props.requirements.address ? 'Connected' : 'Missing'}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Application Public Key</th>
                                      <td className={this.props.requirements.public_key ? "text-success":"text-danger"}>{this.props.requirements.public_key ? 'Connected' : 'Missing'}</td>
                                    </tr>
                                    <tr>
                                      <th scope="row">Application Data Encryption</th>
                                      <td className={this.props.requirements.encryption ? "text-primary":"text-danger"}>{this.props.requirements.encryption ? 'Ready' : 'Not-Encrypted'}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                              <div className="card bg-light p-2">
                                <p>Application Structure</p>
                                <p>Public Assets</p>
                                <p>Bootstrap Theme</p>
                                <p>API Library</p>
                                <p>Task Manager</p>
                              </div>
                            </div>
                            <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                              <div className="card bg-light p-2">
                                <p>Visit our Documation available on the <a href="#">GitHub Wiki</a></p>
                                <p>View some of your introduction tutorials <a href="#">here</a></p>
                              </div>
                            </div>
                            <div className="tab-pane fade" id="next" role="tabpanel" aria-labelledby="next-tab">
                              <div className="card bg-light p-2">
                                <p>Generate a blank page</p>
                                <p>Customize the templates</p>
                                <p>Modify the conent</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ApplicationLayout>
        )
    }
};

module.exports= GravityPage;
