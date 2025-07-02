/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
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
import printPDF from "../../Controllers/printPDF";
import api from "../../Controllers/api";
export default function PaymentsByAppID({ appointmentID }) {
  const [SelectedData, setSelectedData] = useState();

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_appointment_payment/appintment/${appointmentID}`
    );
    if (res.data === null) {
      return [];
    } else {
      const rearrangedTransaction = (transaction) => {
        const {
          id,
          txn_id,
          invoice_id,
          amount,
          payment_time_stamp,
          payment_method,
          created_at,
          user_id,
          patient_id,
          appointment_id,
          patient_f_name,
          patient_l_name,
          user_f_name,
          user_l_name,
        } = transaction;

        return [
          {
            id,
            "txn ID": txn_id,
            invoiceID: invoice_id,
            patient: (
              <Link to={`/patient/${patient_id}`}>
                {`${patient_f_name} ${patient_l_name}`}
              </Link>
            ),
            user: (
              <Link
                to={`/user/${user_id}`}
              >{`${user_f_name} ${user_l_name}`}</Link>
            ),
            "APP ID": (
              <Link to={`/appointment/${appointment_id}`}>
                {appointment_id}
              </Link>
            ),
            amount,
            "payment Method": payment_method,
            "Time stamp": moment(payment_time_stamp).format("D MMM YY hh.mmA"),
            "created At": moment(created_at).format("D MMM YY hh:mmA"),
          },
        ];
      };

      // Assuming res is the response from your GET request
      return rearrangedTransaction(res.data);
    }
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data } = useQuery({
    queryKey: ["payment", appointmentID],
    queryFn: getData,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

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
          printPDF(`${api}/invoice/generatePDF/${rowData.invoiceID}`);
        }}
        icon={<TbDownload fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};
