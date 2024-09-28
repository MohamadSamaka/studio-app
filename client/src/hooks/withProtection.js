import React from 'react';
import useProtectedRoute from './useProtectedRoute';

const withProtection = (WrappedComponent) => {
  return (props) => {
    useProtectedRoute();
    return <WrappedComponent {...props} />;
  };
};

export default withProtection;
