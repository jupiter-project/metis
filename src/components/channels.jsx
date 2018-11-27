import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class DataRow extends React.Component {
  constructor(props) {
    super(props);
    const channel = this.props.parent.state.channels[this.props.channel];
    const record = channel.channel_record;

    this.state = {
      channelData: this.props.parent.state.channels[this.props.channel],
      passphrase: record.passphrase,
      account: record.account,
      name: record.name,
      password: record.password,
      channels: [],
      edit_mode: false,
      confirmed: record.confirmed,
      date: (new Date(channel.date)).toLocaleString(),
      submitted: false,
      invitationAccount: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.updateRecord = this.updateRecord.bind(this);
    this.editMode = this.editMode.bind(this);
  }

  handleChange(aField, event) {
    this.setState({
      [aField]: event.target.value,
    });
  }


  updateRecord(event) {
    event.preventDefault();
    const page = this;
    this.setState({
      submitted: true,
    });

    this.props.parent.setState({
      update_submitted: true,
    });

    const record = {
      id: this.state.channelData.id,
      name: this.state.name,
      address: this.props.user.record.account,
      date_confirmed: Date.now(),
      user_id: this.props.user.id,
      user_api_key: this.props.user.record.api_key,
      public_key: this.props.public_key,
      user_address: this.props.user.record.account,
      user_data: this.props.user,
    };

    axios.put('/api/channels', { data: record })
      .then((response) => {
        if (response.data.success) {
          page.setState({
            submitted: false,
            edit_mode: false,
          });

          page.props.parent.setState({
            update_submitted: false,
          });

          toastr.success(' Update submitted to the blockchain.');
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

  editMode(event) {
    event.preventDefault();
    this.setState({
      edit_mode: !this.state.edit_mode,
    });
  }

  inviteUser(event) {
    event.preventDefault();
    const page = this;
    const invite = {
      recipient: this.state.invitationAccount,
      channel: this.state.channelData,
    };

    axios.post('/channels/invite', { data: invite })
      .then((response) => {
        console.log(response);
        if (response.data.success) {
          page.props.parent.setState({
            update_submitted: false,
          });

          toastr.success('Invite sent!');
        } else {
          toastr.error('There was an error in sending your invite');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  render() {
    /* const form = (
        <tr className="text-center">
            <td>
                <input placeholder="" value={this.state.name }
                className="form-control" onChange={this.handleChange.bind(this, 'account')} /><br />
            </td>
            <td>{this.state.date}</td>
            <td>
                <button className="btn btn-danger"
                onClick={this.editMode.bind(this)}>Cancel</button><br /><br />
                <button className="btn btn-success"
                disabled={this.state.submitted} onClick={this.updateRecord.bind(this)}>
                {this.state.submitted ? 'Saving...' : 'Save'}</button>
            </td>
        </tr>
    ); */

    const channelInfo = this.props.parent.state.channels[this.props.channel];

    const inviteComponent = (
    <div
      className="modal fade"
      id="channelInvite"
      tabIndex="-1"
      role="dialog"
      aria-labelledby=" "
      aria-hidden="true"
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id=" ">
              Invite to this channel
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
            {/* Use this form to invite another user to this channel. Please write the
            JUP account you wish to invite below and press on the Invite button. */}
            <p>
              To invite another user to this channel,
              simply input the JUP Address below and click "Invite".
            </p>
            <div className="form-group">
              <input className="form-control" value={this.state.invitationAccount} onChange={this.handleChange.bind(this, 'invitationAccount')} />
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              type="button"
              data-dismiss="modal"
            >
              Cancel
            </button>
            <button className="btn btn-custom" onClick={this.inviteUser.bind(this)} data-dismiss="modal">
              Invite
            </button>
          </div>
        </div>
      </div>
    </div>);

    const readOnly = (
      <tr className="text-center" key={`row-${(channelInfo.id)}-data`}>
          <td><a className="btn btn-link" href={`/channels/${this.state.channelData.id}`}>{channelInfo.channel_record.name}</a></td>
          <td>{channelInfo.channel_record.account}</td>
          <td>{this.state.date}</td>
          <td>{this.state.confirmed ? <i className="fas fa-fw fa-check" /> : <i className="fas fa-fw fa-times" />}</td>
          <td>
            <a
                className="btn btn-custom"
                href="#"
                data-toggle="modal"
                data-target="#channelInvite"
              >
                <i className="fas fa-fw fa-user-plus" />
                {' '}
                <span>Invite</span>
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

class ChannelsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passphrase: '',
      name: '',
      password: '',
      channels: [],
      submitted: false,
      update_submitted: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.createRecord = this.createRecord.bind(this);
  }


  componentDidMount() {
    this.loadData();
  }

  resetRecords(newData) {
    this.setState({
      channels: newData,
    });
  }

  loadData() {
    const page = this;
    const config = {
      headers: {
        user_api_key: this.props.user.record.api_key,
        user_public_key: this.props.public_key,
        accessData: this.props.accessData,
      },
    };

    axios.get(`/api/users/${this.props.user.id}/channels`, config)
      .then((response) => {
        if (response.data.success) {
          console.log('Response channel');
          console.log(response.data);
          page.setState({
            channels: response.data.channels,
            channelTableExist: true,
          });
          page.monitorData();
        } else {
          toastr.error('No record table in database.');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  checkUpdates() {
    const self = this;
    const currentData = JSON.stringify(this.state.channels);
    const config = {
      headers: {
        user_api_key: this.props.user.record.api_key,
        user_public_key: this.props.public_key,
        accessData: this.props.accessData,
      },
    };

    axios.get(`/api/users/${this.props.user.id}/channels`, config)
      .then((response) => {
        if (response.data.success) {
          console.log(response.data);
          const responseData = response.data.channels;

          if (currentData !== JSON.stringify(responseData)) {
            self.resetRecords(responseData);
          }
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error("Could not connect to server. Unable to check and update page's records.");
      });
  }

  monitorData() {
    const self = this;

    setInterval(() => {
      if (!(self.state.submitted || self.state.update_submitted)) {
        self.checkUpdates();
      }
    }, 3000);
  }


  handleChange(aField, event) {
    if (aField === 'passphrase') {
      this.setState({ passphrase: event.target.value });
    } else if (aField === 'name') {
      this.setState({ name: event.target.value });
    } else if (aField === 'password') {
      this.setState({ password: event.target.value });
    }
  }

  createRecord(event) {
    event.preventDefault();
    this.setState({
      submitted: true,
    });

    const page = this;

    const record = {
      passphrase: this.state.passphrase,
      name: this.state.name,
      password: this.state.password,
      address: this.props.user.record.account,
      date_confirmed: Date.now(),
      user_id: this.props.user.id,
      user_api_key: this.props.user.record.api_key,
      public_key: this.props.public_key,
      user_address: this.props.user.record.account,
    };

    axios.post('/api/channels', { data: record, user: this.props.accessData })
      .then((response) => {
        if (response.data.success) {
          page.setState({
            passphrase: '',
            name: '',
            password: '',
            submitted: false,
          });
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


  render() {
    const self = this;

    const recordList = (
      this.state.channels.map((channel, index) => <DataRow
          parent={self}
          channel={index}
          user={self.props.user}
          public_key={self.props.public_key}
          key={`row${(channel.id)}`}
          />)
    );

    const newChannelForm = (
      <div className="card card-register mx-auto my-5">
        <div className="card-header bg-custom text-light h5">
          Add New Channel
        </div>
        <div className="card-body">
          <div className="form-group">
            <input placeholder="Enter new channel name here..." value={this.state.name } className="form-control" onChange={this.handleChange.bind(this, 'name')} />
          </div>
          <div className="text-center">
            <button type="button" className="btn btn-custom" disabled={this.state.submitted} onClick={this.createRecord.bind(this)}><i className="glyphicon glyphicon-edit"></i>  {this.state.submitted ? 'Adding Channel...' : 'Add Channel'}</button>
          </div>
        </div>
      </div>);

    return (
      <div className="container-fluid card-plain">
        { this.state.channels.length > 0 || this.state.channelTableExist
          ? newChannelForm
          : <div className=" text-center alert alert-warning">Cannot create channels yet, confirming account details in the blockchain</div>}
        <div className="page-title">My Channels</div>

        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover">
            <thead>
              <tr className="text-center">
                <th>Name</th>
                <th>Account</th>
                <th>Created On</th>
                <th>Confirmed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recordList}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const ChannelsExport = () => {
  if (document.getElementById('ChannelsComponent') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <ChannelsComponent
      user={props.user}
      validation={props.validation}
      public_key={props.public_key}
      accessData = {props.accessData}
      />,
      document.getElementById('ChannelsComponent'),
    );
  }
};

module.exports = ChannelsExport();
