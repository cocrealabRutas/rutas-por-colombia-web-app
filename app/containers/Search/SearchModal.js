import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import injectReducer from 'utils/injectReducer';
import styled from 'styled-components';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import theme from 'theme';

// Antd
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import message from 'antd/lib/message';

// Semantic
import {
  Segment,
  Header,
  Select,
  Responsive,
  Icon as SemanticIcon,
} from 'semantic-ui-react';

// Redux
import { makeSelectRouteResults } from '../Map/selectors';
import { routeResultsReducer } from '../Map/reducer';
import { searchRoute } from './actions';
import { resetRouteResults } from '../Map/actions';

// Components
import SearchInput from './SearchInput';
import ResultsBox from './ResultsBox';

const MainContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 999;
  width: 100%;
  max-width: 350px;
  background: transparent;
  @media (max-width: 767px) {
    position: fixed;
    top: auto;
    bottom: 0;
    right: 0;
    max-width: none;
  }
`;

const ContainerModal = styled(Modal)`
  &&& {
    & .ant-modal-body {
      background-color: #303030;
    }
    & .ant-modal-close-x {
      color: white;
    }
    max-width: 600px;
  }
`;

const Selector = styled(Select)`
  &&& {
    &.ui.selection.dropdown {
      display: inline-block;
      border-radius: 0;
      border-top: none;
      border-left: none;
      border-right: none;
      background-color: transparent;
      color: white;
      border-color: white;
    }
  }
`;

const ResultsBoxContaier = styled.div`
  position: relative;
  display: block;
  overflow: hidden;
  height: auto;
  transition: height 0.5s cubic-bezier(0.645, 0.045, 0.355, 1);
`;

const ToggleArrow = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  height: 2em;
  background-color: white;
`;

// eslint-disable-next-line react/prop-types
const Icon = ({ active, ...props }) => <SemanticIcon {...props} />;

const ArrowIcon = styled(Icon)`
  &&& {
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transform: rotate(${props => (props.active ? 0 : 180)}deg);
  }
`;

const categoryOptions = [
  { key: 0, value: 0, text: 'I' },
  { key: 1, value: 1, text: 'II' },
  { key: 2, value: 2, text: 'III' },
  { key: 3, value: 3, text: 'IV' },
  { key: 4, value: 4, text: 'V' },
];

const { breakpointsDown } = theme;

class SearchModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.resultsBox = React.createRef();
  }

  state = {
    visible: false,
    categoryValue: null,
    showResultsBox: true,
  };

  componentDidMount = () => {
    this.updateResultsBoxSize();
  };

  componentDidUpdate = (prevProps, prevState) => {
    const { visible } = this.state;
    if (visible !== prevState.visible) {
      if (visible) {
        this.hideResultsBox();
      } else {
        this.showResultsBox();
      }
    }
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  closeModal = () => {
    this.setState({
      visible: false,
    });
  };

  handleCategoryChange = (e, { value }) => {
    this.setState({ categoryValue: value });
  };

  searchRoute = () => {
    const { categoryValue, locationFrom, locationTo } = this.state;
    if (
      !isEmpty(locationFrom) &&
      !isEmpty(locationTo) &&
      isNumber(categoryValue)
    ) {
      this.closeModal();
      this.props.searchRoute({
        locationFrom: locationFrom.coordinates,
        locationTo: locationTo.coordinates,
        category: categoryValue,
      });
    } else {
      message.warning(
        'Recuerda llenar todos los campos antes de hacer la búsqueda',
        4,
      );
    }
  };

  updateResultsBoxSize = () => {
    const { showResultsBox } = this.state;
    if (showResultsBox) {
      const resultsBoxContainer = this.resultsBox.current;
      const resultsBox = resultsBoxContainer.children[0];
      if (resultsBox) {
        resultsBoxContainer.style.height = `${resultsBox.scrollHeight}px`;
      }
    }
  };

  toggleResultsBox = () => {
    const { showResultsBox } = this.state;
    const resultsBox = this.resultsBox.current;
    if (showResultsBox) {
      resultsBox.style.height = '0';
      this.setState({ showResultsBox: false });
    } else {
      resultsBox.style.height = `${resultsBox.scrollHeight}px`;
      this.setState({ showResultsBox: true });
    }
  };

  hideResultsBox = () => {
    const resultsBox = this.resultsBox.current;
    resultsBox.style.height = '0';
    this.setState({ showResultsBox: false });
  };

  showResultsBox = () => {
    const resultsBox = this.resultsBox.current;
    resultsBox.style.height = `${resultsBox.scrollHeight}px`;
    this.setState({ showResultsBox: true });
  };

  render() {
    const {
      visible,
      categoryValue,
      locationFrom,
      locationTo,
      showResultsBox,
    } = this.state;
    const { routeResults } = this.props;
    return (
      <MainContainer>
        <Responsive maxWidth={breakpointsDown.sm} as={React.Fragment}>
          <ToggleArrow onClick={this.toggleResultsBox}>
            <ArrowIcon name="angle down" active={showResultsBox} />
          </ToggleArrow>
        </Responsive>
        <ResultsBoxContaier ref={this.resultsBox}>
          <ResultsBox
            locationFrom={locationFrom}
            locationTo={locationTo}
            category={categoryValue}
            routeResults={routeResults}
            updateResultsBoxSize={this.updateResultsBoxSize}
          />
        </ResultsBoxContaier>
        <Button type="primary" block onClick={this.showModal}>
          Nueva búsqueda
        </Button>
        <ContainerModal
          visible={visible}
          title={null}
          onCancel={this.closeModal}
          footer={null}
          destroyOnClose
          width="80%"
        >
          <Segment basic textAlign="center">
            <Header as="h3" inverted>
              <SearchInput
                onSelect={location => {
                  this.setState({ locationFrom: location });
                }}
                placeholder="Origen"
              />
            </Header>
          </Segment>
          <Segment basic textAlign="center">
            <Header as="h3" inverted>
              <SearchInput
                onSelect={location => {
                  this.setState({ locationTo: location });
                }}
                placeholder="¿A dónde vas?"
              />
            </Header>
          </Segment>
          <Segment basic textAlign="center">
            <Header as="h3" inverted>
              <Selector
                options={categoryOptions}
                onChange={this.handleCategoryChange}
                value={categoryValue}
                placeholder="Elige la categoría de tu vehículo"
                fluid
              />
            </Header>
          </Segment>
          <Segment basic textAlign="center">
            <Button
              type="primary"
              onClick={this.searchRoute}
              size="large"
              block
              style={{ maxWidth: '400px' }}
            >
              Buscar ruta
            </Button>
          </Segment>
        </ContainerModal>
      </MainContainer>
    );
  }
}
SearchModal.propTypes = {
  searchRoute: PropTypes.func.isRequired,
  routeResults: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  routeResults: makeSelectRouteResults(),
});

const mapDispatchToProps = {
  searchRoute,
  resetRouteResults,
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({
  key: 'routeResults',
  reducer: routeResultsReducer,
});

export default compose(
  withReducer,
  withConnect,
)(SearchModal);
