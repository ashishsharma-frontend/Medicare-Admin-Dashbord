import { useState, useEffect } from "react";
import moment from "moment";
import { Flex, Text } from "@chakra-ui/react";

const ClockWithCountdown = () => {
  const [dateTime, setDateTime] = useState(moment());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = moment();
      setDateTime(now);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Format date and time using moment.js
  const formattedDate = dateTime.format("DD MMM YYYY");
  const formattedTime = dateTime.format("hh:mm:ss A");

  return (
    <Flex gap={2}>
      <Text fontSize="md" fontWeight={600}>
        {formattedDate}
      </Text>
      <Text fontSize="md" fontWeight={600}>
        {formattedTime}
      </Text>
    </Flex>
  );
};

export default ClockWithCountdown;
