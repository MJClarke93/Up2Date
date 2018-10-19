import React, { Component } from "react";
import "./settings.css";
import { HOSTNAME, SERVERPORT } from "../global";
import { AuthenticationContext, AuthCheck } from "../authentication";
import { browserHistory } from "react-router";

//---------------------------------------------------------------------------------------
//Settings.js has got 3 different forms: TagForm, UpdateForm and DeleteForm
//Each form performs different task.
//Validation and Authentication is applied in all forms
//---------------------------------------------------------------------------------------
//Tag form:
//Whenever user wants latest updates about new tag, they can submit new tag via this form
//validation is checked in handleSubmit method an PUT to /api/prefs
//---------------------------------------------------------------------------------------

class TagForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: "Google, Elon Musk, Android",
      TagError: ""
    };

    this.handleTagSubmit = this.handleTagSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleTagSubmit(event) {
    event.preventDefault();

    var new_tags = this.state.tags;
    new_tags = new_tags.split(",");
    for (var i = 0; i < new_tags.length; i++) {
      new_tags[i] = new_tags[i].trim();
    }

    if (new_tags !== "") {
      console.log(new_tags);
      var username = this.props.AuthenticatedName;
      var fetch_url = "http://" + HOSTNAME + SERVERPORT + "/api/prefs";
      fetch(fetch_url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          tags: new_tags
        })
      })
        .then(res => {
          return res.json();
        })
        .then(msg => {
          if (msg.success === true) {
            this.setState({ TagError: "" });
          } else {
            this.setState({ TagError: "An error occured: " + msg.error });
          }
        });
    } else {
      this.setState({ TagError: "Please enter at least one tag." });
    }
  }

  render() {
    return (
      <div name="settings-tags">
        <br />
        <p>
          To pick keywords you would like to receive posts about, enter them
          below (separated by commas):
        </p>
        <form onSubmit={this.handleTagSubmit}>
          <input
            id="tags_input"
            type="texta"
            name="tags"
            value={this.state.tags}
            onChange={this.handleChange}
          />
          <br />
          <div style={{ fontSize: 14, color: "red" }}>
            {this.state.TagError}
          </div>
          <input id="update_tags_button" type="submit" value="Update Tags" />
        </form>
      </div>
    );
  }
}

//--------------------------------------------------------------------------
///Update Form:
//This is the form that user need to use to Update their login details
//If users submits a username and password, they can change their password.
//If dont submit valid details, they will receive an error message.
//validation is checked in handleSubmit method an PUT to /api/creds
//---------------------------------------------------------------------------

class UpdateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      UpdateError: "",
      old_password: "",
      new_password: "",
      old_passwordError: "",
      new_passwordError: ""
    };
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }
  handleUpdate(event) {
    event.preventDefault();

    var username = this.props.AuthenticatedName;

    var fetch_url = "http://" + HOSTNAME + SERVERPORT + "/api/creds";
    fetch(fetch_url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: this.state.old_password,
        new_password: this.state.new_password
      })
    })
      .then(res => {
        return res.json();
      })
      .then(msg => {
        if (msg.success === true) {
          if (msg.result === true) {
            this.setState({ UpdateError: "" });
            browserHistory.push("/dashboard");
            this.props.Authenticate();

            this.props.setAuthenticatedName(this.state.username);
          } else {
            this.setState({
              UpdateError: "Please enter valid username and password"
            });
          }
        } else {
          this.setState({ UpdateError: "An error occurred: " + msg.error });
        }
      });
  }

  render() {
    return (
      <div id="settings-update">
        <br />
        <p>To update your password, enter your new and old password below:</p>
        <form onSubmit={this.handleUpdate}>
          <table className="centered-table">
            <tbody>
              <tr>
                <td>Old Password: </td>
                <td>
                  <input
                    type="password"
                    name="old_password"
                    value={this.state.old_password}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td>New Password: </td>
                <td>
                  <input
                    type="password"
                    name="new_password"
                    value={this.state.new_password}
                    onChange={this.handleChange}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <input
                    id="update_pwd_button"
                    type="submit"
                    value="Update Password"
                    onSubmit={this.handleUpdate}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}

//--------------------------------------------------------------------------------
//Delete form :
//this form is used when user wants to delete their account
//if user can submit a valid username and password, they can successfully delete
//their details from database
//handleDelete method forwards the details from this form to delete the account
//validation is checked in handleSubmit method an DELETE to /api
//--------------------------------------------------------------------------------

class DeleteForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DeleteError: "",
      password: ""
    };
    this.handleDelete = this.handleDelete.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleDelete(event) {
    event.preventDefault();
    var username = this.props.AuthenticatedName;
    var fetch_url = "http://" + HOSTNAME + SERVERPORT + "/api";
    fetch(fetch_url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: this.state.password
      })
    })
      .then(res => {
        return res.json();
      })
      .then(msg => {
        if (msg.success === true) {
          if (msg.result === true) {
            this.setState({ DeleteError: "" });
            this.props.unAuthenticate();
            browserHistory.push("/login");
          } else {
            this.setState({
              DeleteError: "Username and password do not match."
            });
          }
        } else {
          this.setState({ DeleteError: "An error occured: " + msg.error });
        }
      });
  }

  render() {
    return (
      <div id="settings-delete">
        <br />
        <p>To completely delete your account, enter your password below:</p>
        <form onSubmit={this.handleDelete}>
          Password :
          <input
            type="password"
            name="password"
            value={this.state.password}
            onChange={this.handleChange}
          />
          <br />
          <button
            id="delete_account_button"
            type="submit"
            onClick={this.handleDelete}
          >
            Delete Account
          </button>
        </form>
      </div>
    );
  }
}

export default class Settings extends Component {
  render() {
    return (
      <div id="settings_page" className="page-settings">
        <div id="settings_form">
          <p id="settings_header">Settings</p>
          <AuthenticationContext.Consumer>
            {({
              isAuthenticated,
              AuthenticatedName,
              Authenticate,
              unAuthenticate,
              setAuthenticatedName
            }) => (
              <span>
                <AuthCheck isAuthenticated={isAuthenticated} />
                <TagForm AuthenticatedName={AuthenticatedName} />
                <UpdateForm AuthenticatedName={AuthenticatedName} />
                <DeleteForm
                  AuthenticatedName={AuthenticatedName}
                  unAuthenticate={unAuthenticate}
                />
              </span>
            )}
          </AuthenticationContext.Consumer>
        </div>
      </div>
    );
  }
}
