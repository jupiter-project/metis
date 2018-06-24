import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

function getBalance(secret, address, api_key, public_key) {
  const config = {
    headers: {
      user_api_key: api_key,
      user_public_key: public_key,
    },
  };

  return new Promise((resolve, reject) => {
    axios.post('/admin/api/tables/balance', {
      account: secret,
    }, config)
      .then((response) => {
        if (response.data.success === true) {
          resolve(response.data);
        } else {
          console.log(response.data);
          reject({ success: false, message: `Error obtaining balance of ${address}` });
        }
      })
      .catch((error) => {
        console.log(error);
        reject({ success: false, message: `Error obtaining balance of ${address}` });
      });
  });
}

class TableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      table: this.props.table,
      name: Object.keys(this.props.table),
      balance: 0,
      low_balance: true,
      show_passphrase: false,
    };
  }

  componentDidMount() {
    this.getAddressBalance();
  }

  showPassphrase() {
    this.setState({
      show_passphrase: !this.state.show_passphrase,
    });
  }

  getAddressBalance() {
    const self = this;
    const { state } = this;
    const { table } = state;
    const data = table[state.name];
    const { user } = this.props.parent.props;

    getBalance(data.passphrase, data.address, user.record.api_key, data.public_key)
      .then((response) => {
        if (response.success) {
          self.setState({
            balance: response.balances ? response.balances.balance : 0,
            low_balance: !response.balances.minimumTableBalance,
          });
        } else {
          console.log(response);
          toastr.error('There was an error loading app address balance');
        }
      })
      .catch((error) => {
        toastr.error(error.message);
      });
  }

  render() {
    const { state } = this;
    const { table } = state;
    const data = table[state.name];
    return (
        <div className="container">
            <h3>{this.state.name}</h3>
            <div className="">
                <p><strong>Address:</strong> {data.address}</p>
                <p><strong>Passphrase:</strong> {state.show_passphrase
                  ? <span>{data.passphrase} <button className="btn btn-danger" onClick={this.showPassphrase.bind(this)}>Hide</button></span>
                  : <button className="btn btn-default" onClick={this.showPassphrase.bind(this)}>Show passphrase</button>
                }</p>
                <p><strong>Public Key:</strong> {data.public_key}</p>
                <p><strong>Current balance: </strong>
                  <span className={state.low_balance ? 'alert alert-warning' : 'alert alert-info'}>
                    {state.balance / (10 ** 8)} JUP
                  </span>
                </p>
            </div>
            <hr />
        </div>
    );
  }
}

class AdminComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      records: [],
      params: [],
      tables: [],
      application: {},
      balances: {},
      loading: true,
    };
  }

  componentDidMount() {
    this.loadAppData();
    this.getAddressBalance();
  }

  getAddressBalance() {
    const self = this;
    const { user } = this.props;
    getBalance(user.record.secret, user.record.account, user.record.api_key, this.props.public_key)
      .then((response) => {
        if (response.success) {
          self.setState({
            balances: response.balances,
          });
        } else {
          console.log(response);
          toastr.error('There was an error loading app address balance');
        }
      })
      .catch((error) => {
        toastr.error(error.message);
      });
  }

  loadAppData() {
    const page = this;

    const config = {
      headers: {
        user_api_key: this.props.user ? this.props.user.record.api_key : null,
        user_public_key: this.props.public_key,
      },
    };

    axios.get('/admin/api/app', config)
      .then((response) => {
        console.log(response.data);
        if (response.data.success === true) {
          page.setState({
            application: response.data.application,
            tables: response.data.application && response.data.application.tables
              ? response.data.application.tables : [],
            loading: false,
          });
        } else {
          toastr.error("Error obtaining your app's data");
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  loadTableData(table) {
    const page = this;
    const config = {
      headers: {
        user_api_key: this.props.user ? this.props.user.record.api_key : null,
        user_public_key: this.props.public_key,
      },
    };

    page.setState({
      loading: true,
    });

    axios.get(`/admin/api/${table}`, config)
      .then((response) => {
        if (response.data.success === true) {
          page.setState({
            records: response.data.records,
            params: response.data.params,
            loading: false,
          });
        } else {
          page.setState({
            records: [],
            params: [],
            loading: false,
          });

          if (response.data.error && response.data.error === 'table-not-found' && page.state.tables.length > 0) {
            toastr.error('Table in database but app has no model file for it!');
          } else {
            toastr.error('No table history');
          }
        }
      })
      .catch((error) => {
        console.log(error);
        toastr.error('There was an error');
      });
  }

  render() {
    const { state } = this;
    const { props } = this;
    const tableList = state.tables.map((table, index) => <TableComponent table={table} parent={this} key={`table-component-${index}`} />);


    return (
        <div className="container-fluid">
            <div className="text-center">
                <h1>App Summary</h1>
                <h2>Address: {props.user.record.account}</h2>
                <p>
                  <strong>Current balance: </strong>
                  {state.balances && state.balances.balance
                    ? (state.balances.balance / (10 ** 8)) : 0} JUP
                </p>
                <p>
                  <strong>Required app balance: </strong>
                  {state.balances && state.balances.minAppBalanceAmount
                    ? (state.balances.minAppBalanceAmount / (10 ** 8)) : 0} JUP
                </p>
            </div>
            <hr />
            <div className="container">
                <h2 className="text-center">Tables</h2>
                <p className="text-center">
                  <strong>Required Table balance: </strong>
                  {state.balances && state.balances.minTableBalanceAmount
                    ? (state.balances.minTableBalanceAmount / (10 ** 8)) : 0} JUP
                </p>
                <hr />
                { state.loading
                  ? <p className="text-center alert alert-info">Loading</p> : tableList
                }
            </div>
        </div>
    );
  }
}

const AdminDashboardComponentExport = () => {
  if (document.getElementById('app-admin-dashboard') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
      <AdminComponent
      user={props.user}
      validation={props.validation}
      public_key={props.public_key} />,
      document.getElementById('app-admin-dashboard'),
    );
  }
};

module.exports = AdminDashboardComponentExport();
