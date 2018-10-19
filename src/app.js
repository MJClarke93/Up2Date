import React, { Component } from 'react';
import { AuthenticationContext } from './authentication';

import Header from './header/header.js';
import Footer from './footer/footer.js';

import './site.css';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.Authenticate = () => {
      this.setState(state => ({
        isAuthenticated: true
      }));
    };
  
    this.unAuthenticate = () => {
      this.setState(state => ({
        isAuthenticated: false
      }));
    };

    this.setAuthenticatedName = (name) => {
      this.setState(state => ({
        AuthenticatedName: name
      }));
    };

    this.state = {
      isAuthenticated: false,
      AuthenticatedName: null,
      Authenticate: this.Authenticate,
      unAuthenticate: this.unAuthenticate,
      setAuthenticatedName: this.setAuthenticatedName
    }
  }

  render() {
    return (
      <div className="site-container">
        <AuthenticationContext.Provider value={this.state}>
          <Header />
            {this.props.children}
          <Footer />
        </AuthenticationContext.Provider>
      </div>
    );
  }
}
