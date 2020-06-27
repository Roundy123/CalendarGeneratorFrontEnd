import React from "react";
import logo from "./logo.svg";
import "./App.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Spinner } from "reactstrap";
import axios from "axios";
import { CSVLink, CSVDownload } from "react-csv";

// todo - add fancier date range picker
// todo - default end date to a week in the future

class App extends React.Component {
  state = {
    startDate: new Date(),
    endDate: new Date(),
    data: [],
    spinnerDisplay: "none",
    downloadDisplay: "none",
  };

  handleStartDateChange = (date) => {
    this.setState({
      startDate: date,
    });
  };

  handleEndDateChange = (date) => {
    this.setState({
      startDate: date,
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
    axios
      .get(
        `http://13.59.225.157/calendar?start_date=${startDate}&end_date=${endDate}`
      )
      .then((res) => {
        this.setState({ data: res.data });
        this.setState({ spinnerDisplay: "none" });
        this.setState({ downloadDisplay: "inline-block" });
      })
      .catch((err) => console.log(err));
  };

  render() {
    return (
      <div className="App">
        hello
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
      </div>
    );
  }
}

export default App;
