import React from 'react';
import axios from 'axios';

export default class CreateChannelForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: 'testing',
      submitted: false,
      name: '',
      passphrase: '',
      password: '',
      invitationAccount: '',
    };

    this.handleChange = this.handleChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    this.createRecord = this.createRecord.bind(this);
  }

  handleChange(aField, event) {
    if (aField === 'passphrase') {
      this.setState({ passphrase: event.target.value });
    } else if (aField === 'name') {
      this.setState({ name: event.target.value });
    } else if (aField === 'password') {
      this.setState({ password: event.target.value });
    } else if (aField === 'invitationAccount') {
      this.setState({ invitationAccount: event.target.value});
    }
  }

  // handleSubmit(event) {
  //   alert('A name was submitted: ' + this.state.name)
  //   event.preventDefault();
  // }

  createRecord(event) {
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
    }

    if (this.state.name === '') {
      toastr.error('No channel name provided')
    } else {
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
      event.preventDefault();
  }

  render() {
    return (
      <form className="create-channel-form" onSubmit={this.createRecord.bind(this)}>
        <input
          className="create-channel-form_input"
          placeholder="Create a Channel"
          value={this.state.name}
          onChange={this.handleChange.bind(this, 'name')}
          disabled={this.state.submitted}
        />
        <button>
          <input
            type="checkbox"
            disabled={this.state.submitted}
          />
          {/* <svg>
            <use xlinkHref="index.svg#lock" />
          </svg> */}
          <i className="fas fa-lock"></i>
        </button>
        <button
          type="submit"
          disabled={this.state.submitted}
        >
          {/* <svg>
            <use xlinkHref="index.svg#add" />
          </svg> */}
          <i className="fas fa-plus"></i>
        </button>
      </form>
    );
  }
}
