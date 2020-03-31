/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class NewAccountComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      alias: '',
      email: '',
      firstname: '',
      lastname: '',
      editMode: false,
      submitted: false,
      aliasIsAvailable: true,
    };
  }

  handleChange = (event) => {
    const { target } = event;
    if (target.name === 'alias') {
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

        await self.setState({
          aliasIsAvailable,
        });
      });
    } else {
      const { value } = target;
      const { name } = target;
      this.setState({
        [name]: value,
      });
    }
  }

  changeEditMode = (e) => {
    const { editMode } = this.state;
    this.setState({
      editMode: !editMode,
    });
    e.preventDefault();
  }

  updateValue = (e) => {
    const page = this;
    const {
      alias,
      email,
      firstname,
      lastname,
      aliasIsAvailable,
    } = this.state;
    const { props } = this;

    page.setState({
      submitted: true,
    });

    if (aliasIsAvailable) {
      axios.put('/account', {
        account: {
          alias,
          email,
          firstname,
          lastname,
          api_key: props.user.api_key,
          public_key: props.public_key,
        },
      }).then((response) => {
        if (response.data.success) {
          page.setState({
            editMode: false,
            submitted: false,
          });
          console.log(response.data);
          toastr.success('Account update pushed to the blockchain for approval.');
        } else {
          page.setState({
            editMode: false,
            submitted: false,
          });
          toastr.error('There was an error');
        }
      }).catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
    } else {
      toastr.error('That alias is not available.');
      page.setState({
        editMode: false,
        submitted: false,
        alias: props.user.record.alias,
      });
    }

    e.preventDefault();
  }

  saveButtons = () => {
    const { submitted } = this.state;
    return (
      <React.Fragment>
        <div className="form-row mt-2">
          <div className="col">
            <button
              type="button"
              className="btn btn-custom"
              onClick={this.updateValue}
              disabled={submitted}
            >
              {submitted ? 'Saving...' : 'Save'}
            </button>
          </div>
          <div className="col text-right">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={this.changeEditMode}
              disabled={submitted}
            >
              Cancel
            </button>
          </div>
        </div>
      </React.Fragment>
    );
  };

  editButtons = () => (
    <React.Fragment>
      <div className="form-row mt-2">
        <div className="ml-auto">
          <button
            type="button"
            className="btn btn-custom"
            onClick={this.changeEditMode}
          >
            Edit
          </button>
        </div>
      </div>
    </React.Fragment>
  );

  editView = () => {
    const {
      alias,
      fistname,
      lastname,
      email,
      aliasIsAvailable,
    } = this.state;
    const { user } = this.props;
    return (
      <React.Fragment>
        <div className="form-group">
          <label htmlFor="alias" className="d-block">
            <div className="mb-2">Alias</div>
            <input
              type="text"
              className="form-control"
              name="alias"
              value={alias}
              placeholder={user.record.alias}
              onChange={this.handleChange}
            />
          </label>
        </div>
        <div className={`alert ${aliasIsAvailable ? 'alert-success' : 'alert-danger'}`}>
          <i className={`far ${aliasIsAvailable ? 'fa-check-circle' : 'fa-times-circle'}`} />
          <span>{aliasIsAvailable ? ' Alias available' : ' Invalid alias'}</span>
        </div>
        <div className="form-row mb-0">
          <div className="form-group col">
            <label htmlFor="fistname" className="d-block m-0">
              <div className="mb-2">First Name</div>
              <input
                type="text"
                className="form-control"
                name="fistname"
                value={fistname}
                placeholder={user.record.fistname}
                onChange={this.handleChange}
              />
            </label>
          </div>
          <div className="form-group col">
            <label htmlFor="lastname" className="d-block m-0">
              <div className="mb-2">Last Name</div>
              <input
                type="text"
                className="form-control"
                name="lastname"
                value={lastname}
                onChange={this.handleChange}
              />
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email" className="d-block">
            <div className="mb-2">Email</div>
            <input
              type="text"
              className="form-control"
              name="email"
              value={email}
              onChange={this.handleChange}
            />
          </label>
        </div>
      </React.Fragment>
    );
  };

  defaultView = () => {
    const {
      alias,
      email,
      firstname,
      lastname,
    } = this.state;
    const { user } = this.props;
    return (
      <React.Fragment>
        <div className="form-group">
          <label htmlFor="alias" className="d-block">
            <div className="mb-2">Alias</div>
            <input
              type="text"
              className="form-control"
              name="alias"
              value={alias || user.record.alias}
              readOnly
            />
          </label>
        </div>
        <div className="form-row mb-0">
          <div className="form group col">
            <label htmlFor="fistname" className="d-block m-0">
              <div className="mb-2">First Name</div>
              <input
                type="text"
                className="form-control"
                name="fistname"
                value={firstname || user.record.firstname}
                readOnly
              />
            </label>
          </div>
          <div className="form-group col">
            <label htmlFor="lastname" className="d-block m-0">
              <div className="mb-2">Last Name</div>
              <input
                type="text"
                className="form-control"
                name="lastname"
                value={lastname || user.record.lastname}
                readOnly
              />
            </label>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email" className="d-block">
            <div className="mb-2">Email</div>
            <input
              type="text"
              className="form-control"
              name="email"
              value={email || user.record.email}
              readOnly
            />
          </label>
        </div>
      </React.Fragment>
    );
  }

  async aliasCheckup(aliasName) {
    const aliasCheckup = await axios.get(`/jupiter/alias/${aliasName}`);

    return aliasCheckup.data;
  }

  render() {
    const { editMode } = this.state;
    const { user } = this.props;
    return (
      <div className="container">
        <div className="page-title">My Profile</div>
        <div className="card card-register mx-auto mt-5">
          <div className="card-header bg-custom text-light h5">
            Account Information
          </div>
          <form className="card-body mb-0">
            <h6 className="text-center">Account ID</h6>
            <div className="col-xs-12 col-sm-8 mx-auto alert alert-primary text-center">
              <span>{user ? user.record.account : 'account id'}</span>
            </div>
            {editMode ? this.editView() : this.defaultView()}
            {editMode ? this.saveButtons() : this.editButtons()}
          </form>
        </div>
      </div>
    );
  }
}

const NewAccountExport = () => {
  if (document.getElementById('new-account-section') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <NewAccountComponent user={props.user} messages={props.messages} />,
      document.getElementById('new-account-section'),
    );
  }
};

module.exports = NewAccountExport();
