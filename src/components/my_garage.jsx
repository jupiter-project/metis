import React from 'react';
import {render} from 'react-dom';

var axios= require('axios');

class DataRow extends React.Component {
    constructor(props){
        super(props);
        var garage= this.props.parent.state.garages[this.props.garage];
        var record= garage.garage_record;

        this.state={
            garage: this.props.parent.state.garages[this.props.garage],
            make: record.make,
            model: record.model,
            vintage: record.vintage,
            garages: [],
            edit_mode: false,
            date: (new Date(garage.date)).toLocaleString(),
            submitted: false,
        }

        this.handleChange= this.handleChange.bind(this);
        this.updateRecord= this.updateRecord.bind(this);
        this.editMode= this.editMode.bind(this);
    }

    handleChange(a_field, event){
        this.setState({
            [a_field]:event.target.value
        });
    }

    vintageUpdate(event){
        var new_value= !this.state.vintage;        
        this.setState({ vintage: new_value });
    }

    updateRecord(event){
        event.preventDefault();
        var page= this;
        this.setState({
            submitted: true
        });

        this.props.parent.setState({
            update_submitted: true
        });

        var record= {
            id: this.state.garage.id,
            make: this.state.make,
            model: this.state.model,
            vintage: this.state.vintage,
            address: this.props.user.record.account,
            date_confirmed: Date.now(),
            user_id: this.props.user.id,
            user_api_key: this.props.user.record.api_key,
            public_key: this.props.public_key,
            user_address: this.props.user.record.account
        }
        
        axios.put('/api/garages', {data: record})
        .then(function(response){
            if (response.data.success==true){
                page.setState({
                    submitted: false,
                    edit_mode: false
                })

                page.props.parent.setState({
                    update_submitted: false
                });

                toastr.success(' Update submitted to the blockchain.');
            }else{
                //console.log(response.data);
                //toastr.error(response.data.message);
                response.data.validations.messages.map(function(message){
                    toastr.error(message);
                });
            }
        })
        .catch(function(error){
            console.log(error);
            toastr.error('There was an error');
        });
    }

    editMode(event){
        event.preventDefault();
        this.setState({
            edit_mode: !this.state.edit_mode
        });
    }

    render(){

        var form=
            <tr className="text-center">
                <td>
                    <input placeholder="" value={this.state.make } className="form-control" onChange={this.handleChange.bind(this,'make')} /><br />
                </td>
                <td>
                    <input placeholder="" value={this.state.model } className="form-control" onChange={this.handleChange.bind(this,'model')} /><br />
                </td>
                <td>
                    <div className="status-toggle">
                    <label className={"switch"}>
                        <input type="checkbox" onChange={this.vintageUpdate.bind(this)} checked={this.state.vintage==true ? true : false}  />
                        <span className={"slider round"}></span>
                    </label><br />
                    </div>   
                </td>
                <td>{this.state.date}</td>
                <td>
                    <button className="btn btn-danger" onClick={this.editMode.bind(this)}>Cancel</button><br /><br />
                    <button className="btn btn-success" disabled={this.state.submitted} onClick={this.updateRecord.bind(this)}>{this.state.submitted ? 'Saving...':'Save'}</button>
                </td>
            </tr>

        var garage_info= this.props.parent.state.garages[this.props.garage];

        var read_only=
                    <tr className="text-center" key={'row-'+garage_info.id+'-data'}>
                        <td>{garage_info.garage_record.make}</td>
                        <td>{garage_info.garage_record.model}</td>
                        <td>{String(garage_info.garage_record.vintage)}</td>
                        <td>{this.state.date}</td>
                        <td>
                            <button className="btn btn-success" onClick={this.editMode.bind(this)}>Edit</button>
                        </td>
                    </tr>

        return(
            this.state.edit_mode? form : read_only
        );
    }
}

class MyGarageComponent extends React.Component {
    constructor(props){
        super(props);
        this.state={
            make: '',
            model: '',
            vintage: true,
            garages: [],
            submitted: false,
            update_submitted: false
        }
        this.handleChange= this.handleChange.bind(this);
        this.createRecord= this.createRecord.bind(this);

        this.vintageUpdate= this.vintageUpdate.bind(this);
    }


    componentDidMount(){
        this.loadData();
    }

    resetRecords(new_data){
        this.setState({
            garages: new_data
        });
    }

    loadData(){
        var page= this;
        var config={
            headers:{
                user_api_key: this.props.user.record.api_key,
                user_public_key: this.props.public_key
            }
        }

        axios.get('/api/users/'+this.props.user.id+'/garages', config)
        .then(function(response){
            console.log(response.data)
            if (response.data.success==true){
                page.setState({
                    garages: response.data.garages,
                })
                page.monitorData();

            }else{
                
                toastr.error('No record history');
            }
        })
        .catch(function(error){
            console.log(error);
            toastr.error('There was an error');
        });       
    }

    checkUpdates(){
        var self= this;
        var current_data= JSON.stringify(this.state.garages)
        var response_data;
        var config={
            headers:{
                user_api_key: this.props.user.record.api_key,
                user_public_key: this.props.public_key
            }
        }

        axios.get('/api/users/'+this.props.user.id+'/garages', config)
        .then(response => {
            if (response.data.success==true){
                response_data= response.data.garages;

                if(current_data != JSON.stringify(response_data)){
                    self.resetRecords(response_data);
                    toastr.success('Updated records!');
                }
            }
        })
        .catch(function(error){
            console.log(error);
            toastr.error("Could not connect to server. Unable to check and update page's records.");
        });
    }

    monitorData(){
        var self=this;

        setInterval(() => {
            if (self.state.submitted || self.state.update_submitted) {
                
            }else{
                self.checkUpdates();
            }
        },15000);
    }


    handleChange(a_field, event){
        if(a_field=='make'){
            this.setState({ make: event.target.value});
        }
        else if(a_field=='model'){
            this.setState({ model: event.target.value});
        }
        else if(a_field=='vintage'){
            this.setState({ vintage: event.target.value});
        }
    }
    
    createRecord(event){
        event.preventDefault();
        this.setState({
            submitted: true
        });
        
        var page= this;

        var record= {
            make: this.state.make,
            model: this.state.model,
            vintage: this.state.vintage,
            make: this.state.make,
            model: this.state.model,
            vintage: this.state.vintage,
            address: this.props.user.record.account,
            date_confirmed: Date.now(),
            user_id: this.props.user.id,
            user_api_key: this.props.user.record.api_key,
            public_key: this.props.public_key,
            user_address: this.props.user.record.account
        }
        axios.post('/api/garages', {data: record})
        .then(function(response){
            if (response.data.success==true){
                page.setState({
                    make: '',
                    model: '',
                    vintage: true,
                    submitted: false
                })
                toastr.success('garage record submitted to the blockchain.');
            }else{
                //console.log(response.data);
                //toastr.error(response.data.message);
                response.data.validations.messages.map(function(message){
                    toastr.error(message);
                });
            }
        })
        .catch(function(error){
            console.log(error);
            toastr.error('There was an error');
        });

    }

    vintageUpdate(event){
        var new_value= !this.state.vintage;        
        this.setState({ vintage: new_value });
    }

    render(){

        var self= this;

        var record_list=
            this.state.garages.map((garage, index) => {
                return(
                    <DataRow parent={self} garage={index} user={self.props.user} public_key={self.props.public_key} key={'row_'+garage.id} />
                )
        });

        return(
            <div className="container-fluid">
                <h1 className="page-title"></h1>

                <div className="">
                    <div className="">
                        <div className="card col-md-8 col-lg-8 p-0 mx-auto my-4">
                            <div className="card-header">
                                Record garage
                            </div>
                            <div className="card-body form-group">
                                <div className="row p-2">
                                    <div className="col-lg-6 col-md-6">
                                        <label>make</label>
                                        <input placeholder="" value={this.state.make } className="form-control" onChange={this.handleChange.bind(this,'make')} /><br />
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <label>model</label>
                                        <input placeholder="" value={this.state.model } className="form-control" onChange={this.handleChange.bind(this,'model')} /><br />
                                    </div>
                                </div>
                                <div className="row p-3">
                                    <div className="col-lg-12 col-md-12 text-left">
                                        <label>vintage</label>
                                        <div className="status-toggle">
                                            <label className={"switch"}>
                                                <input type="checkbox" onChange={this.vintageUpdate.bind(this)} checked={this.state.vintage==true ? true : false}  />
                                                <span className={"slider round"}></span>
                                            </label>
                                        </div>   
                                    </div>
                                    <div className="col-lg-12 col-md-12 text-right">
                                        <button type="button" className="btn btn-outline btn-default" disabled={this.state.submitted} onClick={this.createRecord.bind(this)}><i className="glyphicon glyphicon-edit"></i>  {this.state.submitted ? 'Saving...':'Save'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <table className="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>make</th>
                            <th>model</th>
                            <th>vintage</th>
                            <th>Created On</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                       {record_list}
                    </tbody>
                </table>

            </div>
        )
    }
};

var MyGarageExport= () => {
    if (document.getElementById('MyGarageComponent')!= null){
        var element= document.getElementById('props');
        var props= JSON.parse(element.getAttribute('data-props'));
        
        render(<MyGarageComponent  user={props.user} validation={props.validation} public_key={props.public_key} />, 
            document.getElementById('MyGarageComponent'));
    } 
}

module.exports= MyGarageExport();
