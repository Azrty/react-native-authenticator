import React, { Component } from "react";
import RootNavigation from "./navigations/Root-Navigation.js"; // Update the import path
import CONSTANTS from "./lib/constants.js"; // Update the import path
import settings from "./lib/settings.js"; // Update the import path
import { authorize, checkIfAuthorizedBefore } from "./lib/authorize-service.js"; // Update the import path
import UnAuthorizedScreen from './screens/unauthorized'; // Update the import path

export default class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthorized: false,
      needAuthorizeFlow: settings.authFlowType != CONSTANTS.AUTH_FLOW.NONE,
    };
  }

  async componentDidMount() {
    if (settings.authFlowType == CONSTANTS.AUTHORIZE_TYPE.OAUTH2) {
      let isAuthorizedBefore = await checkIfAuthorizedBefore();
      if (!isAuthorizedBefore) {
        authorize(CONSTANTS.AUTHORIZE_TYPE.IDENTITY_SERVER)
          .then((credentials) => {
            this.setState({ isAuthorized: true });
            this.setState({ token: JSON.stringify(credentials) });
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        this.setState({ isAuthorized: true });
      }
    }
  }

  render() {
    const { isAuthorized, needAuthorizeFlow } = this.state;
    return (
      needAuthorizeFlow && !isAuthorized ? (
        <UnAuthorizedScreen />
      ) : (
        <RootNavigation />
      )
    );
  }
}
