import React from "react";
import logo from "./logo.svg";
import axios from "axios";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import "./App.css";

export default class App extends React.Component {
  constructor() {
    super();
    this.apiKey = `eb4cde2daae74dcfbbf324987283b2d4`;
    this.state = {
      predictions: [],
      route: "Green-D",
      station: "place-boyls"
    };
    this.getPredictions(this.state.station, this.state.route);
    this.destinations = {
      "Green-B": { outbound: "Boston College", inbound: "Park Street" },
      "Green-C": { outbound: "Cleveland Circle", inbound: "North Station" },
      "Green-D": { outbound: "Riverside", inbound: "Government Center" },
      "Green-E": { outbound: "Heath Street", inbound: "Lechmere" }
    };
  }
  componentDidMount() {}

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {this.state.station}
          <div className="predictions">
            <Paper>
              <Table className="table" aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="right">Destination</TableCell>
                    <TableCell align="right">Arrival</TableCell>
                    <TableCell align="right">Departure</TableCell>
                    <TableCell align="right">Vehicle</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Current Location</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.predictions.map(row => (
                    <TableRow key={row.relationships.trip.data.id}>
                      <TableCell align="right">
                        {row.attributes.direction_id === 0
                          ? this.destinations[row.relationships.route.data.id]
                              .outbound
                          : this.destinations[row.relationships.route.data.id]
                              .inbound}
                      </TableCell>
                      <TableCell align="right">
                        {this.getMinSec(new Date(row.attributes.arrival_time))}
                      </TableCell>
                      <TableCell align="right">
                        {this.getMinSec(
                          new Date(row.attributes.departure_time)
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {row.information ? row.information.vehicleNumber : ""}
                      </TableCell>
                      <TableCell align="right">
                        {row.information ? row.information.status : ""}
                      </TableCell>
                      <TableCell align="right">
                        {row.information ? row.information.currentLocation : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </div>
        </header>
      </div>
    );
  }

  async getPredictions(station, route) {
    const url = `https://api-v3.mbta.com/predictions?api_key=${this.apiKey}&filter%5Bstop%5D=${station}&filter%5Broute%5D=${route}`;
    const queryResult = await axios.get(url);
    console.log(queryResult);
    const predictions = queryResult.data.data;

    // console.log(predictions);
    predictions.forEach(async prediction => {
      const information = {
        vehicleNumber: "unknown",
        status: "",
        currentLocation: ""
      };

      // console.log(prediction.status);
      const vehicle = prediction.relationships.vehicle.data;
      // console.log(vehicle);
      if (vehicle) {
        const vehicleUrl = `https://api-v3.mbta.com/vehicles/${vehicle.id}?api_key=${this.apiKey}`;
        const resultVehicle = await axios.get(vehicleUrl);
        // console.log(resultVehicle);
        information.vehicleNumber = resultVehicle.data.data.attributes.label;
        information.status = prediction.status
          ? `${prediction.status} : ${resultVehicle.data.data.attributes.current_status}`
          : resultVehicle.data.data.attributes.current_status;
        // console.log(resultVehicle.data.data.attributes.label);
        // console.log(resultVehicle.data.data.attributes.current_status);
        // console.log(resultVehicle.data.data.relationships.stop.data.id);
        const stop = resultVehicle.data.data.relationships.stop.data.id;
        const stopUrl = `https://api-v3.mbta.com/stops/${stop}?api_key=${this.apiKey}`;
        const resultStop = await axios.get(stopUrl);
        // console.log(resultStop);
        // console.log(resultStop.data.data.attributes.description);
        information.currentLocation =
          resultStop.data.data.attributes.description;
      }
      prediction.information = information;
      this.setState({ predictions: predictions });
    });
    console.log(predictions);
    // this.setState({ predictions: predictions });
  }

  getMinSec(date) {
    const absoluteEpoch = date - Date.now();
    if (absoluteEpoch < 0) {
      return `Departing (${date.toLocaleTimeString()})`;
    }
    const absoluteTime = new Date(absoluteEpoch);
    // console.log(absoluteTime);
    const minutes = absoluteTime.getMinutes();
    const rawSeconds = `${absoluteTime.getSeconds()}`;
    const seconds = rawSeconds.padStart(2, "0");
    return `${minutes}:${seconds} (${date.toLocaleTimeString()})`;
  }

  async getVehicleNumber(vehicle) {
    if (vehicle === null) {
      return "unknown";
    } else {
      const url = `https://api-v3.mbta.com/vehicles/${vehicle.id}`;
      const result = await axios.get(url);
      console.log(result);
      return JSON.stringify(result);
    }
  }
}

/*
// prediction.attributes.direction_id === 0 // ? "Riverside" // :
// "Government Center"
*/
