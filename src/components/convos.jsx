import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class DataRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: {},
    };
  }

  render() {
    const record = this.props.parent.state.messages[this.props.message];
    const { data } = record;
    const name = data.name === `${this.props.user.record.firstname} ${this.props.user.record.lastname}`
      ? 'You' : data.name;

    const date = (new Date(record.date)).toLocaleString();


    const readOnlyLeft = (
        <div className="card-plain text-left message d-block float-left my-2 w-100 this-is-bg-warning">
        <div className="card-body p-2">
          <div className="bg-dark rounded-circle float-left mr-2">
            <img src="/img/logo.png" height="40px" alt="logo" />
          </div>
          <div id="incoming_message" className="ml-5 rounded">
            <div style={{ fontWeight: '600' }}>{name}</div>
            <div>{data.message}</div>
            <div>{date}</div>
          </div>
        </div>
        {/* <h4>{name}</h4>
        <p>{data.message}</p> */}
    </div>
    );

    const readOnlyRight = (
        <div className="card-plain text-right message d-block float-right my-2 w-100 this-is-bg-warning">
        <div className="card-body p-2">
          <div className="bg-dark rounded-circle float-right ml-2">
            <img src="/img/logo.png" height="40px" alt="logo" />
          </div>
          <div id="incoming_message" className="mr-5 p-2 rounded">
            <div style={{ fontWeight: '600' }}><strong>You</strong></div>
            <div>{data.message}</div>
            <div>{date}</div>
          </div>
        </div>
        {/* <h4>{name}</h4>
        <p>{data.message}</p> */}
    </div>
    );

    return (
      name === 'You' ? readOnlyRight : readOnlyLeft
    );
  }
}

class ConvosComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passphrase: '',
      name: '',
      password: '',
      messages: [],
      message: '',
      submitted: false,
      update_submitted: false,
      tableData: {},
      querying: false,
      waitingForData: false,
      monitoring: false,
      queryScope: 'all',
      transactionIds: [],
      firstIndex: 0,
    };
    this.handleChange = this.handleChange.bind(this);
    this.createRecord = this.createRecord.bind(this);
  }

  componentDidMount() {
    this.loadTableData();
  }

  resetRecords(newData) {
    this.setState({
      messages: newData,
      waitingForData: false,
    });
  }

  setTransactionsIds(messages) {
    const transactionIds = [];
    for (let x = 0; x < messages.length; x += 1) {
      const thisMessage = messages[x];
      if (thisMessage && thisMessage.fullRecord) {
        transactionIds.push(thisMessage.fullRecord.transaction);
      }
    }

    this.setState({
      transactionIds,
    });
  }

  handleNewData(messages) {
    const ids = this.state.transactionIds;
    const currentMessages = this.state.messages;
    for (let x = 0; x < messages.length; x += 1) {
      const thisMessage = messages[x];

      if (!ids.includes(thisMessage.fullRecord.transaction)) {
        currentMessages.push(thisMessage);
        ids.push(thisMessage.fullRecord.transaction);
      }
    }

    this.setState({
      transactionIds: ids,
      messages: currentMessages,
    });
  }

  loadTableData() {
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
          page.setState({
            channels: response.data.channels,
          });
          // page.monitorData();
          for (let x = 0; x < response.data.channels.length; x += 1) {
            const thisChannel = response.data.channels[x];

            if (thisChannel.id === this.props.channelId) {
              this.setState({
                tableData: thisChannel.channel_record,
              }, () => {
                page.loadData('all');
              });
            }
          }
        } else {
          toastr.error('No record history');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  getOlderMessages() {
    const page = this;
    const currentIndex = parseInt(this.state.firstIndex, 10);
    const currentMessages = parseInt(this.state.messages.length, 10);
    const newIndex = currentIndex + currentMessages;

    this.setState({
      waitingForOldData: true,
    });

    this.setState({
      firstIndex: newIndex,
    }, async () => {
      const response = await page.getData('all');

      if (response.success && response.messages) {
        const currentData = this.state.messages;
        const newData = response.messages;

        const mergedData = newData.concat(currentData);
        this.setState({
          messages: mergedData,
          waitingForOldData: false,
        }, () => {
          page.setTransactionsIds(response.messages);
        });
      } else {
        toastr.error('Error loading older messages');
      }
    });
  }

  async getData(queryScope) {
    const config = {
      headers: {
        user_api_key: this.props.user.record.api_key,
        user_public_key: this.props.public_key,
        accessdata: this.props.accessData,
        channelaccess: this.state.tableData.passphrase,
        channeladdress: this.state.tableData.account,
        channelkey: this.state.tableData.password,
        channelpublic: this.state.tableData.publicKey,
      },
    };
    let indexNumber;
    if (queryScope === 'unconfirmed') {
      indexNumber = 0;
    } else {
      indexNumber = this.state.firstIndex;
    }
    const response = await axios.get(`/data/messages/${queryScope}/${indexNumber}`, config);

    return response.data;
  }

  loadData() {
    const page = this;
    this.setState({
      waitingForData: true,
    });

    const currentData = JSON.stringify(this.state.messages);

    const config = {
      headers: {
        user_api_key: this.props.user.record.api_key,
        user_public_key: this.props.public_key,
        accessdata: this.props.accessData,
        channelaccess: this.state.tableData.passphrase,
        channeladdress: this.state.tableData.account,
        channelkey: this.state.tableData.password,
        channelpublic: this.state.tableData.publicKey,
      },
    };
    const index = this.state.queryScope === 'unconfirmed' ? 0 : this.state.firstIndex;
    axios.get(`/data/messages/${this.state.queryScope}/${index}`, config)
      .then((response) => {
        // console.log(response.data);
        if (response.data.success) {
          if (page.state.queryScope === 'all') {
            const responseData = JSON.stringify(response.data.messages);

            if (currentData !== responseData
              && response.data.messages) {
              page.setTransactionsIds(response.data.messages);
              page.setState({
                messages: response.data.messages,
                queryScope: 'unconfirmed',
              });
            }
          } else if (page.state.queryScope === 'unconfirmed') {
            const newMessages = response.data.messages;
            if (newMessages.length > 0) {
              page.handleNewData(response.data.messages);
            }
          }
          page.setState({
            waitingForData: false,
          }, () => {
            if (!page.state.monitoring) {
              page.setState({
                monitoring: true,
              }, () => {
                page.monitorData();
              });
            }
          });
        } else {
          page.setState({
            waitingForData: false,
          });
          // toastr.error('No record history');
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  checkUpdates() {
    if (!this.state.waitingForData) {
      this.loadData();
    }
  }

  monitorData() {
    const self = this;

    setInterval(() => {
      if (!(self.state.submitted || self.state.update_submitted)) {
        self.checkUpdates();
      }
    }, 1500);
  }

  handleChange(aField, event) {
    if (aField === 'message') {
      this.setState({ message: event.target.value });
    }
  }

  createRecord(event) {
    event.preventDefault();
    this.setState({
      submitted: true,
    });

    const page = this;

    const record = {
      name: `${this.props.user.record.firstname} ${this.props.user.record.lastname}`,
      message: this.state.message,
      sender: this.props.user.record.account,
    };

    axios.post('/data/messages', {
      data: record,
      user: this.props.accessData,
      tableData: this.state.tableData,
    })
      .then((response) => {
        if (response.data.success) {
          page.setState({
            passphrase: '',
            name: '',
            password: '',
            submitted: false,
            message: '',
          });
          toastr.success('Message sent');
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


  render() {
    const self = this;
    const Channel = this.state.tableData || {};

    const recordList = (
      this.state.messages.map((channel, index) => <DataRow
        parent={self}
        message={index}
        user={self.props.user}
        public_key={self.props.public_key}
        key={`row${(channel.signature)}`}
        />)
    );

    return (
      <div>
        <div className="page-title">{Channel.name}</div>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          height: 'calc(100vh - 190px)',
          width: '100%',
          border: '0px solid #ccc',
        }}>
          <div className="this-is-bg-info" style={{
            overflowY: 'scroll',
            height: '100%',
            width: '100%',
            position: 'absolute',
          }}>
            <button className="btn btn-info" disabled={this.state.waitingForOldData} onClick={this.getOlderMessages.bind(this)}>
              { this.state.waitingForOldData ? 'Loading messages' : 'Load older messages'}
            </button>
            {recordList}
            <br /><br />
          </div>
          {/*
          <h1 className="page-title">{Channel.name}</h1>
          <h2 className="page-title">{Channel.account}</h2>
          {recordList}
          <div className="bg-warning">
            <div className="">
              <div className="">
                <div className="">
                  <div className="">
                    <div className="">
                      <input placeholder="" value={this.state.message}
                      className="form-control" onChange={this.handleChange.bind(this, 'message')} />
                      <br />
                    </div>
                  </div>
                  <div className="">
                    <div className="">
                      <button type="button" className="btn btn-outline btn-default"
                      disabled={this.state.submitted}
                      onClick={this.createRecord.bind(this)}>
                      <i className="glyphicon glyphicon-edit"></i>
                      {this.state.submitted ? 'Saving...' : 'Send'}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          */}
        </div>
        <div>
          <form className="" style={
            {
              display: 'flex',
              boxSizing: 'border-box',
              height: '60px',
              margin: '10px',
            }}>
            <input style={{
              width: '100%',
              padding: '15px 10px',
              border: 'none',
              margin: '0',
            }} type="text"
            className=""
            placeholder="Enter your message here..."
            value={this.state.message}
            onChange={this.handleChange.bind(this, 'message')}
            required="required" />
            <button
            type="submit"
            className="btn btn-primary"
            disabled={this.state.submitted} onClick={this.createRecord.bind(this)}
            >SEND</button>
          </form>
        </div>
      </div>
    );
  }
}

const ConvosExport = () => {
  if (document.getElementById('convosComponent') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <ConvosComponent
      user={props.user}
      validation={props.validation}
      public_key={props.public_key}
      accessData = {props.accessData}
      channelId = {props.channelId}
      />,
      document.getElementById('convosComponent'),
    );
  }
};

module.exports = ConvosExport();
