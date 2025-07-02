// File: showToast.js
const ShowToast = (toast, variant, message) => {
  toast({
    title: message,
    status: variant, // success, error, warning, info
    duration: 1000, // Duration in milliseconds
    isClosable: true,
    position: "top",
  });
};

export default ShowToast;
