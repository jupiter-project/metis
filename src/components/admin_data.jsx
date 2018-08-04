import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';
import toastr from 'toastr';

class DataRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: this.props.record,
      params: this.props.params,
    };
  }

  render() {
    const self = this;

    const getData = (record, param) => <td>{record[param]}</td>;

    const data = self.state.params.map(param => getData(self.state.record.versions[0], param));

    return (
      <tr>
         {data}
      </tr>
    );
  }
}

class DataCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: this.props.record,
      params: this.props.params,
    };
  }

  render() {
    const self = this;
    const getData = (record, param) => <p><strong>{param}</strong>: {String(record[param])}</p>;

    const data = self.state.params.map(param => (param !== 'id' ? getData(self.state.record.versions[0], param) : null));

    return (
      <div className="card">
        <h3>Id#{this.state.record.id}</h3>
        {data}
      </div>
    );
  }
}

class DataComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      records: [],
      params: [],
      table: 'users',
      tables: [],
      application: {},
      loading: true,
      table_display: false,
      raw_data: [],
    };
  }

  componentDidMount() {
    this.loadAppData();
    this.loadTableData(this.state.table);
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
        if (response.data.success) {
          page.setState({
            application: response.data.application,
            tables: response.data.tables,
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
      table,
      loading: true,
    });

    axios.get(`/admin/api/${table}`, config)
      .then((response) => {
        console.log(response.data);
        if (response.data.success) {
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
          if (response.data.error && response.data.error === 'table-not-found' && response.data.records && page.state.tables.length > 0) {
            toastr.error('Table in database but app has no model file for it! Displaying raw data.');
            page.setState({
              raw_data: response.data.records,
            });
          } else if (response.data.error && response.data.error === 'table-not-found' && page.state.tables.length > 0) {
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
    const self = this;

    const headers = self.state.params.map(param => <th>{param}</th>);

    const body = self.state.records.map(
      record => <DataRow record={record} params={self.state.params} key={record.id} />,
    );

    const tableVersion = <div className="container-fluid">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        {headers}
                                    </tr>
                                </thead>
                                <tbody>
                                    {body}
                                </tbody>
                            </table>
                          </div>;

    const cardVersion = self.state.records.map(
      record => <DataCard record={record} params={self.state.params} key={record.id}/>,
    );

    const tables = this.state.tables.map(
      table => <button className="btn btn-link" onClick={this.loadTableData.bind(this, table)}>{table}</button>,
    );
    const rawData = this.state.raw_data.map(
      data => <div className="card">{JSON.stringify(data)}</div>,
    );

    const dataDisplay = this.state.table_display ? tableVersion : cardVersion;

    return (
      <div className="container-fluid">
        <div className="container text-center">
          {tables}
        </div>
        <div className="text-center">
          <h2>Current table: {this.state.table}</h2>
        </div>
        {
          this.state.loading
            ? <p className="alert alert-info">Loading</p>
            : dataDisplay
        }

        {
          this.state.raw_data.length > 0
            ? rawData : null
        }
      </div>
    );
  }
}

const DataComponentExport = () => {
  if (document.getElementById('app-data') != null) {
    const element = document.getElementById('props');
    const props = JSON.parse(element.getAttribute('data-props'));

    render(
     <DataComponent
      user={props.user}
      validation={props.validation}
      public_key={props.public_key}
     />,
     document.getElementById('app-data'),
    );
  }
};

module.exports = DataComponentExport();
