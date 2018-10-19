import React, { Component } from "react";
import io from "socket.io-client";
import "./dashboard.css";
import { HOSTNAME, SERVERPORT } from "../global";
import { AuthenticationContext, AuthCheck } from "../authentication";

var socket = io("http://" + HOSTNAME + SERVERPORT);

function subscribeSamples(cb) {
  socket.on("receivePosts", data => {
    cb(data);
  });
}

class NewsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newsposts: []
    };
  }

  componentDidMount() {
    socket.emit("loadPosts", { username: this.props.AuthenticatedName });
    subscribeSamples(data => {
      var currentlist = this.state.newsposts;
      for (var i = 0; i < data.length; i++) {
        currentlist.unshift(data[i]);
      }
      var a = currentlist.slice(0, 10); // Choose number of posts to be displayed per page
      this.setState({ newsposts: a });
    });
  }

  makeNewsList() {
    var listdom = this.state.newsposts.map(post => (
      <div id="post_div" key={post.id} className="dashboard-newspost">
        <p>
          <b><a href={post.url}>{post.title}</a></b>
          <br />
          {post.content}
          <br />
          <br />
          <i>
            Posted by {post.author} on {post.source} | {post.posted}
          </i>
          <br />
        </p>
      </div>
    ));
    return listdom;
  }

  render() {
    return (
      <div id="dashboard_news_div" className="dashboard-newslist">
        {this.makeNewsList()}
      </div>
    );
  }
}

export default class Dashboard extends Component {
  render() {
    return (
      <div id="dashboard_page" className="page-dashboard">
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
              <NewsList AuthenticatedName={AuthenticatedName} />
            </span>
          )}
        </AuthenticationContext.Consumer>
      </div>
    );
  }
}
