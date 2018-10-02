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

    const readOnly = (
      <tr className="text-center" key={`row-${(channelInfo.id)}-data`}>
          <td>{channelInfo.channel_record.name}</td>
          <td>{channelInfo.channel_record.account}</td>
          <td>{this.state.date}</td>
          <td>{this.state.confirmed ? 'Yes' : 'No'}</td>
          { /* <td>
              <button className="btn btn-success" onClick={this.editMode.bind(this)}>Edit</button>
          </td> */}
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
          console.log(response.data);
          page.setState({
            channels: response.data.channels,
          });
          page.monitorData();
        } else {
          toastr.error('No record history');
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
            toastr.success('Update submitted to the blockchain. It might take a few minutes for the changes to be shown below.');
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
    }, 5000);
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
          toastr.success('Channel record submitted to the blockchain. It might take a few minutes for record to be shown below.');
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

    return (
        <div className="container-fluid card">
            <h1 className="page-title"></h1>

            <div className="">
                <div className="">
                    <div className="card col-md-8 col-lg-8 p-0 mx-auto my-4">
                        <div className="card-header">
                            Record Channel
                        </div>
                        <div className="card-body form-group">
                            <div className="row p-2">
                                <div className="col-lg-12 col-md-12">
                                    <label>name</label>
                                    <input placeholder="" value={this.state.name } className="form-control" onChange={this.handleChange.bind(this, 'name')} /><br />
                                </div>
                            </div>
                            <div className="row p-3">
                                <div className="col-lg-12 col-md-12 col-xs-12 text-center">
                                    <button type="button" className="btn btn-outline btn-default" disabled={this.state.submitted} onClick={this.createRecord.bind(this)}><i className="glyphicon glyphicon-edit"></i>  {this.state.submitted ? 'Saving...' : 'Save'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <table className="table table-striped table-bordered table-hover">
                <thead>
                    <tr>
                        <th>name</th>
                        <th>account</th>
                        <th>Created On</th>
                        <th>Confirmed</th>
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
