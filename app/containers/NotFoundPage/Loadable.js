/**
 * Asynchronously loads the component for NotFoundPage
 */
import React from 'react';
import loadable from 'loadable-components';

// Custom Loader
import ComponentLoader from 'components/ComponentLoader';

export default loadable(() => import('./index'), {
  render: props => <ComponentLoader {...props} />,
});
