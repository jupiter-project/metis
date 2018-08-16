import React, { Component } from "react";

//import { makeData, Logo, Tips } from "./Utils.jsx";
import ReactTable from "react-table";

const columns = [
  {
    Header: "Table Name",
    columns: [
      {
        Header: "sort",
        id: "name",
        accessor: d => d.name
      }
    ]
  },
  {
    Header: "Balance",
    columns: [
      {
        Header: "sort",
        accessor: "balance"
      }
    ]
  },
  {
    Header: "Status",
    columns: [
      {
        Header: "sort",
        accessor: "status"
      }
    ]
  }
];

class MyTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //data: makeData()
      data: [
        {
          name: "name",
          balance: 0.00234534,
          status: "active"
        }
      ]
    };
  }
  render() {
    const { data } = this.state;
    return (
      <div id="my-table">
        <ReactTable
          data={data}
          columns={columns}
          defaultPageSize={6}
          className="-striped -highlight"
          SubComponent={row => {
            return (
              <div style={{ padding: "20px" }}>
                <em>
                  You can put any component you want here, even another React
                  Table!
                </em>
              </div>
            );
          }}
        />
        <br />
      </div>
    );
  }
}

export default MyTable;
