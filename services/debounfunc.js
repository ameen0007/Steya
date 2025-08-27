let isProcessing = false;  // this is the lock

export const preventDoubleTap = async (callback, delay = 1000) => {
  if (isProcessing) return;   // if already running → stop

  isProcessing = true;        // lock it
  try {
    await callback();         // run your function safely
  } finally {
    setTimeout(() => {
      isProcessing = false;   // unlock after 1 second
    }, delay);
  }
};
