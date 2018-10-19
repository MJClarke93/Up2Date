import React, {Component} from 'react';
import { browserHistory } from "react-router";

export const AuthenticationContext = React.createContext({
    isAuthenticated: false,
    AuthenticatedName: null,
    Authenticate: () => {},
	unAuthenticate: () => {},
	setAuthenticatedName: () => {}
  });

export class AuthCheck extends Component {
	componentDidMount() {
		if (this.props.isAuthenticated === false) {
			browserHistory.push("/login");
		}
	}
	render() {
		return null
	}
}

export class AlreadyAuthCheck extends Component {
	componentDidMount() {
		if (this.props.isAuthenticated === true) {
			browserHistory.push("/dashboard");
		}
	}
	render() {
		return null
	}
}