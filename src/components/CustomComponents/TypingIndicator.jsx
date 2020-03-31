import React from 'react';

export default class TypingIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      typing: false,
    }
  }
  render() {
    return (
      this.state.typing ? (
        <div className="typing-indicator">
          <div>
            <div className="typing-indicator_dots">
              <div>.</div>
            </div>
          </div>
          <div>person is typing</div>
        </div>
      ) : null
    );
  }
}
