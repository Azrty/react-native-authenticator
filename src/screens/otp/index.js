import React, { Component } from "react";
import Layout from "./Layout";
import OTP from "../../lib/otp";
import settings from "../../lib/settings";
import { storeData, retrieveData } from "../../lib/storage";

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      progress: 100,
      authCode: 0,
      secretKey: '',
      remainingTime: settings.otp.options.timeSlice
    };
  }

  componentDidMount() {
    retrieveData().then((data) => {
      let secret = data.secret;
      this.setState({ secretKey: secret }, () => {
        this._startTheTimer();
      });
    });
  }

  componentWillUnmount() {
    this.timerInterval && clearInterval(this.timerInterval);
    this.timerInterval = false;
  }

  _generateNewCode = () => {
    let options = { ...settings.otp.options, secret: this.state.secretKey };
    let otp = OTP(options);
    // HOTP: let newAuthCode = otp.hotp(`pas the counter here`);
    let newAuthCode = otp.totp();
    // console.log(newAuthCode);
    this.setState({ authCode: newAuthCode });
  }

  _getRemainingTime = (epoch, timeSlice) => {
    return Math.floor(timeSlice + ((timeSlice - ((new Date().getTime() - epoch) % (timeSlice * 1000))) / 1000));
  }

  _startTheTimer() {
    this._generateNewCode();
    this.timerInterval = setInterval(() => {
      remainingTime = this._getRemainingTime(settings.otp.options.epoch, settings.otp.options.timeSlice);
      this._generateNewCode();

      let progress = 100 - ((100 * remainingTime) / settings.otp.options.timeSlice);
      // console.log(progress, remainingTime);
      this.setState({ progress, remainingTime });
    }, 1000);
  }

  _logout = () => {
    storeData({ token: '', secret: '' }).then(() => this.props.navigation.navigate('Home'));
  }

  render() {
    const { authCode, progress, remainingTime } = this.state;
    return (
      <Layout
        authCode={authCode}
        progress={progress}
        remainingTime={remainingTime}
        logout={this._logout}
      />
    );
  }
}

export default Home;