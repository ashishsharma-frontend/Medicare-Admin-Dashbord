/* eslint-disable react/prop-types */
import {
  Box, Flex,
  Text, useColorModeValue,
  Skeleton,
  Badge,
  IconButton,
  theme
} from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
import DynamicTable from "../../Components/DataTable";
import getStatusBadge from "../../Hooks/StatusBadge";
import { HiDownload } from "react-icons/hi";
import { FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { daysBack } from "../../Controllers/dateConfig";

const filterRecentData = (data, lastDays) => {
  const lastDay = moment().subtract(lastDays, "days").startOf("day");
  const filterData = data.filter((item) => {
    const createdAt = moment(item.created_at);
    return createdAt.isAfter(lastDay);
  });
  const rearrangedArray = filterData?.map((item) => {
    const {
      id,
      status,
      date,
      time_slots,
      type,
      payment_status,
      patient_f_name,
      patient_l_name,
      doct_f_name,
      doct_l_name,
      doct_image,
    } = item;

    return {
      id: id,
      image: doct_image,
      Doctor: `${doct_f_name} ${doct_l_name}`,
      Patient: `${patient_f_name} ${patient_l_name}`,
      Status: getStatusBadge(status),
      Date: date,
      "Time Slots": time_slots,
      Type:
        type === "Emergency" ? (
          <Badge colorScheme="red">{type}</Badge>
        ) : (
          <Badge colorScheme="green">{type}</Badge>
        ),
      "Payment Status":
        payment_status === "Paid" ? (
          <Badge colorScheme="green">{payment_status}</Badge>
        ) : payment_status === "Refunded" ? (
          <Badge colorScheme="blue">{payment_status}</Badge>
        ) : (
          <Badge colorScheme="red">{"Not Paid"}</Badge>
        ),
    };
  });
  return rearrangedArray.sort((a, b) => b.id - a.id);
};

const sevenDaysBack = moment().subtract(daysBack, "days").format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");

function AppointmentReg({ Appointments }) {
  const [lastDays, setlastDays] = useState(daysBack);
  const [dateRange, setdateRange] = useState({
    startDate: sevenDaysBack,
    endDate: today,
  });
  const navigate = useNavigate();

  return (
    <Box
      p={4}
      borderRadius="md"
      maxW={"100%"}
      bg={useColorModeValue("#fff", "gray.900")}
    >
      <Flex mb={5} justify={"space-between"} align={"center"}>
        <Text fontSize="Lg" fontWeight="bold">
          Appointments Made in the Last {lastDays} Days
        </Text>
        <DateRangeCalender
          dateRange={dateRange}
          setDateRange={setdateRange}
          setLastDays={setlastDays}
        />
      </Flex>
      <Box>
        {!Appointments ? (
          <Box>
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
            <Skeleton h={10} w={"100%"} mt={2} />
          </Box>
        ) : (
          <Box maxH={80} overflow={"scroll"}>
            <DynamicTable
              minPad={"10px 5px"}
              data={filterRecentData(Appointments, lastDays)}
              onActionClick={<YourActionButton navigate={navigate} />}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AppointmentReg;

const YourActionButton = ({ rowData, navigate }) => {
  return (
    <Flex justify={"center"}>
      <IconButton
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          navigate(`/appointment/${rowData.id}`);
        }}
        icon={<HiDownload fontSize={18} color={theme.colors.green[500]} />}
      />
      <IconButton
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          navigate(`/appointment/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};
