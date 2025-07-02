/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Input,
  Skeleton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import moment from "moment";
import { Link } from "react-router-dom";
import Invoices from "../Invoices/Invoices";
import AppointmentPayments from "../Payments/Payments";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import DateRangeCalender from "../../Components/DateRangeCalender";

const txnBadge = (txn) => {
  switch (txn) {
    case "Credited":
      return (
        <Badge
          colorScheme="green"
          fontSize={12}
          letterSpacing={0.5}
          p={"5px"}
          size={"sm"}
        >
          Credited
        </Badge>
      );
    case "Debited":
      return (
        <Badge colorScheme="red" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Debited
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="yellow" fontSize={12} letterSpacing={0.5} p={"5px"}>
          N/A
        </Badge>
      );
  }
};

export default function Transactions() {
  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>All Transactions</Tab>
          <Tab>Appointment Payments</Tab>
          <Tab>Invoices</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <AllTransactions />
          </TabPanel>
          <TabPanel>
            <AppointmentPayments />
          </TabPanel>
          <TabPanel>
            <Invoices />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

function AllTransactions() {
  const { hasPermission } = useHasPermission();
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const toast = useToast();
  const id = "Errortoast";
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
    const url =
      admin.role.name === "Doctor"
        ? `get_all_transactions/doctor_id/page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}&doctor_id=${admin.id}`
        : `get_all_transactions/page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${start_date}&end_date=${end_date}`;
    const res = await GET(admin.token, url);
    const rearrangedTransactions = res?.data.map((transaction) => {
      const {
        id,
        user_id,
        patient_id,
        appointment_id,
        payment_transaction_id,
        amount,
        transaction_type,
        is_wallet_txn,
        notes,
        created_at,
        patient_f_name,
        patient_l_name,
        user_f_name,
        user_l_name,
      } = transaction;

      return {
        id,
        patient: patient_id ? (
          <Link to={`/patient/${patient_id}`}>
            {`${patient_f_name} ${patient_l_name}`}
          </Link>
        ) : (
          "N/A"
        ),
        user: user_id ? (
          <Link to={`/user/${user_id}`}>{`${user_f_name} ${user_l_name}`}</Link>
        ) : (
          "N/A"
        ),
        "app ID": (
          <Link to={`/appointment/${appointment_id}`}>{appointment_id}</Link>
        ),
        "txn ID": payment_transaction_id || "N/A",
        amount,
        "txn type": txnBadge(transaction_type),
        "wallet Txn": is_wallet_txn == 1 ? "Yes" : "No",
        notes: notes || "N/A",
        createdAt: moment(created_at).format("D MMM YY hh:mmA"),
      };
    });
    return {
      data: rearrangedTransactions,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["transactions", page, debouncedSearchQuery, dateRange],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPage = Math.ceil(data?.total_record / 50);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something went wrong.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("ALL_TRANSACTION_VIEW")) return <NotAuth />;

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
                onChange={(e) => setsearchQuery(e.target.value)}
                value={searchQuery}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setdateRange}
                size={"md"}
              />
            </Flex>
          </Flex>
          <DynamicTable
            data={data?.data}
            onActionClick={<YourActionButton />}
          />
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

const YourActionButton = ({ onClick, rowData }) => {
  return (
    <Flex justify={"center"}>
      <IconButton
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
        }}
        icon={<FiEdit fontSize={18} color={"blue.500"} />}
      />
    </Flex>
  );
};
