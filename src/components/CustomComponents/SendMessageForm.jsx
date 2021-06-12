import { Component } from 'react';

export default class SendMessageForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div className="">
        <div className="text-white">
          <div className="type_msg" style={{ position: "relative", margin: "20px" }}>
            <div className="input_msg_write">
              {/* <input type="text" className="write_msg" placeholder="Type a message" /> */}
              {/* <button className="msg_send_btn" type="button"><i className="fas fa-paper-plane"></i></button> */}
              <textarea placeholder="type and press ENTER to send" style={{ background: "#fbfbfb", width: "100%", height: "60px", border: "2px solid #eee", borderRadius: "3px", resize: "none", padding: "10px", fontSize: "14px", color: "#333" }}></textarea>
              {/* <button className="msg_send_btn" type="button" style={{ background: "blue none repeat scroll 0 0", border: "medium none", paddingLeft: "12px", paddingRight: "12px", borderRadius: "3px", color: "#fff", cursor: "pointer", fontSize: "17px", position: "absolute", right: "2px", textTransform: "uppsercase", letterSpacing: "1px", height: "60px" }}>send</button> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}