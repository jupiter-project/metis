import React from 'react';

export default class Title extends React.Component {
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
        <div className="text-white text-center">Channel Name</div>
      </div>
    );
  }
}