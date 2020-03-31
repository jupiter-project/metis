import React from 'react';
import { gravity } from '../../config/gravity';
import { thisExpression } from 'babel-types';

export default class ApplicationLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_exists: this.props.data.user != null || false,
      user: this.props.data.user,
    };
  }

  render() {
//     const loggedHeader = (
//       <nav className="navbar navbar-expand navbar-custom static-top">
//         <a className="navbar-brand" href="/">
//           <span>Metis - Public Test</span>
//         </a>

    const loggedHeader = (
      <nav className="navbar navbar-expand navbar-custom static-top">
        <a className="navbar-brand" href="/">
          <span>Metis - Public Test {gravity.version}</span>
        </a>

//         <ul className="navbar-nav ml-auto desktop-nav">
//           <li className="nav-item">
//             <a className="nav-link" href="https://sigwo.tech/feedback" target="_blank">
//               Feedback
//             </a>
//           </li>
//           <li className="nav-item dropdown">
//             <a
//               className="nav-link dropdown-toggle"
//               href="#"
//               id="alertsDropdown"
//               role="button"
//               data-toggle="dropdown"
//               aria-haspopup="true"
//               aria-expanded="false"
//             >
//             My Account
//             </a>
//             <div
//               className="dropdown-menu dropdown-menu-right"
//               aria-labelledby="alertsDropdown"
//             >
//               <div className="dropdown-alias-card">
//                 <span
//                   className="d-inline-block text-truncate small"
//                   style={{ maxWidth: '120px'}}
//                 >
//                   Hello, {this.state.user_exists ? this.state.user.record.alias : 'Alias'}
//                 </span>
//               </div>
//               <a className="dropdown-item" href="/account">
//                 <i className="fas fa-fw fa-user" />
//                 {' '}
//                 <span>My Profile</span>
//               </a>
//               <a className="dropdown-item" href="/channels">
//                 <i className="fas fa-fw fa-comments" />
//                 {' '}
//                 <span>My Channels</span>
//               </a>
//               <a className="dropdown-item" href="/invites">
//                 <i className="fas fa-fw fa-envelope" />
//                 {' '}
//                 <span>My Invites</span>
//               </a>
//               <a className="dropdown-item" href="/security">
//                 <i className="fas fa-fw fa-lock" />
//                 {' '}
//                 <span>Security</span>
//               </a>
//               <a
//                 className="dropdown-item"
//                 href="#"
//                 data-toggle="modal"
//                 data-target="#logoutModal"
//               >
//                 <i className="fas fa-fw fa-sign-out-alt" />
//                 {' '}
//                 <span>Log Out</span>
//               </a>
//               {/* <a className="dropdown-item" href="/">
//                 <i className="fas fa-fw fa-question" />
//                 {' '}
//                 <span>Help or FAQ</span>
//               </a> */}
//               {/* <a className="dropdown-item" href="/">
//                 <i className="fas fa-fw fa-info" />
//                 {' '}
//                 <span>About</span>
//               </a> */}

//               {/* <a className="dropdown-item" href="/contacts">
//                 <i className="fas fa-fw fa-id-card" />
//                 {' '}
//                 <span>My Contacts</span>
//               </a> */}
//             </div>
//           </li>
//         </ul>
//       </nav>
//     );

//     const unloggedHeader = (
// <nav className="navbar navbar-expand navbar-custom static-top">
//   <div className="container-fluid">
//     <a className="navbar-brand" href="/home">
//       <span>Metis - Public Test</span>
//     </a>

    const unloggedHeader = (
      <nav className="navbar navbar-expand navbar-custom static-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/home">
            <span>Metis - Public Test {gravity.version}</span>
          </a>

//     <div className="d-none d-lg-block ml-auto">
//       <ul className="navbar-nav">
//         <li className="nav-item">
//           <a className="nav-link" href="/signup">
//             <i className="fas fa-fw fa-user-plus" />
//             {' '}
//             <span>Sign Up</span>
//           </a>
//         </li>
//         <li className="nav-item">
//           <a className="nav-link" href="/login">
//             <i className="fas fa-fw fa-sign-in-alt" />
//             {' '}
//             <span>Log In</span>
//           </a>
//         </li>
//       </ul>
//     </div>
//   </div>
// </nav>
//     );

    const loggedWrapper = (
      <React.Fragment>
        {this.props.children}
        {/* <div id="wrapper">
          <div id="content-wrapper">
            <div className="collapse navbar-collapse mobile-nav" id="mobile-menu">
              <ul className="navbar-nav text-left">
                <div className="card card-account bg-secondary">
                  <div className="card-body">
                    <span className="h5">
                    {this.state.user_exists
                      ? `Hello, ${this.state.user.record.alias}`
                      : 'your name'}</span>
                  </div>
                </div>
                <ul className="nav flex-column">
                  <li className="nav-item">
                    <a className="nav-link" href="/account">
                      <i className="fas fa-fw fa-user" />
                      {' '}
                      <span>My Profile</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/channels">
                      <i className="fas fa-fw fa-comments" />
                      {' '}
                      <span>My Channels</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/invites">
                      <i className="fas fa-fw fa-envelope" />
                      {' '}
                      <span>My Invites</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/contacts">
                      <i className="fas fa-fw fa-id-card" />
                      {' '}
                      <span>My Contacts</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/security">
                      <i className="fas fa-fw fa-lock" />
                      {' '}
                      <span>Security</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/">
                      <i className="fas fa-fw fa-question" />
                      {' '}
                      <span>Help or FAQ</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/">
                      <i className="fas fa-fw fa-info" />
                      {' '}
                      <span>About</span>
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="/#"
                      data-toggle="modal"
                      data-target="#logoutModal"
                    >
                      <i className="fas fa-fw fa-sign-out-alt" />
                      <span>Log Out</span>
                    </a>
                  </li>
                </ul>
              </ul>
            </div>
            {this.props.children}
          </div>
        </div> */}
      </React.Fragment>
    );

    const unloggedNavbar = (
      <React.Fragment>
        <nav className="navbar navbar-expand navbar-custom static-top">
          <div className="container-fluid">
            <a className="navbar-brand" href="/home">
              <span>Metis - Public Test</span>
            </a>

            {/* <button
              className="btn btn-link btn-sm text-white d-block d-lg-none ml-auto"
              href="/#"
              data-toggle="collapse"
              data-target="#mobile-menu"
            >
              <i className="fas fa-fw fa-bars" />
            </button> */}

            <div className="d-none d-lg-block ml-auto">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" href="/signup">
                    <i className="fas fa-fw fa-user-plus" />
                    {' '}
                    <span>Sign Up</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/login">
                    <i className="fas fa-fw fa-sign-in-alt" />
                    {' '}
                    <span>Log In</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="collapse navbar-collapse mobile-nav" id="mobile-menu">
          <ul className="navbar-nav text-left">
            <div className="card card-account bg-secondary">
              <div className="card-body">
                <span className="h5">
                {this.state.user_exists
                  ? `Hello, ${this.state.user.record.alias}`
                  : 'your name'}</span>
              </div>
            </div>
            <ul className="nav flex-column">
              <li className="nav-item">
                <a className="nav-link" href="/account">
                  <i className="fas fa-fw fa-user" />
                  {' '}
                  <span>My Profile</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/channels">
                  <i className="fas fa-fw fa-comments" />
                  {' '}
                  <span>My Channels</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/invites">
                  <i className="fas fa-fw fa-envelope" />
                  {' '}
                  <span>My Invites</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/contacts">
                  <i className="fas fa-fw fa-id-card" />
                  {' '}
                  <span>My Contacts</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/security">
                  <i className="fas fa-fw fa-lock" />
                  {' '}
                  <span>Security</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/">
                  <i className="fas fa-fw fa-question" />
                  {' '}
                  <span>Help or FAQ</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/">
                  <i className="fas fa-fw fa-info" />
                  {' '}
                  <span>About</span>
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="/#"
                  data-toggle="modal"
                  data-target="#logoutModal"
                >
                  <i className="fas fa-fw fa-sign-out-alt" />
                  <span>Log Out</span>
                </a>
              </li>
            </ul>
          </ul>
        </div>
      </React.Fragment>
    );

    const unloggedWrapper = (
      <div className="w-100">
        {unloggedNavbar}
        {this.props.children}
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
            href="/vendor/fontawesome-free/css/all.min.css"
            rel="stylesheet"
          />
          <link
            href="/vendor/fontawesome-free/css/all.min.css"
            rel="stylesheet"
          />
          <link
            href="/vendor/bootstrap/css/bootstrap.min.css"
            rel="stylesheet"
          />

          <link
            href="https://fonts.googleapis.com/css?family=Lato: 300,300i,400,400i"
            rel="stylesheet"
          />

          <link href="/css/sb-admin.css" rel="stylesheet" />
        </head>
        <body>
          <span id="toastrMessages" />
          <div id="metis-notifications" />
          <div
            id={this.props.data.dashboard === true ? 'logged-in' : 'logged-out'}
          >
            {this.props.data.dashboard === true ? loggedHeader : unloggedHeader}


          {this.props.data.dashboard
            ? loggedWrapper
            : unloggedWrapper}

          <div
            className="modal fade"
            id="logoutModal"
            tabIndex="-1"
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
                  Click on “Log Out” if you are ready to end your current session.
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    data-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <a className="btn btn-custom button-link" href="/logout">
                    Log Out
                  </a>
                </div>
              </div>
            </div>
          </div>

          <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js" />

          <script
            src="/bundle.js"
            data-props={JSON.stringify(this.props.data)}
            id="props"
          />
        </body>
      </html>
    );
  }
}
