/* eslint-disable react-hooks/rules-of-hooks */
import { BiPrinter } from "react-icons/bi";
import { AiFillEye } from "react-icons/ai";
import { BiTrash } from "react-icons/bi";
/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  IconButton,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Skeleton,
  Link,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import { Link as RouterLink } from "react-router-dom";
import api from "../../Controllers/api";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import { useState } from "react";
import DeletePrescription from "./DeletePrescription";
import imageBaseURL from "../../Controllers/image";

function PrescriptionByPatientID({ patientID, queryActive }) {
  const { hasPermission } = useHasPermission();
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getData = async () => {
    const res = await GET(admin.token, `get_prescription/patient/${patientID}`);
    return res.data;
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["prescriptions-patient", patientID],
    queryFn: getData,
    enabled: queryActive,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);
  if (error) {
    return <Text color="red.500">Error loading data</Text>;
  }

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

  if (!hasPermission("PRESCRIPTION_VIEW")) return <NotAuth />;

  return (
    <Box>
      {isLoading ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
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
        <Box>
          <Flex mb={4} alignItems="center" justify={"space-between"}>
            <Input
              placeholder="Search"
              w={400}
              maxW={"50vw"}
              mr={2}
              icon={<SearchIcon />}
              onChange={(e) => handleSearchChange(e.target.value)}
              size={"md"}
            />
          </Flex>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="scroll"
            maxW={"100%"}
          >
            <Table
              variant="simple"
              colorScheme="gray"
              fontSize={12}
              size={"sm"}
              fontWeight={500}
            >
              <Thead background={useColorModeValue("blue.50", "blue.700")}>
                <Tr>
                  <Th padding={2}>ID</Th>
                  <Th padding={2}>Appointment ID</Th>
                  <Th padding={2}>Patient</Th>
                  <Th padding={2}>Date</Th>
                  <Th padding={2}>Pulse Rate</Th>
                  <Th padding={2}>Temperature</Th>
                  <Th padding={2} textAlign={"center"}>
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.length > 0 ? (
                  filteredData.map((prescription) => (
                    <Tr key={prescription.id}>
                      <Td padding={2}>{prescription.id}</Td>{" "}
                      <Td padding={2}>{prescription.appointment_id}</Td>
                      <Td
                        padding={2}
                      >{`${prescription.patient_f_name} ${prescription.patient_l_name}`}</Td>
                      <Td padding={2}>{prescription.date}</Td>
                      <Td padding={2}>{prescription.pulse_rate}</Td>
                      <Td padding={2}>{prescription.temperature}</Td>
                      <Td padding={2} maxW={10}>
                        <Flex alignItems={"center"} justifyContent={"center"}>
                          {" "}
                          <IconButton
                            as={Link}
                            aria-label="Filter"
                            icon={<BiPrinter fontSize={22} />}
                            colorScheme="whatsapp"
                            size={"sm"}
                            variant={"ghost"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              printPdf(
                                prescription?.pdf_file
                                  ? `${imageBaseURL}/${prescription?.pdf_file}`
                                  : `${api}/prescription/generatePDF/${prescription.id}`
                              );
                            }}
                          />
                          {hasPermission("PRESCRIPTION_UPDATE") && (
                            <IconButton
                              isDisabled={prescription?.pdf_file ? true : false}
                              as={RouterLink}
                              aria-label="Filter"
                              icon={<AiFillEye fontSize={24} />}
                              colorScheme="blue"
                              size={"sm"}
                              variant={"ghost"}
                              to={`/prescription/${prescription?.id}/?appointmentID=${prescription?.appointment_id}&patientID=${prescription?.patient_id}`}
                            />
                          )}
                          <IconButton
                            aria-label="Filter"
                            icon={<BiTrash fontSize={20} />}
                            colorScheme="red"
                            size={"sm"}
                            variant={"ghost"}
                            onClick={() => {
                              onOpen();
                              setselectedData(prescription);
                            }}
                          />{" "}
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan="7">
                      <Text align="center">No data available in table</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
      {isOpen && (
        <DeletePrescription
          isOpen={isOpen}
          onClose={onClose}
          data={selectedData}
        />
      )}
    </Box>
  );
}

export default PrescriptionByPatientID;
