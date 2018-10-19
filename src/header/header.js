import React, { Component } from "react";
import { Link } from "react-router";

import { AuthenticationContext } from "../authentication";
import "./header.css";

function DashboardLink() {
  return <Link to="/dashboard">Dashboard</Link>;
}

function SettingsLink() {
  return <Link to="/settings">Settings</Link>;
}

export default class Header extends Component {
  render() {
    return (
      <div id="top_menu" className="site-header">
        <AuthenticationContext.Consumer>
          {({
            isAuthenticated,
            AuthenticatedName,
            Authenticate,
            unAuthenticate,
            setAuthenticatedName
          }) =>
            isAuthenticated ? (
              <span>
                <DashboardLink /> - <SettingsLink /> - Logged in as:{" "}
                {AuthenticatedName} (
                <Link to="/login" onClick={unAuthenticate}>
                  Log Out
                </Link>
                )
              </span>
            ) : null
          }
        </AuthenticationContext.Consumer>
      </div>
    );
  }
}
