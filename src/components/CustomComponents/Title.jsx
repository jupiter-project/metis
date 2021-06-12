import { Component } from 'react';

export default class Title extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div className="bg-dark">
        <div className="text-white text-center">Channel A</div>
      </div>
    );
  }
}