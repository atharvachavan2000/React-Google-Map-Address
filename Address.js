import React, { Component } from "react";
import Map from "./Map/Map";

class Address extends Component {
  render() {
    return (
      <Map
        loadingMapAddress={this.props.loadingMapAddress}
        handleChange={this.props.handleChange}
        values={this.props.values}
        errors={this.props.errors}
        google={this.props.google}
        center={{ lat: 18.5204, lng: 73.8567 }}
        height="300px"
        zoom={15}
      />
    );
  }
}

export default Address;
