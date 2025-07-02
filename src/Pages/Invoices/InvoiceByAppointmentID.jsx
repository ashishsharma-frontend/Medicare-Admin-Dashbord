/* eslint-disable react/prop-types */
import {
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
import api from "../../Controllers/api";
export default function InvoiceByAppointmentID({ appointmentID }) {
  const [SelectedData, setSelectedData] = useState();

  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_invoice/appointment/${appointmentID}`
    );

    const invoice = res.data;
    if (res.data === null) {
      return [];
    } else {
      const rearrangedInvoice = [
        {
          id: invoice.id,
          status: invoice.status,
          totalAmount: invoice.total_amount,
          applied_coupon: invoice.coupon_title || "N/A",
          "coupon value (%)": invoice.coupon_value || "N/A",
          coupon_off_amount: invoice.coupon_off_amount || 0,
          Date: moment(invoice.invoice_date).format("D MMM YY"),
          patientID: (
            <Link to={`/patient/${invoice.patient_id}`}>
              {invoice.patient_id}
            </Link>
          ),

          appointmentID: (
            <Link to={`/appointment/${invoice.appointment_id}`}>
              {invoice.appointment_id}
            </Link>
          ),
          createdAt: moment(invoice.created_at).format("D MMM YY hh:mmA"),
          paymentID: invoice.payment_id,
        },
      ];

      return rearrangedInvoice;
    }
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["invoice", appointmentID],
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
  const printPdf = (pdfUrl) => {
    const newWindow = window.open(pdfUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
      newWindow.onload = () => {
        newWindow.load();
        newWindow.onafterprint = () => {
          newWindow.close();
        };
      };
    }
  };
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
          printPdf(`${api}/invoice/generatePDF/${rowData.id}`);
        }}
        icon={<TbDownload fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};
