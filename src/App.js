import React from "react";
import logo from "./logo.svg";
import "./App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Spinner, Container, Row, Col } from "reactstrap";
import axios from "axios";
import { CSVLink, CSVDownload } from "react-csv";

// todo - add fancier date range picker
// todo - default end date to a week in the future
// todo - show http errors on website e.g. end date before start date

class App extends React.Component {
  state = {
    startDate: new Date(),
    endDate: new Date(),
    data: [],
    spinnerDisplay: "none",
    downloadDisplay: "none",
    totalAPICalls: [],
  };

  componentDidMount() {
    this.getTotalAPICalls();
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
    this.setState({ spinnerDisplay: "inline-block" });
    const startDate = this.dateToString(this.state.startDate);
    const endDate = this.dateToString(this.state.endDate);
    this.updateTotalAPICalls();
    axios
      .get(
        // Originially I tried calling the API in AWS but it's not sercure on HTTPS so Heroku didn't like it. As a quick workaround I just deployed a copy of the API in Heroku.
        `https://calendar-generator-api.herokuapp.com/calendar?start_date=${startDate}&end_date=${endDate}`
      )
      .then((res) => {
        this.setState({ data: res.data });
        this.setState({ spinnerDisplay: "none" });
        this.setState({ downloadDisplay: "inline-block" });
      })
      .catch((err) => console.log(err));
  };

  getTotalAPICalls = () => {
    axios
      .get("https://guarded-bayou-83935.herokuapp.com/getapicalls")
      .then((res) => {
        this.setState({ totalAPICalls: res.data.apiCalls });
        console.log(res);
      })
      .catch((err) => console.log(err));
  };

  updateTotalAPICalls = () => {
    axios
      .post("https://guarded-bayou-83935.herokuapp.com/updateapicalls")
      .then((res) => {
        this.setState({ totalAPICalls: res.data.apiCalls });
        console.log(res);
      })
      .catch((err) => console.log(err));
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
              <DatePicker
                selected={this.state.startDate}
                onChange={this.handleStartDateChange}
              />
              <br />
              <DatePicker
                selected={this.state.endDate}
                onChange={this.handleEndDateChange}
              />
              <br />
              <br />
              <Button onClick={this.handleClick}>Get Calendar</Button>{" "}
              <Spinner
                type="grow"
                color="info"
                style={{
                  width: "3rem",
                  height: "3rem",
                  display: this.state.spinnerDisplay,
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
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
