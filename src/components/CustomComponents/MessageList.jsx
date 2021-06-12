import { Component } from 'react';

export default class MessageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }

  componentDidMount() {}

  render() {
    return (
      <div style={{position: "relative", overflow: "hidden", height: "calc(100vh - 180px)", width:"100%", border: "0px solid #ccc"}}>
        <div className="row message-list" style={{overflowY: "scroll", height: "100%", width: "100%", position: "absolute", left: "15px"}}>
          
          <div className="card-plain text-left message d-block float-left m-2 w-100">
            <div className="card-body p-2">
              <div className="bg-dark rounded-circle float-left mr-2">
                <img src="/img/logo.png" height="40px" alt="logo" />
              </div>
              <div id="incoming_message" className="ml-5 p-2 rounded" style={{ backgroundColor: "#ccc" }}>
                <div className="person_name" style={{ fontWeight: "600" }}>Vaughn</div>
                <div className="person_message">this is just a mock conversation, no need to pay any attention here.</div>
              </div>
            </div>
          </div>
          
          <div className="card-plain text-right message d-block float-right m-2 w-100">
            <div className="card-body p-2">
              <div className="bg-dark rounded-circle float-right ml-2">
                <img src="/img/logo.png" height="40px" alt="logo" />
              </div>
              <div id="outgoing_message" className="p-2 rounded float-right" style={{ backgroundColor: "#ccc" }}>
                {/*<div className="person_name" style={{ fontWeight: "600" }}>Kyle</div>*/}
                <div className="person_message text-left">this is just a mock conversation, no need to pay any attention here.</div>
              </div>
            </div>
          </div>
          
          <div className="card-plain text-left message d-block float-left m-2 w-100">
            <div className="card-body p-2">
              <div className="bg-dark rounded-circle float-left mr-2">
                <img src="/img/logo.png" height="40px" alt="logo" />
              </div>
              <div id="incoming_message" className="ml-5 p-2 rounded" style={{ backgroundColor: "#ccc" }}>
                <div className="person_name" style={{ fontWeight: "600" }}>Raf</div>
                <div className="person_message">this is just a mock conversation, no need to pay any attention here.</div>
              </div>
            </div>
          </div>

          <div className="card-plain text-right message d-block float-right m-2 w-100">
            <div className="card-body p-2">
              <div className="bg-dark rounded-circle float-right ml-2">
                <img src="/img/logo.png" height="40px" alt="logo" />
              </div>
              <div id="outgoing_message" className="p-2 rounded float-right" style={{ backgroundColor: "#ccc" }}>
                {/*<div className="person_name" style={{ fontWeight: "600" }}>Kyle</div>*/}
                <div className="person_message text-left">this is just a mock conversation, no need to pay any attention here.</div>
              </div>
            </div>
          </div>
          
          <div className="card-plain text-left message d-block float-left m-2 w-100">
            <div className="card-body p-2">
              <div className="bg-dark rounded-circle float-left mr-2">
                <img src="/img/logo.png" height="40px" alt="logo" />
              </div>
              <div id="incoming_message" className="ml-5 p-2 rounded" style={{ backgroundColor: "#ccc" }}>
                <div className="person_name" style={{ fontWeight: "600" }}>Raf</div>
                <div className="person_message">this is just a mock conversation, no need to pay any attention here.</div>
              </div>
            </div>
          </div>

          <div className="card-plain text-right message d-block float-right m-2 w-100">
            <div className="card-body p-2">
              <div className="bg-dark rounded-circle float-right ml-2">
                <img src="/img/logo.png" height="40px" alt="logo" />
              </div>
              <div id="outgoing_message" className="p-2 rounded float-right" style={{ backgroundColor: "#ccc" }}>
                {/*<div className="person_name" style={{ fontWeight: "600" }}>Kyle</div>*/}
                <div className="person_message text-left">this is just a mock conversation, no need to pay any attention here.</div>
              </div>
            </div>
          </div>
          
          <div className="card-plain text-left message d-block float-left m-2 w-100">
            <div className="card-body p-2">
              <div className="bg-dark rounded-circle float-left mr-2">
                <img src="/img/logo.png" height="40px" alt="logo" />
              </div>
              <div id="incoming_message" className="ml-5 p-2 rounded" style={{ backgroundColor: "#ccc" }}>
                <div className="person_name" style={{ fontWeight: "600" }}>Raf</div>
                <div className="person_message">this is just a mock conversation, no need to pay any attention here.</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}