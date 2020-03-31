import React from 'react';

export default class CreateMessageForm extends React.Component {
  render() {
    return (
      <form className="create-message-form">
        <input className="create-message-form_input" placeholder="Type a Message..." />
        <div className="file-input_container">
          {/* <svg>
            <use xlinkHref="index.svg#attach" />
          </svg> */}
          <i className="fas fa-plus"></i>
          <input
            className="file-input_component"
            type="file"
          />
        </div>
        <button type="submit">
          {/* <svg>
            <use xlinkHref="index.svg#send" />
          </svg> */}
          <i className="fas fa-plus"></i>
        </button>
      </form>
    );
  }
}
