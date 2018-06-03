import React from 'react';
import ReactDom from 'react-dom';

export default class ApplicationLayout extends React.Component {
    constructor(props){
        super(props);
        this.state={
            user_exists: this.props.data.user != null ? true : false
        }
    }


    render(){
        var links_list=
        
        <ul className="navbar-nav navbar-sidenav" id="exampleAccordion">
            <li className="nav-item p-2 bg-secondary rounded">
              <div className="text-center">
                <h4 className="text-white">Account ID</h4>
                <a className="nav-link small" href="#">{this.props.data.user != null ? this.props.data.user.record.account : null}</a>
              </div>
            </li>
            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="" data-original-title="Charts">
              <a className="nav-link" href="/">
                <i className="fa fa-fw fa-dashboard"></i>
                <span className="nav-link-text"> Dashboard</span>
              </a>
            </li>
            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="" data-original-title="Tables">
              <a className="nav-link" href="/account">
                <i className="fa fa-fw fa-table"></i>
                <span className="nav-link-text"> Account</span>
              </a>
            </li>
            {false && 'Generated plop links go here'}
            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="" data-original-title="Dashboard">
              <a className="nav-link" href="/gravity">
                <i className="fa fa-fw fa-question-circle"></i>
                <span className="nav-link-text"> Getting Started</span>
              </a>
            </li>
            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="" data-original-title="Charts">
              <a className="nav-link" href="https://github.com/SigwoTechnologies/jupiter-gravity/wiki" target="_blank">
                <i className="fa fa-fw fa-area-chart"></i>
                <span className="nav-link-text"> Gravity Docs</span>
              </a>
            </li>
            <li className="nav-item" data-toggle="tooltip" data-placement="right" title="" data-original-title="Tables">
              <a className="nav-link" href="/gravity#contact-tab">
                <i className="fa fa-fw fa-table"></i>
                <span className="nav-link-text"> Contact Us</span>
              </a>
            </li>
        </ul>

        var logged_header=
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
            <a className="navbar-brand" href="#"><img className="img" src="../img/sigwo-sheild2.png" height="48px" width="auto" /> Sigwo Technologies</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              {links_list}
              <ul className="navbar-nav sidenav-toggler">
                <li className="nav-item">
                  <a className="nav-link text-center" id="sidenavToggler">
                    <i className="fa fa-fw fa-angle-left"></i>
                  </a>
                </li>
              </ul>
              <ul className="navbar-nav ml-auto">
              <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle mr-lg-2" id="profileDropdown" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <i className="fa fa-fw fa-user"></i> My Profile
                  </a>
                  <div className="dropdown-menu dropdown-menu-right" aria-labelledby="profileDropdown">
                      <h6 className="dropdown-header">Logged in as: {this.props.data.user != null ? this.props.data.user.record.firstname : null}</h6>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item" href="/">
                          My Dashboard
                      </a>
                      <a className="dropdown-item" href="/admin">
                          App Data
                      </a>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item small" href="#">
                          Help
                      </a>
                      <a className="dropdown-item small" href="/settings">
                          Settings
                      </a>
                      <a className="dropdown-item small" href="/logout">
                        Sign out
                      </a>
                  </div>
                </li>
              </ul>
            </div>
        </nav>

        var unlogged_header=
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" id="mainNav">
            <a className="navbar-brand" href="#"><img className="img" src="../img/sigwo-sheild2.png" height="48px" width="auto" /> Sigwo Technologies</a>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav navbar-sidenav" id="exampleAccordion">
                  <li className="nav-item" data-toggle="tooltip" data-placement="right" title="" data-original-title="Dashboard">
                    <a className="nav-link" href="/gravity">
                      <i className="fa fa-fw fa-dashboard"></i>
                      <span className="nav-link-text"> Getting Started</span>
                    </a>
                  </li>
              </ul>
              <ul className="navbar-nav sidenav-toggler">
                <li className="nav-item">
                  <a className="nav-link text-center" id="sidenavToggler">
                    <i className="fa fa-fw fa-angle-left"></i>
                  </a>
                </li>
              </ul>
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/signup">
                    Sign up
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/login">
                    <i className="fa fa-fw fa-sign-in"></i >Log in
                  </a>
                </li>
              </ul>
            </div>
        </nav>

        var logged_wrapper=
        <div className="content-wrapper">
          <div className="container">
            {this.props.children}
          </div> 
        </div>
        

        var unlogged_wrapper=
        <div className="content-wrapper">
          <div className="container-fluid">
            {this.props.children}
          </div>
        </div>

        return(
            <html>
                <head>
                    <meta httpEquiv="Content-Type" content= "text/html;charset=utf-8" />
                    <title>{this.props.data.name}</title>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                    <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css" rel="stylesheet"/>
                    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js"></script>
                    <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" />
                    <link href="vendor/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
                    <link href="vendor/datatables/dataTables.bootstrap4.css" rel="stylesheet" />
                    <link href="css/sb-admin.css" rel="stylesheet" />
                </head>
                <body className="sticky-footer bg-dark fixed-nav" id="page-top">
                    <span id="toastrMessages"></span>
                    <div id={this.props.data.dashboard == true ? 'wrapper' : 'unlogged-wrapper'}>
                        {
                            this.props.data.dashboard== true ? logged_header : unlogged_header
                        }


                        {
                            this.props.data.dashboard==true ?
                            <div className="content-wrapper" id="page-wrapper">
                              <div className="container">
                                {this.props.children}
                              </div>
                            </div>:
                            unlogged_wrapper
                        }
                    </div>
                    <footer className="sticky-footer">
                      <div className="container">
                        <div className="text-center">
                          <small>Copyright © Sigwo Technologies 2018</small>
                        </div>
                      </div>
                    </footer>

                    <div className="modal fade show" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel">
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
                            <a className="btn btn-primary" href="/login">Logout</a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <script src="vendor/jquery/jquery.min.js"></script>
                    <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
                    <script src="vendor/jquery-easing/jquery.easing.min.js"></script>
                    <script src="vendor/chart.js/Chart.min.js"></script>
                    <script src="vendor/datatables/jquery.dataTables.js"></script>
                    <script src="vendor/datatables/dataTables.bootstrap4.js"></script>
                    <script src="js/sb-admin.min.js"></script>
                    <script src="js/sb-admin-datatables.min.js"></script>
                    <script src="js/sb-admin-charts.min.js"></script>
                    <script src="js/bundle.js" data-props={JSON.stringify(this.props.data)} id="props"></script>
                </body>
            </html>
        )
    }
};
