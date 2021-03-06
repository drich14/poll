import React from 'react';
import App, { Container } from 'next/app';
import Router from 'next/router';
import Head from 'next/head';
import { Row, Col } from 'react-bootstrap';
import { LoadingApp, LoadingPage } from '../components';

const TITLE_MIN_WIDTH = 830;
const TITLE_MIN_HEIGHT = 440;

const lockPortrait = async () => {
  try {
    if (ScreenOrientation.lock) {
      ScreenOrientation.lock();
    } else if (screen.lockOrienation) {
      screen.lockOrienation('portrait');
    } else if (screen.orientation.lock) {
      await screen.orientation.lock('portrait');
    }
  } catch (error) {
    console.log(error);
  }
};

const PollUI = class extends App {
  constructor(props) {
    super(props);

    this.state = {
      loadingPage: true,
      loadingApp: true,
      width: props.width,
      height: props.height,
      showTitle: false
    };
  }

  static async getInitialProps({ Component, ctx }) {
    return {
      pageProps: Component.getInitialProps
        ? await Component.getInitialProps(ctx)
        : {},
      width: (!ctx.req && window.innerWidth) || TITLE_MIN_WIDTH,
      height: (!ctx.req && window.innerHeight) || TITLE_MIN_HEIGHT
    };
  }

  routeChangeStart = () => {
    this.setState({ loadingPage: true });
  };

  routeChangeEnd = () => {
    this.setState({ loadingPage: false, loadingApp: false });
  };

  routeChangeError = () => {
    console.error('error loading page');
  };

  updateWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    this.setState({
      width,
      height,
      showTitle: width > TITLE_MIN_WIDTH && height > TITLE_MIN_HEIGHT
    });
  };

  componentDidMount() {
    this.updateWindowDimensions();

    window.addEventListener('resize', this.updateWindowDimensions);

    Router.events.on('routeChangeStart', this.routeChangeStart);
    Router.events.on('routeChangeComplete', this.routeChangeEnd);
    Router.events.on('routeChangeError', this.routeChangeError);

    this.setState({ loadingPage: false, loadingApp: false });

    lockPortrait();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);

    Router.events.off('routeChangeStart', this.routeChangeStart);
    Router.events.off('routeChangeComplete', this.routeChangeEnd);
    Router.events.off('routeChangeError', this.routeChangeError);
  }

  render() {
    const { Component, pageProps } = this.props;
    const { loadingPage, loadingApp, showTitle } = this.state;

    return (
      <Container>
        <Head>
          <title>Polljob</title>
        </Head>
        {showTitle && (
          <Row
            style={{
              position: 'absolute',
              top: '15px',
              left: '35px',
              zIndex: '1'
            }}
          >
            <Col>
              <a href="/" style={{ textDecoration: 'none' }}>
                <h1 className="display-4">
                  <span style={{ color: 'var(--red)' }}>Poll</span>
                  <span style={{ fontWeight: 600 }}>job</span>
                </h1>
              </a>
            </Col>
          </Row>
        )}
        {loadingApp ? (
          <LoadingApp />
        ) : loadingPage ? (
          <LoadingPage />
        ) : (
          <Component {...pageProps} {...this.state} />
        )}
      </Container>
    );
  }
};

export default PollUI;
