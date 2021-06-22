import { Component } from 'react';

export class Text extends Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}

export default new Text({});
