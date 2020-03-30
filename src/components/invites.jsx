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

  async addMember() {
    const { state } = this;
    const { channel_record } = state.inviteData;
    const params = {
      channeladdress: channel_record.account,
      channelkey: channel_record.password,
      channelpublic: channel_record.publicKey,
    };

    if (
      !params.channelkey
      || !params.channeladdress
      || !params.channelpublic
      ) {
      toastr.error('Error with invite acceptance');
      return { error: true, message: 'COuld not add user to member list of channel' }
    }

    let response;

    try {
      response = await axios.post('/data/members', params);
    } catch (e) {
      response = e;
      return e;
    }

    return response.data;
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
          page.addMember();
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
    const { state } = this;

    const inviteComponent = (
      <div
        className="modal fade"
        id={`NewIniviteModal${state.inviteData.id}`}
        tabIndex="-1"
        role="dialog"
        aria-labelledby={`NewIniviteModalLabel${state.inviteData.id}`}
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={`NewIniviteModalLabel${state.inviteData.id}`}>
                Accept Your Invite to '{state.inviteData.channel_record.name}'
              </h5>
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
      <div style={{ border: '2px solid black', backgroundColor: '#26313d', borderRadius: '0.25rem', padding: '14px', marginTop: '20px', marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div style={{ flexGrow: '1' }}>
          <h5>
            You have been invited to join '{inviteInfo.channel_record.name}'
          </h5>
          <div>
            <span style={{ fontWeight: 'bold' }}>From:</span> {fullData.sender}
          </div>
          <div>
          <span style={{ fontWeight: 'bold' }}>Date:</span> {this.state.date}
          </div>
          <div style={{ textAlign: 'right' }}>
            <button
              type="button"
              className="btn btn-custom"
              data-toggle="modal"
              data-target={`#NewIniviteModal${state.inviteData.id}`}
            >
              Accept
            </button>
          </div>
        </div>
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

    const RecordList = (
      this.state.invites.map((invite, index) => <DataRow
        parent={self}
        invite={index}
        user={self.props.user}
        public_key={self.props.public_key}
        key={`row${invite.channel.id}`}
      />
      )
    );

    return (
        <div>
          <h1 className="page-title">Invites</h1>
          <div className="container">
            {RecordList}
          </div>
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
