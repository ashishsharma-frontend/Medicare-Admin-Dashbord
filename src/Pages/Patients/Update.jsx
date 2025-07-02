/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ADD, GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import ISDCODEMODAL from "../../Components/IsdModal";
import Loading from "../../Components/Loading";
import showToast from "../../Controllers/ShowToast";
import imageBaseURL from "../../Controllers/image";
import ShowToast from "../../Controllers/ShowToast";
import PatientFiles from "./PatientFiles";
import todayDate from "../../Controllers/today";
import { FaTrash } from "react-icons/fa";
import AppointmentsByPatientID from "../Appointments/AppointmentsByPatientID";
import PrescriptionByPatientID from "../Prescriptions/PrescriptionByPatientID";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";

export default function UpdatePatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isd_code, setisd_code] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef();
  const { hasPermission } = useHasPermission();

  const getPatient = async () => {
    const res = await GET(admin.token, `get_patients/${id}`);
    setisd_code(res.data.isd_code);
    return res.data;
  };

  const { data: patientDetails, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: getPatient,
  });

  const AddNew = async (data) => {
    let formData = {
      id: id,
      isd_code,
      ...data,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_patient", formData);
      setisLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Patient Updated!");
        queryClient.invalidateQueries(["patient", id]);
        queryClient.invalidateQueries(["patients"]);
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileUpload = async (image) => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_patient", {
        id: id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Patient Updated!");
        queryClient.invalidateQueries(["patient", id]);
        queryClient.invalidateQueries(["patients"]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  //   handle file upload
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileUpload(selectedFile);
  };

  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_patient_image", {
        id: id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Image Deleted!");
        queryClient.invalidateQueries("patient", id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  if (patientLoading || isLoading) return <Loading />;
  if (!hasPermission("PATIENT_UPDATE")) return <NotAuth />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"lg"}>
          Patients Details
        </Heading>
        <Button
          w={120}
          size={"sm"}
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </Flex>
      <Divider mb={2} mt={3} />
      <Tabs>
        <TabList>
          <Tab>Details</Tab>
          <Tab>Patient Files</Tab>
          <Tab>Patient Appointments</Tab>
          <Tab>Patient Prescriptions</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex gap={10} mt={2} as={"form"} onSubmit={handleSubmit(AddNew)}>
              <Box w={"60%"}>
                {" "}
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3} as={"form"}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading as={"h3"} size={"sm"}>
                        Basic Details -{" "}
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5} align={"flex-end"}>
                      <FormControl isRequired>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="First Name"
                          {...register("f_name", { required: true })}
                          defaultValue={patientDetails?.f_name}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Last Name"
                          {...register("l_name", { required: true })}
                          defaultValue={patientDetails?.l_name}
                        />
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Date Of Birth</FormLabel>
                        <Input
                          max={todayDate()}
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Select Date"
                          type="date"
                          {...register("dob")}
                          defaultValue={patientDetails?.dob}
                        />
                      </FormControl>                      
                      <FormControl>
                        <FormLabel>Age</FormLabel>
                        <Input 
                          size="sm" 
                          variant="flushed" 
                          {...register("age", {
                            pattern: {
                              value: /^[0-9]+$/,
                              message: "Please enter a valid number"
                            }
                          })}                           
                          defaultValue={patientDetails?.age}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Select Gender"
                          {...register("gender")}
                          defaultValue={patientDetails?.gender}
                        >
                          <option value="Female">Female</option>{" "}
                          <option value="Male">Male</option>
                        </Select>
                      </FormControl>
                    </Flex>
                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Textarea
                          placeholder="Notes"
                          size="sm"
                          resize={"vertical"}
                          {...register("notes")}
                          defaultValue={patientDetails?.notes}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3} as={"form"}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading as={"h3"} size={"sm"}>
                        Contact Details -
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="email"
                          placeholder="Email"
                          {...register("email")}
                          defaultValue={patientDetails?.email}
                        />
                      </FormControl>
                      <FormControl mt={0} isRequired>
                        <FormLabel>Phone </FormLabel>
                        <InputGroup size={"sm"}>
                          <InputLeftAddon
                            cursor={"pointer"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpen();
                            }}
                          >
                            {isd_code}
                          </InputLeftAddon>
                          <Input
                            borderRadius={6}
                            placeholder="Enter your phone number"
                            type="Tel"
                            fontSize={16}
                            {...register("phone", {
                              required: true,
                              pattern: /^[0-9]+$/,
                            })}
                            defaultValue={patientDetails?.phone}
                          />
                        </InputGroup>
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3} as={"form"}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading as={"h3"} size={"sm"}>
                        Address -{" "}
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />
                    <Flex gap={10}>
                      <FormControl>
                        <FormLabel>State</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="email"
                          placeholder="State"
                          {...register("state")}
                          defaultValue={patientDetails?.state}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>City</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="text"
                          placeholder="City"
                          {...register("city")}
                          defaultValue={patientDetails.city}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Postal Code</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="number"
                          placeholder="Postal Code"
                          {...register("postal_code")}
                          defaultValue={patientDetails.postal_code}
                        />
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Textarea
                          placeholder="Address"
                          size="sm"
                          resize={"vertical"}
                          {...register("address")}
                          defaultValue={patientDetails?.address}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>
                <Button
                  w={"100%"}
                  mt={10}
                  type="submit"
                  colorScheme="green"
                  size={"sm"}
                  isLoading={isLoading}
                >
                  Update
                </Button>
              </Box>

              <Box w={"35%"}>
                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                >
                  <CardBody p={2}>
                    <Heading as={"h3"} size={"sm"} textAlign="center">
                      Profile Picture
                    </Heading>
                    <Divider mt={2} />
                    <Flex p={2} justify={"center"} mt={5} position={"relative"}>
                      <Image
                        borderRadius={"50%"}
                        h={150}
                        objectFit={"cover"}
                        w={150}
                        src={
                          patientDetails?.image
                            ? `${imageBaseURL}/${patientDetails?.image}` // Use profilePicture
                            : "/admin/profilePicturePlaceholder.png" // Fallback placeholder image
                        }
                      />
                      {patientDetails?.image && (
                        <Tooltip label="Delete" fontSize="md">
                          <IconButton
                            size={"sm"}
                            colorScheme="red"
                            variant={"solid"}
                            position={"absolute"}
                            right={5}
                            icon={<FaTrash />}
                            onClick={() => {
                              handleFileDelete();
                            }}
                          />
                        </Tooltip>
                      )}
                    </Flex>
                    <VStack spacing={4} align="stretch" mt={10}>
                      <Input
                        size={"sm"}
                        borderRadius={6}
                        type="file"
                        display="none" // Hide the actual file input
                        ref={inputRef}
                        onChange={handleFileChange}
                        accept=".jpeg, .svg, .png , .jpg"
                      />
                      <Button
                        size={"sm"}
                        onClick={() => {
                          inputRef.current.click();
                        }}
                        colorScheme="blue"
                      >
                        Upload Profile Picture
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                >
                  <CardBody p={2}>
                    <PatientFiles id={id} />
                  </CardBody>
                </Card>
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Box maxW={500}>
              {" "}
              <PatientFiles id={id} />
            </Box>
          </TabPanel>
          <TabPanel>
            <AppointmentsByPatientID patientID={id} />
          </TabPanel>
          <TabPanel>
            <PrescriptionByPatientID patientID={id} queryActive={true} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setisd_code}
      />
    </Box>
  );
}
