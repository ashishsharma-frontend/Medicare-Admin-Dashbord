/* eslint-disable react/prop-types */
import { Box, Flex, Text, useColorModeValue, Skeleton } from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
import DynamicTable from "../../Components/DataTable";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { daysBack } from "../../Controllers/dateConfig";

const filterRecentData = (data, lastDays) => {
  const lastDay = moment().subtract(lastDays, "days").startOf("day");
  const filterData = data?.filter((item) => {
    const createdAt = moment(item.created_at);
    return createdAt.isAfter(lastDay);
  });
  return filterData.map((item) => ({
    id: item.id,
    image: item.image,
    name: `${item.f_name} ${item.l_name}`,
    phone: item.phone,
    gender: item.gender,
  }));
};

const sevenDaysBack = moment().subtract(daysBack, "days").format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");
function UsersReg({ Users }) {
  const [lastDays, setlastDays] = useState(daysBack);
  const [dateRange, setdateRange] = useState({
    startDate: sevenDaysBack,
    endDate: today,
  });

  return (
    <Box
      p={4}
      borderRadius="md"
      maxW={"100%"}
      bg={useColorModeValue("#fff", "gray.900")}
    >
      <Flex mb={5} justify={"space-between"} align={"center"} gap={5}>
        <Text fontSize="md" fontWeight="bold">
          Users Registration in the Last {lastDays} Days
        </Text>
        <DateRangeCalender
          dateRange={dateRange}
          setDateRange={setdateRange}
          setLastDays={setlastDays}
        />
      </Flex>
      <Box>
        {!Users ? (
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
          <Box maxH={96} overflow={"scroll"}>
            <DynamicTable
              minPad={"10px 5px"}
              data={filterRecentData(Users, lastDays)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default UsersReg;
