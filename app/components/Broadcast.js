/* eslint-disable no-nested-ternary */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Button, Header, Segment, Icon, Tab, Input,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import PageHeader from './common/PageHeader';
import PageWrapper from './PageWrapper';
import DismissibleMessage from './common/DismissibleMessage';

import styles from './Broadcast.scss';
import Scroller from './common/Scroller';
import SpacedGroup from './common/SpacedGroup';

export default class Broadcast extends Component {
  static propTypes = {
    // error actions
    dismissError: PropTypes.func.isRequired,
    // broadcast actions
    startBroadcast: PropTypes.func.isRequired,
    stopBroadcast: PropTypes.func.isRequired,
    refreshBroadcasts: PropTypes.func.isRequired,
    watchBroadcast: PropTypes.func.isRequired,

    // store data
    history: PropTypes.object.isRequired,
    broadcast: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    topNotifOffset: PropTypes.number.isRequired,
  };

  state = {
    password: "",
  }

  renderGlobalError() {
    const errors = this.props.errors || {};
    const errorKey = 'broadcast-global';

    const showGlobalError = errors.displayFlags[errorKey] || false;
    const globalErrorMessage = errors.messages[errorKey] || '';
    return (
      <DismissibleMessage
        className="bottom-spacer"
        error={true}
        visible={showGlobalError}
        icon="warning circle"
        header="An error has occurred"
        content={globalErrorMessage}
        onDismiss={this.props.dismissError}
        dismissParams={[errorKey]}
      />
    );
  }

  renderButton() {
    const { isConnecting, isBroadcasting } = this.props.broadcast;
    const active = isConnecting || isBroadcasting;
    const buttonText = active ? "Stop Broadcast" : "Start Broadcast";
    const onClick = () => {
      if (active) {
        this.props.stopBroadcast();
      } else {
        this.props.startBroadcast(this.state.password);
      }
    };
    return (
      <Button
        color="blue"
        size="large"
        onClick={onClick}
      >
        {buttonText}
      </Button>
    );
  }

  renderRefreshButton() {
    return (
      <Button
        color="blue"
        size="large"
        onClick={() => this.props.refreshBroadcasts(this.state.password)}
      >
        Refresh
      </Button>
    );
  }

  renderBroadcasts() {
    const broadcasts = _.get(this.props.broadcast, 'broadcasts') || [];
    const broadcastEntries = _.map(broadcasts, broadcast => {
      const name = _.get(broadcast, 'name');
      const broadcasterName = _.get(broadcast, ['broadcaster', 'name']);
      return (
        <SpacedGroup key={broadcast.id} direction="horizontal">
          <div>[{broadcasterName}] {name} ({broadcast.id})</div>
          <Button
            color="blue"
            size="small"
            onClick={() => this.props.watchBroadcast(broadcast.id)}
          >
            Watch
          </Button>
        </SpacedGroup>
      );
    });

    return (
      <div>
        {broadcastEntries}
      </div>
    );
  }

  renderNotLoggedIn() {
    return (
      <div className={styles['empty-loader-content']}>
        <Header
          as="h2"
          icon={true}
          color="grey"
          inverted={true}
          textAlign="center"
        >
          <Icon name="question circle outline" />
          <Header.Content>
            Not logged in
            <Header.Subheader>
              You must be logged in to broadcast your gameplay. Go to the settings page to log in.
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Segment basic={true} textAlign="center">
          <Link to="/settings">
            <Button color="blue" size="large">
              Open settings
            </Button>
          </Link>
        </Segment>
      </div>
    );
  }

  renderBroadcastContent() {
    const { slippiConnectionStatus, dolphinConnectionStatus, startTime, endTime, isConnecting, isBroadcasting } = this.props.broadcast;

    return (
      <div>
        <h2>Broadcast</h2>
        <SpacedGroup direction="vertical">
          {this.renderButton()}
          <div>
            <div>Status: {isBroadcasting ? `broadcasting since ${JSON.stringify(startTime)}` : endTime ? `broadcast lasted ${(endTime - startTime) / 1000} seconds` : "not broadcasting"}</div>
            <div>dolphin connection status: {JSON.stringify(dolphinConnectionStatus)}</div>
            <div>slippi connection status: {JSON.stringify(slippiConnectionStatus)}</div>
            <div>isBroadcasting: {JSON.stringify(isBroadcasting)}</div>
            <div>isConnecting: {JSON.stringify(isConnecting)}</div>
          </div>
        </SpacedGroup>
      </div>
    );
  }

  renderSpectateContent() {
    return (
      <div>
        <h2>Spectate</h2>
        {this.renderRefreshButton()}
        {this.renderBroadcasts()}
      </div>
    );
  }

  renderTabs() {
    const panes = [
      {
        menuItem: "Broadcast",
        render: _.bind(this.renderBroadcastContent, this),
      },
      {
        menuItem: "Spectate",
        render: _.bind(this.renderSpectateContent, this),
      },
    ];

    return (
      <Tab
        className={styles['tabs']}
        menu={{ secondary: true, pointing: true }}
        panes={panes}
      />
    );
  }

  renderPasswordInput() {
    return (
      <Input
        type="password"
        inverted={true}
        label="Password"
        onChange={(event, p) => {
          this.setState({
            password: p.value,
          });
        }}
      />
    );
  }

  renderContent() {
    const { user } = this.props.auth;
    if (!user) {
      return this.renderNotLoggedIn();
    }

    return (
      <div className={styles['container']}>
        {this.renderGlobalError()}
        {this.renderPasswordInput()}
        {this.renderTabs()}
      </div>
    );
  }

  render() {
    return (
      <PageWrapper history={this.props.history}>
        <div className="main-padding">
          <PageHeader
            icon="podcast"
            text="Broadcast"
            history={this.props.history}
          />
          <Scroller topOffset={this.props.topNotifOffset}>
            {this.renderContent()}
          </Scroller>
        </div>
      </PageWrapper>
    );
  }
}

/* eslint-enable no-nested-ternary */