// hooks/useSnackbar.js

import { useState, useCallback} from 'react';

const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showSnackbar = useCallback((message, type = 'success') => {
    setSnackbar({ visible: true, message, type });
  }, []);


  const onDismissSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, visible: false }));
  }, []);

  return {
    snackbar,
    showSnackbar,
    onDismissSnackbar,
  };
};

export default useSnackbar;
