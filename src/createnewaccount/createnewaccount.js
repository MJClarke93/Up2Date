import React, { Component } from "react";
import "./createnewaccount.css";
import { HOSTNAME, SERVERPORT } from "../global";
import { browserHistory } from "react-router";
import { AuthenticationContext, AlreadyAuthCheck } from "../authentication";
import { Link } from "react-router";

//----------------------------------------------------------------------------
//New Account Form:
//Users from Login page are redirected to this page to create new account
//User can sign in and save their log in details in database
//Once new account is created, the user is redired back to login form.
//----------------------------------------------------------------------------
//New Account Form Validationa and Authentication:
//The mandatory fields are checked before submitting to database.
//Though database handles the blank fields, this section checks the input.
// Error is sent but data is not passed to database if mandatory fields are blank.
//                nameError- the error message sent if name field is sent empty
//                passwordError-the error message sent if password field is sent empty
//Validation is checked at handleSubmit method.
//Response at HandleSubmit is checked to confirm successful creation of new account(success===true)
//----------------------------------------------------------------------------

class NewAccountForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      email: "",
      nameError: "",
      emailError: "",
      passwordError: "",
      accountError: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
  validate = () => {
    let nameError = "";
    let emailError = "";
    let passwordError = "";

    if (!this.state.username) {
      nameError = "Mandatory Field.";
    }

    if (!this.state.password) {
      passwordError = "Mandatory Field.";
    }

    if (!this.state.email.includes("@")) {
      emailError = "Invalid Email Address !!";
    }

    if (!this.state.email) {
      emailError = "Mandatory Field.";
    }

    if (emailError || passwordError || nameError) {
      this.setState({ emailError, passwordError, nameError });
      return false;
    }

    return true;
  };

  handleSubmit(event) {
    event.preventDefault();
    const isValid = this.validate();
    if (isValid) {
      this.setState({ nameError: "", emailError: "", passwordError: "" });
      fetch("http://" + HOSTNAME + SERVERPORT + "/api", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password
        })
      })
        .then(res => {
          return res.json();
        })
        .then(msg => {
          if (msg.success === true) {
            browserHistory.push("/login");
          } else {
            this.setState({ accountError: "An error occured: " + msg.error });
          }
        });
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        Username : <br />
        <input
          type="text"
          name="username"
          value={this.state.username}
          onChange={this.handleChange}
        />
        <div style={{ fontSize: 14, color: "red" }}>{this.state.nameError}</div>
        <br />
        Password: <br />
        <input
          type="password"
          name="password"
          value={this.state.password}
          onChange={this.handleChange}
        />
        <div style={{ fontSize: 14, color: "red" }}>
          {this.state.passwordError}
        </div>
        <br />
        Email: <br />
        <input
          type="text"
          name="email"
          value={this.state.email}
          onChange={this.handleChange}
        />
        <div style={{ fontSize: 14, color: "red" }}>
          {this.state.emailError}
        </div>
        <div style={{ fontSize: 14, color: "red" }}>
          {this.state.accountError}
        </div>
        <br />
        <input type="submit" value="Sign Up" />
        <br />
        <br />
        <div className="page-newAccountArea">
          <p>
            <Link to="/login">Log-In</Link>
          </p>
        </div>
      </form>
    );
  }
}

export default class CreatNewAccount extends Component {
  render() {
    return (
      <div className="page-newAccount">
        <p>Create new account...</p>
        <AuthenticationContext.Consumer>
          {({
            isAuthenticated,
            AuthenticatedName,
            Authenticate,
            unAuthenticate,
            setAuthenticatedName
          }) => <AlreadyAuthCheck isAuthenticated={isAuthenticated} />}
        </AuthenticationContext.Consumer>
        <NewAccountForm />
      </div>
    );
  }
}
