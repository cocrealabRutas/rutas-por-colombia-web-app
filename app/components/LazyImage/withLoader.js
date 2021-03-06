import React from 'react';
import PropTypes from 'prop-types';
import CSSTransition from 'react-transition-group/CSSTransition';
import endpoints from 'config/endpoints';

// Antd
import Spin from 'antd/lib/spin';
import Icon from 'antd/lib/icon';

// Styles
import { LoaderContainer } from './styles/ImageLoader';

const antIcon = (
  <Icon
    type="loading"
    style={{ fontSize: 64, width: '64px', height: '64px' }}
    spin
  />
);

export default Component => {
  class ImageLoader extends React.Component {
    isMounted = false;

    constructor(props) {
      super(props);
      this.isMounted = true;
    }

    componentDidMount = () => {
      const { src, source } = this.props;
      if (src) {
        let url = src;
        if (source === 'api') {
          url = `${endpoints.API_URL}/${src}`;
        }
        this.setState({ url });
      }
    };

    componentWillUnmount = () => {
      this.isMounted = false;
    };

    componentDidUpdate = prevProps => {
      const { src } = this.props;
      if (src) {
        if (src !== prevProps.src) {
          // eslint-disable-next-line react/no-did-update-set-state
          this.setState({ loading: true, url: src });
        }
      }
    };

    state = {
      loading: true,
      url: '',
    };

    onLoad = () => {
      this.setState({ loading: false });
    };

    render() {
      const { loading, url } = this.state;
      const { src, ...props } = this.props;
      return (
        <>
          <CSSTransition
            in={!loading}
            timeout={300}
            classNames="fade"
            mountOnEnter
            unmountOnExit
          >
            <Component {...props} src={url} />
          </CSSTransition>
          {url && loading && (
            <img
              src={url}
              alt={this.props.alt || ''}
              style={{ display: 'none' }}
              onLoad={this.onLoad}
            />
          )}
          {loading && (
            <LoaderContainer>
              <Spin indicator={antIcon} />
            </LoaderContainer>
          )}
        </>
      );
    }
  }

  ImageLoader.defaultProps = {
    src: null,
    source: 'external',
  };

  ImageLoader.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string.isRequired,
    source: PropTypes.string,
  };

  return ImageLoader;
};
