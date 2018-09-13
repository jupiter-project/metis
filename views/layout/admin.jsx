import React from 'react';

export default class ApplicationLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_exists: this.props.data.user != null || false,
    };
  }

  render() {
    const loggedHeader = (
      <nav className="navbar navbar-expand navbar-custom static-top">
        <a className="navbar-brand" href="/gravity">
          {process.env.APPNAME ? (
            <div>
              <i className="fa fa-globe" alt="yourBrand" />
              {' '}
              <span>YourBrand</span>
            </div>
          ) : (
            <div>
              <img
                src="/img/logo.png"
                //className="pb-1"
                alt="sigwo"
                height="32px"
              />
              {' '}
              <span>Sigwo Technologies</span>
            </div>
          )}
        </a>

        <button
          className="btn btn-link btn-sm text-white d-block d-md-none ml-auto"
          href="/#"
          data-toggle="collapse"
          data-target="#mobile-menu"
        >
          <i className="fa fa-bars" />
        </button>

        <ul className="navbar-nav ml-auto">
          <li className="nav-item dropdown no-arrow mx-1">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              id="alertsDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fa fa-user" /> My Account
            </a>
            <div
              className="dropdown-menu dropdown-menu-right"
              aria-labelledby="alertsDropdown"
            >
              <a className="dropdown-item" href="/settings">
                <i className=" fa fa-cog"> </i> Settings
              </a>
              <div className="dropdown-divider" />
              <a
                className="dropdown-item"
                href="#"
                data-toggle="modal"
                data-target="#logoutModal"
              >
                <i className="fa fa-sign-out" /> Log out
              </a>
            </div>
          </li>
        </ul>
      </nav>
    );

    const unloggedHeader = (
      <nav className="navbar navbar-expand navbar-custom static-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/gravity">
            {process.env.APPNAME ? (
              <div>
                <i className="fa fa-globe" alt="yourBrand" />
                {' '}
                <span>YourBrand</span>
              </div>
            ) : (
              <div>
                <img
                  src="/img/logo.png"
                  className="pb-1"
                  alt="sigwo"
                  height="32px"
                />
                {' '}
                <span>Sigwo Technologies</span>
              </div>
            )}
          </a>

          <button
            className="btn btn-link btn-sm text-white d-block d-md-none ml-auto"
            href="/#"
            data-toggle="collapse"
            data-target="#mobile-menu"
          >
            <i className="fa fa-bars" />
          </button>

          <div className="d-block d-md-block ml-auto">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="/signup">
                  <i className="fa fa-user-plus" />
                  <span>Sign Up</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/login">
                  <i className="fa fa-sign-in" />
                  <span>Log in</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );

    const loggedWrapper = (
      <div id="wrapper">
        <ul className="sidebar navbar-nav">
          <div className="card card-account d-none d-md-block">
            <div className="card-body">
              <h5>Account ID</h5>
              <span className="small">
                {this.state.user_exists
                  ? this.props.data.user.record.account
                  : 'JUP XXXX-XXXX-XXXX-XXXXX'}
              </span>
            </div>
          </div>
          <li className="nav-item">
            <a className="nav-link" href="/">
              <i className="fa fa-dashboard" />
              <span>App Summary</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/admin/tables">
              <i className="fa fa-edit" /> 
              <span>Tables</span>
            </a>
          </li>
        </ul>
        <div id="content-wrapper">
          <div className="container-fluid">
          
            {this.props.children}
          </div>
        </div>
      </div>
    );

    const unloggedWrapper = (
      <div id="wrapper">
        <div id="content-wrapper">
          <ul className="sidebar navbar-nav">
            <li className="nav-item">
            <a className="nav-link" href="/">
              <i className="fa fa-dashboard" />
              <span>App Summary</span>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/admin/tables">
              <i className="fa fa-edit" /> 
              <span>Tables</span>
            </a>
          </li>
          </ul>
          <div id="content-wrapper">
            <div className="container-fluid">
              <div className="collapse navbar-collapse mx-auto" id="mobile-menu">
                <ul className="navbar-nav d-block d-md-none text-center">
                  <ul className="nav flex-column">
                    <li className="nav-item">
                      <a className="nav-link" href="https://docs.gravity.com">
                        <i className="fa  fa-fw pr-1 fa-file" />
                        <span>Documents</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        className="nav-link"
                        href="https://github.com/SigwoTechnologies/jupiter-gravity"
                      >
                        <i className="fa  fa-fw pr-1 fa-github" />
                        <span>GitHub</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/signup">
                        <i className="fa fa-user-plus" />{' '}
                        <span>Sign up</span>
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/login">
                        <i className="fa fa-sign-in" />{' '}
                        <span>Log in</span>
                      </a>
                    </li>
                  </ul>
                </ul>
              </div>
              {this.props.children}
              <div className="fixed-bottom">
                <footer className="sticky-footer">
                  <div className="container-fluid my-auto">
                    <div className="copyright text-center my-auto">
                      {process.env.APPNAME ? (
                        <div>
                          <div>Copyright © 2018 YourBrand</div>
                          <div className="mt-2 small">powered by Gravity</div>
                        </div>
                      ) : (
                        <div>
                          <div>Copyright © 2018 Sigwo Technologies</div>
                          <div className="mt-2 small">powered by Gravity</div>
                        </div>
                      )}
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <html>
        <head>
          <meta httpEquiv="Content-Type" content="text/html;charset=utf-8" />
          <title>{this.props.data.name}</title>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css"
            rel="stylesheet"
          />
          <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js" />
          <link
            href="/vendor/font-awesome/css/font-awesome.min.css"
            rel="stylesheet"
          />
          <link
            href="/vendor/bootstrap/css/bootstrap.min.css"
            rel="stylesheet"
          />

          <link
            href="https://fonts.googleapis.com/css?family=Lato:300,300i,400,400i"
            rel="stylesheet"
          />

          <link href="/css/sb-admin.css" rel="stylesheet" />
        </head>
        <body>
          <span id="toastrMessages" />
          <div
            id={this.props.data.dashboard === true ? 'logged-in' : 'logged-out'}
          >
            {this.props.data.dashboard === true ? loggedHeader : unloggedHeader}

            {this.props.data.dashboard === true
              ? loggedWrapper
              : unloggedWrapper}
          </div>

          <div
            className="modal fade"
            id="logoutModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby=" "
            aria-hidden="true"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id=" ">
                    Ready to Leave?
                  </h5>
                  <button
                    className="close"
                    type="button"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  Select "Log out" below if you are ready to end your current
                  session.
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    data-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <a className="btn btn-primary" href="/logout">
                    Log out
                  </a>
                </div>
              </div>
            </div>
          </div>

          <script src="/vendor/jquery/jquery.min.js" />
          <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js" />

          {/*
            <script src="/vendor/chart.js/Chart.min.js" />
            I replaced this with react-chartsjs
            https://github.com/reactjs/react-chartjs

          */}

          <script src="/js/sb-admin.min.js" />

          <script
            src="/js/bundle.js"
            data-props={JSON.stringify(this.props.data)}
            id="props"
          />
        </body>
      </html>
    );
  }
}
