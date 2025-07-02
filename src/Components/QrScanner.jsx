/* eslint-disable react/prop-types */
import { Scanner } from "@yudiel/react-qr-scanner";
import { Box, Center } from "@chakra-ui/react";

const QRCodeScanner = ({ onScan }) => {
  const handleScan = (result) => {
    if (result) {
      onScan(JSON.parse(result[0].rawValue));
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <Center>
      <Box w={"300px"} maxW={"300px"}>
        <Scanner
          onScan={handleScan}
          onError={handleError}
          style={{ width: "100%" }}
          allowMultiple
        />
      </Box>
    </Center>
  );
};

export default QRCodeScanner;
