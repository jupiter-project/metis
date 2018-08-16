import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class AccountComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
      email: this.props.user.record.email,
      firstname: this.props.user.record.firstname,
      lastname: this.props.user.record.lastname,
      account_editing_mode: false,
      saved_email: this.props.user.record.email,
      saved_firstname: this.props.user.record.firstname,
      saved_lastname: this.props.user.record.lastname,
      submitted: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.switchMode = this.switchMode.bind(this);
    this.updateAccountInfo = this.updateAccountInfo.bind(this);
  }

  handleChange(aField, event) {
    if (aField === 'email') {
      this.setState({ email: event.target.value });
    } else if (aField === 'firstname') {
      this.setState({ firstname: event.target.value });
    } else if (aField === 'lastname') {
      this.setState({ lastname: event.target.value });
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
    const account = {
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      email: this.state.email,
      api_key: this.props.user.record.api_key,
      public_key: this.props.public_key,
    };

    axios.put('/account', {
      account,
    })
      .then((response) => {
        if (response.data.success === true) {
          page.setState({
            account_editing_mode: false,
            saved_email: page.state.email,
            saved_firstname: page.state.firstname,
            saved_lastname: page.state.lastname,
            submitted: false,
          });
          toastr.success('It will take a few minutes for the changes to reflect in your end');
          toastr.success('Account update pushed to the blockchain for approval.');
        } else {
          if (response.data.validations != null && response.data.validations.messages != null) {
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
    return (
        <div className="">
                <h1 className="page-title text-center">My Account</h1>
                <div className="row">
                    <div className="card card-register mx-auto my-4">
                            <h3 className="card-header bg-dark text-white">
                                Account information
                            </h3>
                            {this.state.account_editing_mode === true
                              ? <form className="card-body">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <div className="col-md-6 col-lg-6 p-3">
                                            <label htmlFor="inputFirstName">First Name</label>
                                            <input value={this.state.firstname} onChange={this.handleChange.bind(this, 'firstname')} type="name" className="form-control" id="inputFirstName"/>
                                            </div>
                                            <div className="col-md-6 col-lg-6 p-3">
                                            <label htmlFor="inputLastName">Last Name</label>
                                            <input value={this.state.lastname} onChange={this.handleChange.bind(this, 'lastname')} type="name" className="form-control" id="inputLastName"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inputEmailAddress">Email Address</label>
                                        <input value={this.state.email} onChange={this.handleChange.bind(this, 'email')} type="email" className="form-control" id="inputEmailAddress"/>
                                    </div>
                                    <div className="form-row">
                                        <div className="col">
                                            <button type="button" className="btn btn-success" onClick={this.updateAccountInfo.bind(this)} disabled={this.state.submitted}>
                                                <i className="glyphicon glyphicon-edit"></i> {this.state.submitted ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                        <div className="col text-right">
                                            <button type="button" className="btn btn-danger ml-auto" onClick={this.switchMode.bind(this, 'account')}>
                                                <i className="glyphicon glyphicon-edit"></i>  Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                              : <form className="card-body">
                                    <div className="form-row">
                                        <div className="form-group col-md-6">
                                        <label htmlFor="inputFirstName">First Name</label>
                                        <input value={this.state.saved_firstname} type="name" className="form-control" id="inputFirstName" disabled/>
                                        </div>
                                        <div className="form-group col-md-6">
                                        <label htmlFor="inputLastName">Last Name</label>
                                        <input value={this.state.saved_lastname} type="name" className="form-control" id="inputLastName" disabled/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inputEmailAddress">Email Address</label>
                                        <input value={this.state.saved_email} type="email" className="form-control" id="inputEmailAddress" disabled/>
                                    </div>
                                    <div className="form-row">
                                        <div className="col">
                                            <button type="button" className="btn btn-default" onClick={this.switchMode.bind(this, 'account')}><i className="glyphicon glyphicon-edit"></i> Edit</button>
                                        </div>
                                        <div className="col text-right">
                                            <button type="button" className="btn btn-default ml-auto" disabled>Cancel</button>
                                        </div>
                                    </div>
                                </form>

                            }
                    </div>
                </div>
        </div>
    );
  }
}


const AccountExport = () => {
  if (document.getElementById('account-section') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(<AccountComponent user={props.user} messages={props.messages} />, document.getElementById('account-section'));
  }
};


module.exports = AccountExport();
