import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class UserListComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      accounthash: '',
      email: '',
      firstname: '',
      lastname: '',
      secret_key: '',
      twofa_enabled: true,
      twofa_completed: true,
      api_key: '',
      users: [],
    };
    this.handleChange = this.handleChange.bind(this);
    this.recordUser = this.recordUser.bind(this);
    this.twofaEnabledUpdate = this.twofaEnabledUpdate.bind(this);
    this.twofaCompletedUpdate = this.twofaCompletedUpdate.bind(this);
  }

  componentDidMount() {
    const page = this;

    axios.get('/api/users')
      .then((response) => {
        if (response.data.success === true) {
          page.setState({
            users: response.data.users,
          });
          console.log(response.data);
        } else {
          console.log(response.data);
          toastr.error('No User history');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }


  handleChange(aField, event) {
    if (aField === 'account') {
      this.setState({ account: event.target.value });
    } else if (aField === 'accounthash') {
      this.setState({ accounthash: event.target.value });
    } else if (aField === 'email') {
      this.setState({ email: event.target.value });
    } else if (aField === 'firstname') {
      this.setState({ firstname: event.target.value });
    } else if (aField === 'lastname') {
      this.setState({ lastname: event.target.value });
    } else if (aField === 'secret_key') {
      this.setState({ secret_key: event.target.value });
    } else if (aField === 'twofa_enabled') {
      this.setState({ twofa_enabled: event.target.value });
    } else if (aField === 'twofa_completed') {
      this.setState({ twofa_completed: event.target.value });
    } else if (aField === 'api_key') {
      this.setState({ api_key: event.target.value });
    }
  }

  recordUser(event) {
    event.preventDefault();
    const page = this;

    axios.post('/api/users', {
      account: this.state.account,
      accounthash: this.state.accounthash,
      email: this.state.email,
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      secret_key: this.state.secret_key,
      twofa_enabled: this.state.twofa_enabled,
      twofa_completed: this.state.twofa_completed,
      // api_key: this.state.api_key,
      address: this.props.user.record.account,
      date_confirmed: Date.now(),
      api_key: this.props.user.api.generated_key,
    })
      .then((response) => {
        if (response.data.success === true) {
          page.setState({
            account: '',
            accounthash: '',
            email: '',
            firstname: '',
            lastname: '',
            secret_key: '',
            twofa_enabled: true,
            twofa_completed: true,
            api_key: '',
          });
          console.log(response.data);
          toastr.success('User record submitted to the blockchain.');
        } else {
          // console.log(response.data);
          // toastr.error(response.data.message);
          response.data.validations.messages.map((message) => {
            toastr.error(message);
            return null;
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  twofaEnabledUpdate() {
    const newValue = !this.state.twofa_enabled;
    this.setState({ twofa_enabled: newValue });
  }

  twofaCompletedUpdate() {
    const newValue = !this.state.twofa_completed;
    this.setState({ twofa_completed: newValue });
  }

  render() {
    const userList = (
      this.state.users.map((user, index) => (
          <tr className="text-center" key={`user-${index}`}>
                <td>{user.user_record.account}</td>
                <td>{user.user_record.accounthash}</td>
                <td>{user.user_record.email}</td>
                <td>{user.user_record.firstname}</td>
                <td>{user.user_record.lastname}</td>
                <td>{user.user_record.secret_key}</td>
                <td>{String(user.user_record.twofa_enabled)}</td>
                <td>{String(user.user_record.twofa_completed)}</td>
                <td>{user.user_record.api_key}</td>
          </tr>
      ))
    );

    return (
        <div className="container-fluid">
            <h1 className="page-title"></h1>
            <div className="row">
                <div className="col-lg-6 col-md-6">
                    <div className="panel panel-primary">
                        <div className="panel-heading text-center lead">
                            Record User
                        </div>
                        <div className="form-group row">
                            <div className="col-lg-6 col-md-6">
                                <label>account</label>
                                <input placeholder="" value={this.state.account } className="form-control" onChange={this.handleChange.bind(this, 'account')} /><br />
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-6 col-md-6">
                                <label>accounthash</label>
                                <input placeholder="" value={this.state.accounthash } className="form-control" onChange={this.handleChange.bind(this, 'accounthash')} /><br />
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-6 col-md-6">
                                <label>email</label>
                                <input placeholder="" value={this.state.email } className="form-control" onChange={this.handleChange.bind(this, 'email')} /><br />
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-6 col-md-6">
                                <label>firstname</label>
                                <input placeholder="" value={this.state.firstname } className="form-control" onChange={this.handleChange.bind(this, 'firstname')} /><br />
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-6 col-md-6">
                                <label>lastname</label>
                                <input placeholder="" value={this.state.lastname } className="form-control" onChange={this.handleChange.bind(this, 'lastname')} /><br />
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-6 col-md-6">
                                <label>secret_key</label>
                                <input placeholder="" value={this.state.secret_key } className="form-control" onChange={this.handleChange.bind(this, 'secret_key')} /><br />
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-6 col-md-6">
                                <label>twofa_enabled</label>
                                <div className="status-toggle">
                                    <label className={'switch'}>
                                        <input type="checkbox" onChange={this.twofaEnabledUpdate.bind(this)} checked={this.state.twofa_enabled || false} />
                                        <span className={'slider round'}></span>
                                    </label><br />
                                </div>
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-6 col-md-6">
                                <label>twofa_completed</label>
                                <div className="status-toggle">
                                    <label className={'switch'}>
                                        <input type="checkbox" onChange={this.twofaCompletedUpdate.bind(this)} checked={this.state.twofa_completed || false} />
                                        <span className={'slider round'}></span>
                                    </label><br />
                                </div>
                            </div>
                            <div className="clearfix"></div>
                            <div className="col-lg-6 col-md-6">
                                <label>api_key</label>
                                <input placeholder="" value={this.state.api_key } className="form-control" onChange={this.handleChange.bind(this, 'api_key')} /><br />
                            </div>
                            <div className="clearfix"></div>
                            <br />
                            <div className="col-lg-12 col-md-12 col-xs-12 text-center">
                                <button type="button" className="btn btn-outline btn-default" onClick={ this.recordUser.bind(this)}><i className="glyphicon glyphicon-edit"></i>  Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <table className="table table-striped table-bordered table-hover">
                <thead>
                    <tr>
                        <th>account</th>
                        <th>accounthash</th>
                        <th>email</th>
                        <th>firstname</th>
                        <th>lastname</th>
                        <th>secret_key</th>
                        <th>twofa_enabled</th>
                        <th>twofa_completed</th>
                        <th>api_key</th>
                    </tr>
                </thead>
                <tbody>
                    {userList}
                </tbody>
            </table>

        </div>
    );
  }
}

const UserListExport = () => {
  if (document.getElementById('UserListComponent') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(<UserListComponent user= {props.user} validation={props.validation} />,
      document.getElementById('UserListComponent'));
  }
};

module.exports = UserListExport();
