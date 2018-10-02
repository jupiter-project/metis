import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class DataRow extends React.Component {
  constructor(props) {
    super(props);
    const invite = this.props.parent.state.invites[this.props.invite];
    const record = invite.channel;
    this.state = {
      inviteData: this.props.parent.state.invites[this.props.invite].channel,
      account: record.account,
      name: record.name,
      invites: [],
      edit_mode: false,
      confirmed: record.confirmed,
      date: (new Date(record.date)).toLocaleString(),
      submitted: false,
      invitationAccount: '',
      channel_record: record.channel_record,
    };
    this.handleChange = this.handleChange.bind(this);
    this.acceptInvite = this.acceptInvite.bind(this);
  }

  componentDidMount() {
    console.log(this.state.channel_record);
  }

  handleChange(aField, event) {
    this.setState({
      [aField]: event.target.value,
    });
  }

  acceptInvite(event) {
    event.preventDefault();

    }

  render() {
    const inviteInfo = this.props.parent.state.invites[this.props.invite].channel;

    const inviteComponent = (
    <div
      className="modal fade"
      id="inviteInvite"
      tabIndex="-1"
      role="dialog"
      aria-labelledby=" "
      aria-hidden="true"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id=" ">
              Invite to this invite
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
            By clicking 'Accept', your account will be permanently linked to this channel.<br />
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              type="button"
              data-dismiss="modal"
            >
              Cancel
            </button>
            <a className="btn btn-secondary" onClick={this.acceptInvite.bind(this)}>
              Accept
            </a>
          </div>
        </div>
      </div>
    </div>);

    const readOnly = (
      <tr className="text-center" key={`row-${(inviteInfo.id)}-data`}>
          <td>{inviteInfo.channel_record.name}</td>
          <td>{inviteInfo.channel_record.account}</td>
          <td>{this.state.date}</td>
          <td>
            <a
                className="dropdown-item"
                href="#"
                data-toggle="modal"
                data-target="#inviteInvite"
              >
                <i className="fa fa-fw fa-sign-out" />
                {' '}
                <span>Accept</span>
              </a>
          </td>
          { /* <td>
              <button className="btn btn-success" onClick={this.editMode.bind(this)}>Edit</button>
          </td> */}
          {inviteComponent}
      </tr>
    );

    return (
      this.state.edit_mode ? readOnly : readOnly
    );
  }
}

class InvitesComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      invites: [],
      submitted: false,
      update_submitted: false,
    };
    this.handleChange = this.handleChange.bind(this);
  }


  componentDidMount() {
    this.loadInvites();
  }

  loadInvites() {
    const page = this;

    axios.get('/channels/invites')
      .then((response) => {
        console.log(response.data);
        if (response.data.records) {
          page.setState({
            invites: response.data.records,
          });
        } else {
          toastr.error('No invites');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  handleChange(aField, event) {
    if (aField === 'name') {
      this.setState({ name: event.target.value });
    }
  }


  render() {
    const self = this;

    const recordList = (
      this.state.invites.map((invite, index) => <DataRow
          parent={self}
          invite={index}
          user={self.props.user}
          public_key={self.props.public_key}
          key={`row${(invite.id)}`}
          />)
    );

    return (
        <div className="container-fluid card">
            <h1 className="page-title"></h1>
            <table className="table table-striped table-bordered table-hover">
                <thead>
                    <tr>
                        <th>Channel Name</th>
                        <th>Sender</th>
                        <th>Created On</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {recordList}
                </tbody>
            </table>
        </div>
    );
  }
}

const InvitesExport = () => {
  if (document.getElementById('invitesComponent') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <InvitesComponent
      user={props.user}
      validation={props.validation}
      public_key={props.public_key}
      accessData = {props.accessData}
      />,
      document.getElementById('invitesComponent'),
    );
  }
};

module.exports = InvitesExport();
