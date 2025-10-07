// 1. Add state for the alert modal at the top of your component
const [alertConfig, setAlertConfig] = useState({
  visible: false,
  title: '',
  message: '',
  type: 'info',
  showCancel: false,
  onConfirm: null,
});

// 2. Helper function to show alerts
const showAlert = (config) => {
  setAlertConfig({
    visible: true,
    ...config,
  });
};

const closeAlert = () => {
  setAlertConfig(prev => ({ ...prev, visible: false }));
};

// 3. Updated submitBugReport function
const submitBugReport = async () => {
  if (!bugDescription.trim()) {
    showAlert({
      title: 'Error',
      message: 'Please describe the bug you encountered',
      type: 'error',
    });
    return;
  }

  try {
    const response = await api.post('/api/bug/submit', {
      description: bugDescription
    });

    if (response.data.success) {
      showAlert({
        title: 'Thank You!',
        message: "Your bug report has been submitted. We'll look into it right away!",
        type: 'success',
        confirmText: 'OK',
        onConfirm: () => {
          setShowBugReportModal(false);
          setBugDescription('');
        },
      });
    } else {
      showAlert({
        title: 'Error',
        message: response.data.message || 'Failed to submit bug report',
        type: 'error',
      });
    }
  } catch (error) {
    console.error('Bug submission failed:', error);
    showAlert({
      title: 'Error',
      message: 'Failed to submit bug report. Please try again.',
      type: 'error',
    });
  }
};

// 4. Add the AlertModal to your JSX (at the bottom, before closing tag)
return (
  <View>
    {/* Your existing UI /}

    {/ Add this at the end */}
    <AlertModal
      {...alertConfig}
      onClose={closeAlert}
    />
  </View>
);