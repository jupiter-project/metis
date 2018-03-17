import React from 'react';
import ReactDom from 'react-dom';

import ApplicationLayout from './layout/application';

class GravityDocs extends React.Component{
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
              <div className="container-fluid">
                <ol className="breadcrumb pull-right">
                  <li className="breadcrumb-item">
                    <a href="#">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item active">Getting Started</li>
                </ol>
                <div className="row p-5" id="docsTop">
                  <div className="col-sm-4">
                    <div className="installMenu my-3">
                      <ul className="list-unstyled"><h2>Getting Started</h2>
                        <li className=""><a href="#gettingStarted">Documentation</a></li>
                        <li className=""><a href="#downloadDoc">Create a page</a></li>
                        <li className=""><a href="#installDoc">Customize the theme</a></li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-sm-8 mt-3">
                    <section className="" id="gettingStarted">
                      <div className="divider my-3"></div>
                      <div className="row bg-dark text-light p-3 pt-4">
                          <div className="col-sm-12 ">
                              <h3 className="">Download the compressed zip file</h3>
                              <hr />

                              <p><strong>Latest Version:</strong> 1.0.1</p>
                              <p><strong>Enviroment:</strong> Node.js</p>
                              <p><strong>Dependencies: </strong><a href="#" className="text-success">Stable</a></p>
                          </div>
                          <div className="text-right">
                            <a className="btn btn-primary text-light btn-lg" href="#">Download v1.2.1 &raquo;</a>
                          </div>
                      </div>
                      <div className="divider my-5"></div>
                      <h3>Requirements</h3>
                      <p>Gravity requires the latest version of <a href="#">Node.js</a> for both development and production. We also recommend a working knowledge of <a href="#">Node Package Manager</a> for backend development and <a href="">React.js</a> for frontend development.</p>
                      <div className="divider my-5"></div>
                    </section>
                    <section className="" id="installDoc">
                      <h3>Install the CLI</h3>
                      <p>You can easily install Gravity through a Command Line Interface like <a href="https://help.ubuntu.com/community/UsingTheTerminal">Terminal</a>. First, open up your Terminal application, <strong>cd</strong> into the Gravity directory and run the following code to install Gravity locally.</p>
                      <code>npm install gravity</code>
                      <div className="divider my-3"></div>
                      <p>Alternativley, you can install Gravity globaly by adding the <strong>-g</strong> flag to the end.</p>
                      <code>npm install gravity -g</code>
                      <div className="divider my-5"></div>
                    </section>

                    <section className="" id="downloadDoc">
                      <h3>Download the Source Code</h3>
                      <p>You can download a copy of the source code from our GitHub page using the this script.</p>
                      <code>git clone https://github.com/SigwoTechnologies/jupiter-gravity</code>
                      <div className="divider my-3"></div>
                    </section>

                  </div>

                </div>
                <div className="modal fade show" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                        <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                          <span aria-hidden="true">×</span>
                        </button>
                      </div>
                      <div className="modal-body">Select "Logout" below if you are ready to end your current session.</div>
                      <div className="modal-footer">
                        <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                        <a className="btn btn-primary" href="login.html">Logout</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ApplicationLayout>
        )
    }
};

module.exports= GravityDocs;
