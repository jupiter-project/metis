import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class AccountComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      alias: this.props.user.record.alias,
      email: this.props.user.record.email,
      firstname: this.props.user.record.firstname,
      lastname: this.props.user.record.lastname,
      account_editing_mode: false,
      saved_alias: this.props.user.record.alias,
      saved_email: this.props.user.record.email,
      saved_firstname: this.props.user.record.firstname,
      saved_lastname: this.props.user.record.lastname,
      submitted: false,
      aliasIsAvailable: true,
    };

    this.handleChange = this.handleChange.bind(this);
    this.switchMode = this.switchMode.bind(this);
    this.updateAccountInfo = this.updateAccountInfo.bind(this);
  }

  componentDidMount() {}

  async aliasCheckup(aliasName) {
    const aliasCheckup = await axios.get(`/jupiter/alias/${aliasName}`);

    return aliasCheckup.data;
  }

  handleChange(aField, event) {
    if (aField === 'email') {
      this.setState({ email: event.target.value });
    } else if (aField === 'firstname') {
      this.setState({ firstname: event.target.value });
    } else if (aField === 'lastname') {
      this.setState({ lastname: event.target.value });
    } else if (aField === 'alias') {
      const self = this;
      const aliasName = event.target.value;
      this.setState({
        alias: aliasName,
      }, async () => {
        const aliasCheckup = await self.aliasCheckup(aliasName);

        let aliasIsAvailable = aliasCheckup.available || false;

        if (aliasCheckup.accountRS === self.props.user.record.account) {
          aliasIsAvailable = true;
        }

        if (!self.state.alias) {
          aliasIsAvailable = false;
        }

        self.setState({
          aliasIsAvailable,
        });
      });
    }
  }

  switchMode(modeType, event) {
    event.preventDefault();
    if (modeType === 'account') {
      this.setState({ account_editing_mode: !this.state.account_editing_mode });
    }
  }


  updateAccountInfo(event) {
    event.preventDefault();
    const page = this;

    this.setState({
      submitted: true,
    });

    axios
      .put('/account', {
        account: {
          firstname: this.state.firstname,
          lastname: this.state.lastname,
          email: this.state.email,
          api_key: this.props.user.api_key,
          public_key: this.props.public_key,
          alias: this.state.alias,
        },
      })
      .then((response) => {
        if (response.data.success === true) {
          page.setState({
            account_editing_mode: false,
            saved_email: page.state.email,
            saved_firstname: page.state.firstname,
            saved_lastname: page.state.lastname,
            saved_alias: page.state.alias,
            submitted: false,
          });
          // toastr.success('It will take a few minutes for the changes to reflect in your end');
          toastr.success('Account update pushed to the blockchain for approval.');
        } else {
          if (
            response.data.validations != null
            && response.data.validations.messages != null
          ) {
            response.data.validations.messages.map((message) => {
              toastr.error(message);
              return null;
            });
          }
          toastr.error(response.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  render() {
    const { state } = this;
    return (
      <div className="container">
        <div className="page-title">Profile</div>
        <div className="card card-register mx-auto mt-5">
          <div className="card-header bg-custom text-light h5">
            Account Information
          </div>
          {this.state.account_editing_mode === true ? (
            <form className="card-body">
              <h6 className="text-center">Account ID</h6>
              <div className="col-xs-12 col-sm-8 mx-auto alert alert-primary text-center">
                <span>{this.state.user ? this.props.user.record.account : 'account id'}</span>
              </div>
              <div className="form-group">
                <label htmlFor="inputEmailAddress">Alias</label>
                <input
                  value={this.state.alias}
                  onChange={this.handleChange.bind(this, 'alias')}
                  type="text"
                  className="form-control"
                  id="inputAliasAddress"
                />
                <div className={`alert ${state.aliasIsAvailable ? 'alert-success' : 'alert-danger'}`}>
                  <i className={ `far ${state.aliasIsAvailable ? 'fa-check-circle' : 'fa-times-circle'}`} />
                  <span>{state.aliasIsAvailable ? ' Alias available' : ' Invalid alias'}</span>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="inputFirstName">First Name</label>

                  <input
                    value={this.state.firstname}
                    onChange={this.handleChange.bind(this, 'firstname')}
                    type="name"
                    className="form-control"
                    id="inputFirstName"
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="inputLastName">Last Name</label>
                  <input
                    value={this.state.lastname}
                    onChange={this.handleChange.bind(this, 'lastname')}
                    type="name"
                    className="form-control"
                    id="inputLastName"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="inputEmailAddress">Email Address</label>
                <input
                  value={this.state.email}
                  onChange={this.handleChange.bind(this, 'email')}
                  type="email"
                  className="form-control"
                  id="inputEmailAddress"
                />
              </div>
              <div className="form-row mt-2">
                <div className="col">
                  <button
                    type="button"
                    className="btn btn-custom"
                    onClick={this.updateAccountInfo.bind(this)}
                    disabled={this.state.submitted || !this.state.aliasIsAvailable}
                  >
                    {this.state.submitted ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <div className="col text-right">
                  <button
                    type="button"
                    className="btn btn-secondary ml-auto"
                    onClick={this.switchMode.bind(this, 'account')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form className="card-body">
              <h6 className="text-center">Account ID</h6>
              <div className="col-xs-12 col-sm-8 mx-auto alert alert-primary text-center">
                <span>{this.state.user ? this.props.user.record.account : 'account id'}</span>
              </div>
              <div className="form-group">
                <label htmlFor="inputEmailAddress">Alias</label>
                <input
                  value={this.state.alias}
                  type="alias"
                  className="form-control"
                  id="inputAliasAddress"
                  disabled
                />
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="inputFirstName">First Name</label>

                  <input
                    value={this.state.saved_firstname}
                    type="name"
                    className="form-control"
                    id="inputFirstName"
                    disabled
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="inputLastName">Last Name</label>
                  <input
                    value={this.state.saved_lastname}
                    type="name"
                    className="form-control"
                    id="inputLastName"
                    disabled
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="inputEmailAddress">Email Address</label>
                <input
                  value={this.state.saved_email}
                  type="email"
                  className="form-control"
                  id="inputEmailAddress"
                  disabled
                />
              </div>
              <div className="form-row mt-2">
                <div className="mx-auto">
                  <button
                    type="button"
                    className="btn btn-custom"
                    onClick={this.switchMode.bind(this, 'account')}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }
}

const AccountExport = () => {
  if (document.getElementById('account-section') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <AccountComponent user={props.user} messages={props.messages} />,
      document.getElementById('account-section'),
    );
  }
};

module.exports = AccountExport();
