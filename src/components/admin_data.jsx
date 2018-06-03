import React from 'react';
import {render} from 'react-dom';

var axios= require('axios');


class DataRow extends React.Component {
    constructor(props){
        super(props);
        this.state={
            record: this.props.record,
            params: this.props.params
        }
    }

    render(){
        var self=this;

        var get_data= (record, param) =>{
            return(<td>{record[param]}</td>)
        }

        var data= self.state.params.map(param =>{
            return get_data(self.state.record.versions[0], param);
        })

        return(
            <tr>
                {data}
            </tr>
        ) 
    }
}

class DataCard extends React.Component {
    constructor(props){
        super(props);
        this.state={
            record: this.props.record,
            params: this.props.params
        }
    }

    render(){
        var self=this;

        var get_data= (record, param) =>{
            return(<p><strong>{param}</strong>: {String(record[param])}</p>)
        }

        var data= self.state.params.map(param =>{
            return param != 'id' ? get_data(self.state.record.versions[0], param):null;
        })

        return(
            <div className="card">
                <h3>Id#{this.state.record.id}</h3>
                {data}
            </div>
        ) 
    } 
}

class DataComponent extends React.Component {
    constructor(props){
        super(props);
        this.state={
            records: [],
            params: [],
            table: 'users',
            tables: [],
            application: {},
            loading: true
        }
    }

    componentDidMount(){
        this.loadAppData();
        this.loadTableData(this.state.table);
    }

    loadAppData(){
        var page= this;

        var config={
            headers:{
                user_api_key: this.props.user ? this.props.user.record.api_key:null,
                user_public_key: this.props.public_key
            }
        }

        axios.get('/admin/api/app', config)
        .then(function(response){
            //console.log(response.data)
            if (response.data.success==true){
                page.setState({
                    application: response.data.application,
                    tables: response.data.tables,
                })
            }else{
                toastr.error("Error obtaining your app's data");
            }
        })
        .catch(function(error){
            console.log(error);
            toastr.error('There was an error');
        });          
    }

    loadTableData(table){
        console.log(table);
        var page= this;
        var config={
            headers:{
                user_api_key: this.props.user ? this.props.user.record.api_key:null,
                user_public_key: this.props.public_key
            }
        }

        page.setState({
            loading: true
        })

        axios.get('/admin/api/'+table, config)
        .then(function(response){
            console.log(response.data)
            if (response.data.success==true){
                page.setState({
                    records: response.data.records,
                    params: response.data.params,
                    loading: false
                })

            }else{
                page.setState({
                    records: [],
                    params: [],
                    loading: false
                })

                if(response.data.error && response.data.error == 'table-not-found' && page.state.tables.length > 0){
                    toastr.error('Table in database but app has no model file for it!');
                }else{
                    toastr.error('No table history');
                }
            }
        })
        .catch(function(error){
            console.log(error);
            toastr.error('There was an error');
        });       
    }

    render(){
        const self= this;

        const headers= self.state.params.map(param => {
            return(<th>{param}</th>)
        });

        const body=self.state.records.map(record=>{
            return(<DataRow record={record} params={self.state.params} key={record.id} />)
        });

        const table_version=
            <div className="container-fluid">
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
            </div>

        const card_version=self.state.records.map(
            record=>
            {
                return(<DataCard record={record} params={self.state.params} key={record.id}/>)
            }
        );
        
        const tables=this.state.tables.map(table => {
            return(<button className="btn btn-link" onClick={this.loadTableData.bind(this,table)}>{table}</button>)
        });

        return(
            <div className="container-fluid">
                <div className="container text-center">
                    {tables}
                </div>
                <div className="text-center">
                    <h2>Current Table: {this.state.table}</h2>
                </div>
                {
                    this.state.loading ? 
                        <p className="alert alert-info">Loading</p>
                        :card_version
                    }
            </div>
        )
    }
};

var DataComponentExport= () => {
    if (document.getElementById('app-data')!= null){
        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));
        
        render(<DataComponent user={props.user} validation={props.validation} public_key={props.public_key} />, 
            document.getElementById('app-data'));
    } 
}

module.exports= DataComponentExport();