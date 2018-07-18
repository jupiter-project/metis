import React from 'react';
import { render } from 'react-dom';


class MenuComponent extends React.Component {
  render() {
    return (
        <nav id="sideMenu">
            <ul className="nav flex-column">
                <li className="nav-item">
                    <a className="nav-link" href="/">Home</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/account">Account</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/pool">Pool</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/donations">Donation Change</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="/investments">Invest More</a>
                </li>
            </ul>
        </nav>
    );
  }
}

const MenuExport = () => {
  if (document.getElementById('platform-menu') !== null) {
    // const element = document.getElementById('props');
    // const props = JSON.parse(element.getAttribute('data-props'));

    render(<MenuComponent />, document.getElementById('platform-menu'));
  }
};

module.exports = MenuExport();
