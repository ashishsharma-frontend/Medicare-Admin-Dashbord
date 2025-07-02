/* eslint-disable react/prop-types */
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import moment from "moment";
import { Link } from "react-router-dom";
import { TbDownload } from "react-icons/tb";

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

export default function TransactionByAppID({ appointmentID }) {
  const [SelectedData, setSelectedData] = useState();

  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_all_transaction/appointment/${appointmentID}`
    );
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
        patient: (
          <Link to={`/patient/${patient_id}`}>
            {`${patient_f_name} ${patient_l_name}`}
          </Link>
        ),
        user: user_id ? (
          <Link to={`/user/${user_id}`}>{`${user_f_name} ${user_l_name}`}</Link>
        ) : (
          "N/A"
        ),
        app_ID: (
          <Link to={`/appointment/${appointment_id}`}>{appointment_id}</Link>
        ),
        txn_ID: payment_transaction_id || "N/A",
        amount,
        txn_type: txnBadge(transaction_type),
        wallet_Txn: is_wallet_txn == 1 ? "Yes" : "No",
        notes: notes || "N/A",
        createdAt: moment(created_at).format("D MMM YY hh:mmA"),
      };
    });
    return rearrangedTransactions;
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["transaction", appointmentID],
    queryFn: getData,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "oops!.",
        description: "Something bad happens.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  return (
    <Box>
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
            <Input
              size={"md"}
              placeholder="Search"
              w={400}
              maxW={"50vw"}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Flex>
          <DynamicTable
            data={filteredData}
            onActionClick={
              <YourActionButton
                rowData={SelectedData}
                onClick={handleActionClick}
              />
            }
          />
        </Box>
      )}
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
        icon={<TbDownload fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};
