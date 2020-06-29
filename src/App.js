import React from "react";
import logo from "./logo.svg";
import "./App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Spinner, Container, Row, Col } from "reactstrap";
import axios from "axios";
import { CSVLink, CSVDownload } from "react-csv";
import Pusher from "pusher-js";
// todo - add fancier date range picker
// todo - default end date to a week in the future
// todo - show http errors on website e.g. end date before start date

class App extends React.Component {
  state = {
    startDate: new Date(),
    endDate: new Date(),
    data: [],
    spinnerVisibility: "hidden",
    downloadDisplay: "none",
    totalAPICalls: [],
    usersOnline: [],
  };

  componentDidMount() {
    this.getTotalAPICalls();
    const pusher = new Pusher("656d577c7e59c011ff9f", {
      cluster: "eu",
      encrypted: true,
    });
    // pusher allows for the realtime updates
    const channel = pusher.subscribe("my-channel");
    channel.bind("updateapicalls", (res) => {
      this.setState({ totalAPICalls: res.apiCalls });
    });
    channel.bind("updateusersonline", (res) => {
      this.setState({ usersOnline: res.usersOnline });
    });
    this.addUsersOnline();

    window.addEventListener("beforeunload", (event) => {
      this.removeUsersOnline();
    });
  }

  handleStartDateChange = (date) => {
    this.setState({
      startDate: date,
    });
  };

  handleEndDateChange = (date) => {
    this.setState({
      endDate: date,
    });
  };

  dateToString = (date) => {
    const isoDate = date.toISOString();
    const stringDate =
      isoDate.substr(0, 4) + isoDate.substr(5, 2) + isoDate.substr(8, 2);
    return stringDate;
  };

  handleClick = () => {
    this.setState({ spinnerVisibility: "visible" });
    const startDate = this.dateToString(this.state.startDate);
    const endDate = this.dateToString(this.state.endDate);
    this.updateTotalAPICalls();
    axios
      .get(
        // Originially I tried calling the API in AWS but it's not sercure on HTTPS so Heroku didn't like it. As a quick workaround I just deployed a copy of the API in Heroku.
        `https://cal-gen-api.herokuapp.com/calendar?start_date=${startDate}&end_date=${endDate}`
      )
      .then((res) => {
        this.setState({ data: res.data });
        this.setState({ spinnerVisibility: "hidden" });
        this.setState({ downloadDisplay: "inline-block" });
      })
      .catch((err) => console.log(err));
  };

  getTotalAPICalls = () => {
    axios
      .get("https://calendar-generator-front-api.herokuapp.com/getapicalls")
      .then((res) => {
        this.setState({ totalAPICalls: res.data.apiCalls });
        console.log(res);
      })
      .catch((err) => console.log(err));
  };

  updateTotalAPICalls = () => {
    axios
      .post("https://calendar-generator-front-api.herokuapp.com/updateapicalls")
      .then((res) => {
        this.setState({ totalAPICalls: res.data.apiCalls });
        console.log(res);
      })
      .catch((err) => console.log(err));
  };

  addUsersOnline = () => {
    //SYNC REQUEST
    let xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      "https://calendar-generator-front-api.herokuapp.com/addusersonline",
      false
    );
    try {
      xhr.send();
      if (xhr.status != 200) {
        alert(`Error ${xhr.status}: ${xhr.statusText}`);
      } else {
        let res = JSON.parse(xhr.response);
        console.log("ADDED RES:", res);
        this.setState({ usersOnline: res.usersOnline });
      }
    } catch (err) {
      // instead of onerror
      console.log(err);
    }
  };

  removeUsersOnline = () => {
    navigator.sendBeacon(
      "https://calendar-generator-front-api.herokuapp.com/removeusersonline"
    );
  };

  render() {
    return (
      <div className="App">
        <Container className="themed-container" fluid={true}>
          <Row>
            <Col
              xs="3"
              className="border shadow p-5"
              style={{ borderRadius: "10px" }}
            >
              <br />
              <em>Start Date:</em>{" "}
              <DatePicker
                selected={this.state.startDate}
                onChange={this.handleStartDateChange}
              />
              <br />
              <br />
              <em>End Date:</em>{" "}
              <DatePicker
                selected={this.state.endDate}
                onChange={this.handleEndDateChange}
              />
              <br />
              <br />
              <Button onClick={this.handleClick}>Get Calendar</Button>
              {"   "}
              <Spinner
                type="grow"
                color="info"
                style={{
                  width: "3rem",
                  height: "3rem",
                  visibility: this.state.spinnerVisibility,
                }}
              />
              <CSVLink
                data={this.state.data}
                style={{
                  display: this.state.downloadDisplay,
                }}
              >
                Download CSV
              </CSVLink>
            </Col>
            <Col
              xs="2"
              className="border shadow p-5 number"
              style={{ borderRadius: "10px", margin: "10px" }}
            >
              Total API Calls
              <br />
              {this.state.totalAPICalls}
            </Col>
            <Col
              xs="2"
              className="border shadow p-5 number"
              style={{ borderRadius: "10px", margin: "10px" }}
            >
              Users Online
              <br />
              {this.state.usersOnline}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
