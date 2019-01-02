import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class NewDataRow extends React.Component {
  constructor(props) {
    super(props);
    const invite = this.props.parent.state.invites[this.props.invite];
    const record = invite.channel;
    this.state = {
      fullData: invite,
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
  }

  acceptInvite = () => {
    const page = this;
    const data = {
      channel_record: this.state.channel_record,
    };

    data.channel_record.invited = true;
    data.channel_record.sender = this.state.fullData.sender;

    axios.post('/channels/import', { data })
      .then((response) => {
        if (response.data.success) {
          page.props.parent.setState({
            update_submitted: false,
          });

          toastr.success('Invite accepted!');
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
    const inviteInfo = this.props.parent.state.invites[this.props.invite].channel;
    const fullData = this.props.parent.state.invites[this.props.invite];

    const inviteComponent = (
      <div
        className="modal fade"
        id="NewIniviteModalTwo"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="NewInviteModalLabelTwo"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="NewInviteModalLabelTwo">Accept Your Invite</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>By clicking on 'Accept', your account will be permanently linked to this channel.</p>
            </div>
            <div className="modal-footer">
              {/* <button type="button" className="btn btn-custom">Continue</button>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button> */}
              <button
                className="btn btn-custom"
                onClick={() => this.acceptInvite()}
                data-dismiss="modal"
              >
                Accept
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                data-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    const TableBody = (
      <div className="card text-center" style={{ maxWidth: '20rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '32px' }} key={`row-${(inviteInfo.id)}-data`}>
        <div className="card-header">
          {inviteInfo.channel_record.name}
        </div>
        <div className="card-body">
          <div>You have recieved a new invite from</div>
          <div>{fullData.sender}</div>
          <div className="mt-3">
            <button
              type="button"
              className="btn btn-custom"
              data-toggle="modal"
              data-target="#NewIniviteModalTwo"
            >
              Accept
            </button>
          </div>
          {/* <div style={{ marginTop: '8px' }}>{this.state.date}</div> */}
        </div>

        {/* <div key={`row-${(inviteInfo.id)}-data`} style={{ background: 'lightgray', padding: '10px', margin: '10px', maxWidth: '25rem' }}>
          <div
            style={{
              // background: 'red',
            }}
          >
            <div style={{fontWeight: 'bold'}}>Channel Name:</div>
            <div style={{ paddingBottom: '8px' }}>
              {inviteInfo.channel_record.name}
            </div>
          </div>
          <div
            style={{
              // background: 'orange',
            }}
          >
            <div style={{fontWeight: 'bold'}}>Invite From:</div>
            <div style={{ paddingBottom: '8px' }}>
              {fullData.sender}
            </div>
          </div>
          <div
            style={{
              // background: 'blue',
              textAlign: 'center',
              padding: '8px'
            }}
          >
            <button
              type="button"
              className="btn btn-custom"
              data-toggle="modal"
              data-target="#NewIniviteModalTwo"
            >
              Accept
            </button>
          </div>
          <div className="small pb-1">Sent: {this.state.date}</div>
        </div> */}


      </div>
    );

    return (
      <div>
        {TableBody}
        {inviteComponent}
      </div>
    );
  }
}

class DataRow extends React.Component {
  constructor(props) {
    super(props);
    const invite = this.props.parent.state.invites[this.props.invite];
    const record = invite.channel;
    this.state = {
      fullData: invite,
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
  }

  handleChange(aField, event) {
    this.setState({
      [aField]: event.target.value,
    });
  }

  acceptInvite(event) {
    event.preventDefault();
    const page = this;
    const data = {
      channel_record: this.state.channel_record,
    };

    data.channel_record.invited = true;
    data.channel_record.sender = this.state.fullData.sender;

    axios.post('/channels/import', { data })
      .then((response) => {
        if (response.data.success) {
          page.props.parent.setState({
            update_submitted: false,
          });

          toastr.success('Invite accepted!');
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
    const inviteInfo = this.props.parent.state.invites[this.props.invite].channel;
    const fullData = this.props.parent.state.invites[this.props.invite];

    const inviteComponent = (
      <div>
        <div
          className="modal fade"
          id="NewInviteModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="NewInviteModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="NewInviteModalLabel">Accept Your Invite</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>By clicking on 'Accept', your account will be permanently linked to this channel.</p>
              </div>
              <div className="modal-footer">
                {/* <button type="button" className="btn btn-custom">Continue</button>
                <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button> */}
                <button
                  className="btn btn-custom"
                  onClick={this.acceptInvite.bind(this)}
                  data-dismiss="modal"
                >
                  Accept
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  data-dismiss="modal"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* <div
          className="modal fade"
          id="inviteInvite"
          role="dialog"
          aria-labelledby="inviteInvite"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content" style={{ position: 'fixed', zIndex: '100', color: 'black' }}>
              <div className="modal-header">
                <h5 className="modal-title">
                  Accept Your Invite
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
                By clicking on 'Accept', your account will be permanently linked to this channel.<br />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-custom"
                  onClick={this.acceptInvite.bind(this)}
                  data-dismiss="modal"
                >
                  Accept
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  data-dismiss="modal"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    );

    const readOnly = (
      <tr className="text-center" key={`row-${(inviteInfo.id)}-data`}>
          <td>{inviteInfo.channel_record.name}</td>
          <td>{fullData.sender}</td>
          <td>{this.state.date}</td>
          <td>
            {/* <a
                className="btn btn-custom button-link"
                data-toggle="modal"
                data-target="#inviteInvite"
              >
                <span>Accept</span>
              </a> */}
              <div style={{ display: 'fixed' }}>
                <button
                  type="button"
                  className="btn btn-custom"
                  data-toggle="modal"
                  data-target="#NewInviteModal"
                >
                  <span>Accept</span>
                </button>
                {inviteComponent}
              </div>
          </td>
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

    const NewRecordList = (
      this.state.invites.map((invite, index) => <NewDataRow
        parent={self}
        invite={index}
        user={self.props.user}
        public_key={self.props.public_key}
        key={`row${invite.channel.id}`}
      />
      )
    );

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
        <div>
          <h1 className="page-title">My Invites</h1>
          <div className="container">
            {NewRecordList}
          </div>
          {/* <div className="table-responsive mt-5">
            <table className="table table-striped table-bordered table-hover">
              <thead>
                <tr className="text-center">
                  <th>Channel</th>
                  <th>Sender</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recordList}
              </tbody>
            </table>
          </div> */}
          {/* <button
            type="button"
            className="btn btn-custom"
            data-toggle="modal"
            data-target="#testerModal"
          >
            Tester Modal
          </button>
          <div
            className="modal fade"
            id="testerModal"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="testerModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="testerModalLabel">Tester Modal</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <p>this is a test modal...</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-custom">Continue</button>
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div> */}
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
