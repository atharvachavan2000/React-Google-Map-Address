import React, { Component } from "react";
import {
  withGoogleMap,
  GoogleMap,
  withScriptjs,
  InfoWindow,
  Marker,
} from "react-google-maps";
import Geocode from "react-geocode";
import Autocomplete from "react-google-autocomplete";
import { TextField, Grid } from "@material-ui/core";

Geocode.setApiKey("Your Api Key goes here");
Geocode.enableDebug();

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: "",
      city: "",
      area: "",
      state: "",
      district: "",
      mapPosition: {
        lat: this.props.center.lat,
        lng: this.props.center.lng,
      },
      markerPosition: {
        lat: this.props.center.lat,
        lng: this.props.center.lng,
      },
    };
  }

  componentDidMount() {
    Geocode.fromLatLng(
      this.state.mapPosition.lat,
      this.state.mapPosition.lng
    ).then(
      (response) => {
        console.log(response.results[0]);
        const address = response.results[0].formatted_address,
          addressArray = response.results[0].address_components;
        this.fillAddress(
          address,
          this.state.mapPosition.lat,
          this.state.mapPosition.lng,
          addressArray
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.markerPosition.lat !== this.props.center.lat ||
      this.state.address !== nextState.address ||
      this.state.city !== nextState.city ||
      this.state.area !== nextState.area ||
      this.state.state !== nextState.state ||
      this.state.district !== nextState.district
    ) {
      return true;
    } else if (this.props.center.lat === nextProps.center.lat) {
      return false;
    }
  }

  getCity = (addressArray) => {
    let city = "";
    for (let i = 0; i < addressArray.length; i++) {
      if (addressArray[i].types[0] && "locality" === addressArray[i].types[0]) {
        city = addressArray[i].long_name;
        return city;
      }
    }
  };

  getDistrict = (addressArray) => {
    let district = "";
    for (let i = 0; i < addressArray.length; i++) {
      if (
        addressArray[i].types[0] &&
        "administrative_area_level_2" === addressArray[i].types[0]
      ) {
        district = addressArray[i].long_name;
        return district;
      }
    }
  };

  getArea = (addressArray) => {
    let area = "";
    for (let i = 0; i < addressArray.length; i++) {
      if (addressArray[i].types[0]) {
        for (let j = 0; j < addressArray[i].types.length; j++) {
          if (
            "sublocality_level_1" === addressArray[i].types[j] ||
            "locality" === addressArray[i].types[j]
          ) {
            area = addressArray[i].long_name;
            return area;
          }
        }
      }
    }
  };

  getState = (addressArray) => {
    let state = "";
    for (let i = 0; i < addressArray.length; i++) {
      for (let i = 0; i < addressArray.length; i++) {
        if (
          addressArray[i].types[0] &&
          "administrative_area_level_1" === addressArray[i].types[0]
        ) {
          state = addressArray[i].long_name;
          return state;
        }
      }
    }
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onInfoWindowClose = (event) => {};

  onMarkerDragEnd = (event) => {
    let newLat = event.latLng.lat(),
      newLng = event.latLng.lng();

    Geocode.fromLatLng(newLat, newLng).then(
      (response) => {
        const address = response.results[0].formatted_address,
          addressArray = response.results[0].address_components;
        this.fillAddress(address, newLat, newLng, addressArray);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  onPlaceSelected = (place) => {
    console.log("plc", place);
    const address = place.formatted_address,
      addressArray = place.address_components;
    this.fillAddress(
      address,
      place.geometry.location.lat(),
      place.geometry.location.lng(),
      addressArray
    );
  };

  fillAddress = (address, lat, long, addressArray) => {
    const city = this.getCity(addressArray),
      area = this.getArea(addressArray),
      state = this.getState(addressArray),
      district = this.getDistrict(addressArray),
      latValue = lat,
      lngValue = long;
    // Set these values in the state.
    this.setState(
      {
        address: address ? address : "",
        area: area ? area : "",
        city: city ? city : "",
        state: state ? state : "",
        district: district ? district : "",
        markerPosition: {
          lat: latValue,
          lng: lngValue,
        },
        mapPosition: {
          lat: latValue,
          lng: lngValue,
        },
      },
      () => {
        this.props.loadingMapAddress(this.state);
      }
    );
  };

  render() {
    const AsyncMap = withScriptjs(
      withGoogleMap((props) => (
        <GoogleMap
          google={this.props.google}
          defaultZoom={this.props.zoom}
          defaultCenter={{
            lat: this.state.mapPosition.lat,
            lng: this.state.mapPosition.lng,
          }}
        >
          {/* InfoWindow on top of marker */}
          <InfoWindow
            onClose={this.onInfoWindowClose}
            position={{
              lat: this.state.markerPosition.lat + 0.0018,
              lng: this.state.markerPosition.lng,
            }}
          >
            <div>
              <span style={{ padding: 0, margin: 0 }}>
                {this.state.address}
              </span>
            </div>
          </InfoWindow>
          {/*Marker*/}
          <Marker
            google={this.props.google}
            name={"Dolores park"}
            draggable={true}
            onDragEnd={this.onMarkerDragEnd}
            position={{
              lat: this.state.markerPosition.lat,
              lng: this.state.markerPosition.lng,
            }}
          />
          <Marker />
          {/* For Auto complete Search Box */}
          <Autocomplete
            style={{
              width: "100%",
              height: "40px",
              paddingLeft: "16px",
              marginTop: "2px",
              marginBottom: "500px",
            }}
            onPlaceSelected={this.onPlaceSelected}
            types={["(regions)"]}
          />
        </GoogleMap>
      ))
    );
    let map;
    if (this.props.center.lat !== undefined) {
      map = (
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
          }}
        >
          <AsyncMap
            googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP}&libraries=places`}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: this.props.height }} />}
            mapElement={<div style={{ height: `100%` }} />}
          />
          <div>
            <br /> <br />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  value={this.state.area}
                  readOnly
                  onChange={this.props.handleChange}
                  required
                  id={"Area"}
                  name={"Area"}
                  label={"Area"}
                  fullWidth
                  autoComplete="Area"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  value={this.state.city}
                  readOnly
                  // onChange={this.onChange}
                  onChange={this.props.handleChange}
                  required
                  id={"City"}
                  name={"City"}
                  label={"City/Town/Village"}
                  fullWidth
                  autoComplete="City"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  value={this.state.district}
                  readOnly
                  onChange={this.props.handleChange}
                  required
                  id={"District"}
                  name={"District"}
                  label={"District"}
                  fullWidth
                  autoComplete="District"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  value={this.state.state}
                  readOnly
                  // onChange={this.onChange}
                  onChange={this.props.handleChange}
                  required
                  id={"State"}
                  name={"State"}
                  label={"State"}
                  fullWidth
                  autoComplete="State"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  value={this.state.address}
                  readOnly
                  onChange={this.props.handleChange}
                  required
                  id={"Address"}
                  name={"Address"}
                  label={"Address"}
                  fullWidth
                  autoComplete="Address"
                />
              </Grid>
            </Grid>
            {/* <div className="form-group">
              <label htmlFor="">City</label>
              <input
                type="text"
                name="city"
                className="form-control"
                onChange={this.onChange}
                readOnly="readOnly"
                value={this.state.city}
              />
            </div>
            <div className="form-group">
              <label htmlFor="">Area</label>
              <input
                type="text"
                name="area"
                className="form-control"
                onChange={this.onChange}
                readOnly="readOnly"
                value={this.state.area}
              />
            </div>
            <div className="form-group">
              <label htmlFor="">State</label>
              <input
                type="text"
                name="state"
                className="form-control"
                onChange={this.onChange}
                readOnly="readOnly"
                value={this.state.state}
              />
            </div>
            <div className="form-group">
              <label htmlFor="">Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                onChange={this.onChange}
                readOnly="readOnly"
                value={this.state.address}
              />
            </div>*/}
          </div>
        </div>
      );
    } else {
      map = <div style={{ height: this.props.height }} />;
    }
    return map;
  }
}
export default Map;
