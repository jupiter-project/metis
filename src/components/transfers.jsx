import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class DataRow extends React.Component {
  constructor(props) {
    super(props);
    const transfer = this.props.parent.state.transfers[this.props.transfer];
    const record = transfer.transfer_record;

    this.state = {
      transferData: this.props.parent.state.transfers[this.props.transfer],
      recipient: record.recipient,
      amount: parseFloat(record.amount) / 100000000,
      balanceAtTransfer: parseFloat(record.balanceAtTransfer) / 100000000,
      notes: record.notes,
      transfers: [],
      edit_mode: false,
      confirmed: record.confirmed,
      date: (new Date(transfer.date)).toLocaleString(),
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
      id: this.state.transferData.id,
      recipient: this.state.recipient,
      amount: parseInt(parseFloat(this.state.amount) * 100000000, 10),
      balanceAtTransfer: parseInt(parseFloat(this.state.balanceAtTransfer) * 100000000, 10),
      notes: this.state.notes,
      address: this.props.user.record.account,
      date_confirmed: Date.now(),
      user_id: this.props.user.id,
      user_api_key: this.props.user.record.api_key,
      public_key: this.props.public_key,
      user_address: this.props.user.record.account,
    };

    axios.put('/api/transfers', { data: record })
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
    const form = (
        <tr className="text-center">
            <td>
                <input placeholder="" value={this.state.recipient } className="form-control" onChange={this.handleChange.bind(this, 'recipient')} /><br />
            </td>
            <td>
                <input type="number" step="0.00000001" value={this.state.amount } onChange={this.handleChange.bind(this, 'amount')} className="form-control" />
            </td>
            <td>
                <input type="number" step="0.00000001" value={this.state.balanceAtTransfer } onChange={this.handleChange.bind(this, 'balanceAtTransfer')} className="form-control" />
            </td>
            <td>
                <input placeholder="" value={this.state.notes } className="form-control" onChange={this.handleChange.bind(this, 'notes')} /><br />
            </td>
            <td>{this.state.date}</td>
            <td>{this.state.confirmed}</td>
            <td>
                <button className="btn btn-danger" onClick={this.editMode.bind(this)}>Cancel</button><br /><br />
                <button className="btn btn-success" disabled={this.state.submitted} onClick={this.updateRecord.bind(this)}>{this.state.submitted ? 'Saving...' : 'Save'}</button>
            </td>
        </tr>
    );

    const transferInfo = this.props.parent.state.transfers[this.props.transfer];

    const readOnly = (
      <tr className="text-center" key={`row-${(transferInfo.id)}-data`}>
          <td>{transferInfo.transfer_record.recipient}</td>
          <td>{parseFloat(transferInfo.transfer_record.amount) / 100000000}</td>
          <td>{parseFloat(transferInfo.transfer_record.balanceAtTransfer) / 100000000}</td>
          <td>{transferInfo.transfer_record.notes}</td>
          <td>{this.state.date}</td>
          <td>{this.state.confirmed ? 'Yes' : 'No'}</td>
          <td>
              <button className="btn btn-success" onClick={this.editMode.bind(this)}>Edit</button>
          </td>
      </tr>
    );

    return (
      this.state.edit_mode ? form : readOnly
    );
  }
}

class TransfersComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recipient: '',
      amount: '',
      balanceAtTransfer: '',
      notes: '',
      transfers: [],
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
      transfers: newData,
    });
  }

  loadData() {
    const page = this;
    const config = {
      headers: {
        user_api_key: this.props.user.record.api_key,
        user_public_key: this.props.public_key,
      },
    };

    axios.get(`/api/users/${this.props.user.id}/transfers`, config)
      .then((response) => {
        if (response.data.success) {
          page.setState({
            transfers: response.data.transfers,
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
    const currentData = JSON.stringify(this.state.transfers);
    const config = {
      headers: {
        user_api_key: this.props.user.record.api_key,
        user_public_key: this.props.public_key,
      },
    };

    axios.get(`/api/users/${this.props.user.id}/transfers`, config)
      .then((response) => {
        if (response.data.success) {
          const responseData = response.data.transfers;

          if (currentData !== JSON.stringify(responseData)) {
            self.resetRecords(responseData);
            // toastr.success('Updates received');
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  monitorData() {
    const self = this;

    setInterval(() => {
      if (!(self.state.submitted || self.state.update_submitted)) {
        self.checkUpdates();
      }
    }, 1000);
  }


  handleChange(aField, event) {
    if (aField === 'recipient') {
      this.setState({ recipient: event.target.value });
    } else if (aField === 'amount') {
      this.setState({ amount: event.target.value });
    } else if (aField === 'balanceAtTransfer') {
      this.setState({ balanceAtTransfer: event.target.value });
    } else if (aField === 'notes') {
      this.setState({ notes: event.target.value });
    }
  }

  createRecord(event) {
    event.preventDefault();
    this.setState({
      submitted: true,
    });

    const page = this;

    const record = {
      recipient: this.state.recipient,
      amount: parseInt(parseFloat(this.state.amount) * 100000000, 10),
      balanceAtTransfer: parseInt(parseFloat(this.state.balanceAtTransfer) * 100000000, 10),
      notes: this.state.notes,
      address: this.props.user.record.account,
      date_confirmed: Date.now(),
      user_id: this.props.user.id,
      user_api_key: this.props.user.record.api_key,
      public_key: this.props.public_key,
      user_address: this.props.user.record.account,
    };

    axios.post('/api/transfers', { data: record })
      .then((response) => {
        if (response.data.success) {
          page.setState({
            recipient: '',
            amount: '',
            balanceAtTransfer: '',
            notes: '',
            submitted: false,
          });
          toastr.success('Transfer record submitted to the blockchain. It might take a few minutes for record to be shown below.');
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
      this.state.transfers.map((transfer, index) => <DataRow
          parent={self}
          transfer={index}
          user={self.props.user}
          public_key={self.props.public_key}
          key={`row${(transfer.id)}`}
          />)
    );

    return (
        <div className="container-fluid card">
            <h1 className="page-title"></h1>

            <div className="">
                <div className="">
                    <div className="card col-md-8 col-lg-8 p-0 mx-auto my-4">
                        <div className="card-header">
                            Record Transfer
                        </div>
                        <div className="card-body form-group">
                            <div className="row p-2">
                                <div className="col-lg-12 col-md-12">
                                    <label>recipient</label>
                                    <input placeholder="" value={this.state.recipient } className="form-control" onChange={this.handleChange.bind(this, 'recipient')} /><br />
                                </div>
                                <div className="col-lg-12 col-md-12">
                                    <label>amount</label>
                                    <input type="number" step="0.00000001" value={this.state.amount } onChange={this.handleChange.bind(this, 'amount')} className="form-control" />
                                </div>
                                <div className="col-lg-12 col-md-12">
                                    <label>balanceAtTransfer</label>
                                    <input type="number" step="0.00000001" value={this.state.balanceAtTransfer } onChange={this.handleChange.bind(this, 'balanceAtTransfer')} className="form-control" />
                                </div>
                                <div className="col-lg-12 col-md-12">
                                    <label>notes</label>
                                    <input placeholder="" value={this.state.notes } className="form-control" onChange={this.handleChange.bind(this, 'notes')} /><br />
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
                        <th>Recipient</th>
                        <th>Amount</th>
                        <th>Balance at Transfer</th>
                        <th>Notes</th>
                        <th>Created on</th>
                        <th>Confirmed</th>
                        <th></th>
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

const TransfersExport = () => {
  if (document.getElementById('TransfersComponent') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <TransfersComponent
      user={props.user}
      validation={props.validation}
      public_key={props.public_key}
      />,
      document.getElementById('TransfersComponent'),
    );
  }
};

module.exports = TransfersExport();
