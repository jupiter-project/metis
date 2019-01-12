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
        <div className="card-header bg-custom text-light h5">
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
          <h1 className="page-title">My Invites</h1>
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
