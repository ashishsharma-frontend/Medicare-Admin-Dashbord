/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  GridItem,
  Text,
  useColorModeValue,
  Grid,
} from "@chakra-ui/react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaBell, FaTimesCircle } from "react-icons/fa";
import { MdHourglassEmpty } from "react-icons/md";

function CancellationReqStatsics({ data }) {
  const reqData = [
    {
      title: "Cancellation Req Initiated",
      value: data?.total_cancel_req_initiated_appointment || 0,
      icon: <FaBell fontSize="32px" />,
      color: "blue.600",
    },

    {
      title: "Cancellation Request Processing",
      value: data?.total_cancel_req_processing_appointment || 0,
      icon: <MdHourglassEmpty fontSize="32px" />,
      color: "blue.600",
    },
    {
      title: "Cancellation Request Approved",
      value: data?.total_cancel_req_approved_appointment || 0,
      icon: <AiOutlineCheckCircle fontSize="32px" />,
      color: "blue.600",
    },
    {
      title: "Cancellation Request Rejected",
      value: data?.total_cancel_req_rejected_appointment || 0,
      icon: <FaTimesCircle fontSize="32px" />,
      color: "blue.600",
    },
  ];
  return (
    <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={5}>
      {reqData.map((card, index) => (
        <GridItem key={index}>
          <Box
            boxShadow="md"
            p={8}
            borderRadius={8}
            bg={useColorModeValue("#fff", "gray.900")}
          >
            <Flex justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight={600}>
                  {card.title}
                </Text>
                <Text fontSize="3xl" fontWeight={700} color={card.color}>
                  {card.value}
                </Text>
              </Box>
              <Flex
                p={2}
                borderRadius="50%"
                bg="blue.700"
                w={16}
                h={16}
                align="center"
                justify="center"
                color="#fff"
              >
                {card.icon}
              </Flex>
            </Flex>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
}

export default CancellationReqStatsics;
