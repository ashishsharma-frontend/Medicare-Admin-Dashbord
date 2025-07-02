/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import DynamicTable from "../../Components/DataTable";
import { useNavigate } from "react-router-dom";

import useHasPermission from "../../Hooks/HasPermission";
import { useEffect, useRef, useState } from "react";
import useDebounce from "../../Hooks/UseDebounce";
import NotAuth from "../../Components/NotAuth";
import DateRangeCalender from "../../Components/DateRangeCalender";
import Pagination from "../../Components/Pagination";
import moment from "moment";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function UserNotification({ currentTab, activeTab }) {
  const navigate = useNavigate();
  const toast = useToast();
  const id = "Errortoast";
  const { hasPermission } = useHasPermission();
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const start_date = dateRange.startDate
    ? moment(dateRange.startDate).format("YYYY-MM-DD")
    : "";
  const end_date = dateRange.endDate
    ? moment(dateRange.endDate).format("YYYY-MM-DD")
    : "";

  const getData = async () => {
    const { startIndex, endIndex } = getPageIndices(page, 50);
    const url = `get_user_notification_page?start=${startIndex}&end=${endIndex}&start_date=${start_date}&end_date=${end_date}&search=${debouncedSearchQuery}`;
    const res = await GET(admin.token, url);

    const newData = res.data.map((item) => {
      const { id, title, body, user_id, txn_id, updated_at, appointment_id } =
        item;

      return {
        id,
        title,
        body: (
          <Tooltip
            label={body}
            placement="top"
            hasArrow
            bg="gray.600"
            color="white"
            transition="all 0.1s"
            borderRadius="md"
            cursor={"pointer"}
            size={"sm"}
            id="tooltip"
          >
            <Box maxW={"100%"}>{body}</Box>
          </Tooltip>
        ),
        appointment_id: appointment_id ? (
          <Button
            colorScheme="teal"
            onClick={() => navigate(`/appointment/${appointment_id}`)}
            size="xs"
            mt={2}
          >
            Go to Appointment #{appointment_id}
          </Button>
        ) : (
          "N/A"
        ),
        user_id: user_id ? (
          <Button
            colorScheme="blue"
            onClick={() => navigate(`/user/update/${user_id}`)}
            size="xs"
            mt={2}
          >
            Go to User
          </Button>
        ) : (
          "N/A"
        ),
        txn_id,
        updated_at,
      };
    });

    return {
      data: newData,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["notification-user"],
    queryFn: getData,
    enabled: currentTab == activeTab,
  });

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);
  if (!hasPermission("NOTIFICATION_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef}>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={50} h={8} />
          </Flex>
          <Skeleton h={300} w={"100%"} />
        </Box>
      ) : (
        <Box>
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Flex align={"center"} gap={4}>
              <Input
                size={"md"}
                placeholder="Search"
                w={400}
                maxW={"50vw"}
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setdateRange}
                size={"md"}
              />
            </Flex>
          </Flex>
          <DynamicTable minPad={"8px 8px"} data={data?.data} />
        </Box>
      )}

      <Flex justify={"center"} mt={4}>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPage}
        />
      </Flex>
    </Box>
  );
}
