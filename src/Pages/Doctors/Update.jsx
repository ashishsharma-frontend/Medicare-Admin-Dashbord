/* eslint-disable react-hooks/rules-of-hooks */
import { AiFillYoutube } from "react-icons/ai";
import { BsInstagram } from "react-icons/bs";
import { AiOutlineTwitter } from "react-icons/ai";
import { BiLinkExternal } from "react-icons/bi";
import { CgFacebook } from "react-icons/cg";
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
  InputLeftElement,
  InputRightElement,
  Select,
  Switch,
  Text,
  Textarea,
  Tooltip,
  VStack,
  theme,
  useColorModeValue,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ComboboxDemo } from "../../Components/ComboBox";
import { MultiTagInput } from "../../Components/MultiTaginput";
import { ADD, GET, UPDATE } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import TimeSlotes from "../../Components/DoctorTimeSlotes/TimeSlotes";
import DoctorQueue from "../../Components/DoctorQueue";
import Loading from "../../Components/Loading";
import RatingStars from "../../Hooks/ShowRating";
import ISDCODEMODAL from "../../Components/IsdModal";
import { FaChevronDown, FaTrash } from "react-icons/fa";
import imageBaseURL from "../../Controllers/image";
import useHasPermission from "../../Hooks/HasPermission";
import VideoTimeSlotes from "../../Components/VideoTimeSlotes/TimeSlotes";
import todayDate from "../../Controllers/today";
import Review from "./Review";
import DoctAppointments from "./DoctAppoinrtments";
import NotAuth from "../../Components/NotAuth";

const getSpclizeList = async () => {
  const res = await GET(admin.token, "get_specialization");
  return res.data;
};
const getDepartmentList = async () => {
  const res = await GET(admin.token, "get_department");
  return res.data;
};

export default function UpdateDoctor() {
  const param = useParams();
  const { data: doctorDetails, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["doctor", param.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${param.id}`);
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [departmentID, setdepartmentID] = useState(doctorDetails?.department);
  const [specializationID, setspecializationID] = useState(
    doctorDetails?.specialization
  );
  const inputRef = useRef();
  const [isd_code, setisd_code] = useState(doctorDetails?.isd_code);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();

  useEffect(() => {
    setdepartmentID(doctorDetails?.department);
    setspecializationID(doctorDetails?.specialization);
  }, [doctorDetails]);

  // get doctor details

  const AddNew = async (data) => {
    if (data.password && data.password != data.cnfPassword) {
      return showToast(toast, "error", "password does not match");
    }

    if (!departmentID) {
      return showToast(toast, "error", "select department");
    }

    if (!specializationID) {
      return showToast(toast, "error", "select specialization");
    }

    let formData = {
      id: param.id,
      department: departmentID,
      specialization: Array.isArray(specializationID)
        ? specializationID.join(", ")
        : specializationID || "",
      isd_code_sec: isd_code,
      isd_code,
      ...data,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_doctor", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updateddddd!");
        queryClient.invalidateQueries(["doctor", param.id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileUpload = async (image) => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_doctor", {
        id: param.id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctor", param.id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };
  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_doctor_image", {
        id: param.id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Image Deleted!");
        queryClient.invalidateQueries("doctor", param.id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileUpload(selectedFile);
  };

  const { data: departmentList } = useQuery({
    queryKey: ["department"],
    queryFn: getDepartmentList,
  });

  const { data: specializationList } = useQuery({
    queryKey: ["specialization"],
    queryFn: getSpclizeList,
  });

  if (isDoctorLoading || isLoading) return <Loading />;
  if (!hasPermission("DOCTOR_UPDATE")) return <NotAuth />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"lg"}>
          Doctor Details #{param.id}
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

      <Tabs mt={5}>
        <TabList>
          <Tab>Doctor Details </Tab>
          <Tab>Time Slotes</Tab>
          <Tab>Queue Setting</Tab>
          <Tab>Reviews</Tab>
          <Tab>Appointments</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Flex gap={10} mt={2} as={"form"} onSubmit={handleSubmit(AddNew)}>
              <Box w={"75%"}>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3} as={"form"}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading as={"h3"} size={"sm"}>
                        Basic Details -
                      </Heading>{" "}
                      <Flex gap={2}>
                        <Flex display={"flex"} align={"center"} gap={1}>
                          {" "}
                          <RatingStars
                            rating={doctorDetails?.average_rating}
                          />{" "}
                          <Text fontSize={"sm"} fontWeight={600}>
                            {" "}
                            ( {doctorDetails?.number_of_reviews}) ,
                          </Text>
                        </Flex>
                        <Text fontSize={"sm"} fontWeight={600}>
                          {" "}
                          {doctorDetails?.total_appointment_done} Appointments
                          Done
                        </Text>
                      </Flex>
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
                          defaultValue={doctorDetails?.f_name}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Last Name"
                          {...register("l_name", { required: true })}
                          defaultValue={doctorDetails?.l_name}
                        />
                      </FormControl>
                      <FormControl>
                        <FormControl
                          display="flex"
                          alignItems="center"
                          mb={2}
                          gap={3}
                        >
                          <FormLabel
                            htmlFor="email-alerts"
                            mb="0"
                            fontSize={"sm"}
                          >
                            Doctor Active ?
                          </FormLabel>
                          <Box>
                            {" "}
                            <IsActiveSwitch
                              id={param.id}
                              isActive={doctorDetails?.active}
                            />
                          </Box>
                        </FormControl>{" "}
                        <FormControl
                          display="flex"
                          alignItems="center"
                          mb={2}
                          gap={3}
                        >
                          <FormLabel
                            htmlFor="email-alerts"
                            mb="0"
                            fontSize={"sm"}
                          >
                            Stop Booking ?
                          </FormLabel>
                          <Box>
                            {" "}
                            <StopBooking
                              id={param.id}
                              isStop_booking={doctorDetails?.stop_booking}
                            />
                          </Box>
                        </FormControl>
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>Date Of Birth</FormLabel>
                        <Input
                          max={todayDate()}
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Select Date"
                          type="date"
                          {...register("dob", { required: true })}
                          defaultValue={doctorDetails?.dob}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Select Gender"
                          {...register("gender", { required: true })}
                          defaultValue={doctorDetails?.gender}
                        >
                          <option value="Female">Female</option>{" "}
                          <option value="Male">Male</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Years OF Experience</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="number"
                          placeholder="Years OF Experience"
                          {...register("ex_year", { required: true })}
                          defaultValue={doctorDetails?.ex_year}
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
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="email"
                          placeholder="Email"
                          {...register("email", { required: true })}
                          defaultValue={doctorDetails?.email}
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
                            {isd_code || doctorDetails?.isd_code}{" "}
                            <FaChevronDown style={{ marginLeft: "5px" }} />
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
                            defaultValue={doctorDetails.phone}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormControl mt={0}>
                        <FormLabel>Secondary Phone</FormLabel>
                        <InputGroup size={"sm"}>
                          <InputLeftAddon
                            cursor={"pointer"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpen();
                            }}
                          >
                            {isd_code || doctorDetails?.isd_code}{" "}
                            <FaChevronDown style={{ marginLeft: "5px" }} />
                          </InputLeftAddon>
                          <Input
                            borderRadius={6}
                            placeholder="Enter your phone number"
                            type="Tel"
                            fontSize={16}
                            {...register("phone_sec")}
                            defaultValue={doctorDetails.phone_sec}
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
                        Education And Other Deta -
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>Department</FormLabel>
                        <ComboboxDemo
                          name={"Department"}
                          data={departmentList}
                          setState={setdepartmentID}
                          defaultId={doctorDetails?.department}
                        />
                      </FormControl>

                      <FormControl isRequired size={"sm"}>
                        <FormLabel>Specialization</FormLabel>
                        <MultiTagInput
                          data={specializationList}
                          setState={setspecializationID}
                          name={"Specialization"}
                          defaultSelected={doctorDetails?.specialization.split(
                            ", "
                          )}
                        />
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                          height="200px"
                          placeholder="Description"
                          size="sm"
                          resize={"vertical"}
                          {...register("description")}
                          defaultValue={doctorDetails?.description}
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
                          defaultValue={doctorDetails?.state}
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
                          defaultValue={doctorDetails.city}
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
                          defaultValue={doctorDetails.postal_code}
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
                          defaultValue={doctorDetails?.address}
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
                        Password -{" "}
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />
                    <Flex gap={10}>
                      <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="password"
                          placeholder="Password"
                          {...register("password")}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>CNF Password</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="password"
                          placeholder="Password"
                          {...register("cnfPassword")}
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

              <Box w={"25%"}>
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
                          doctorDetails?.image
                            ? `${imageBaseURL}/${doctorDetails?.image}` // Use profilePicture
                            : "/admin/profilePicturePlaceholder.png" // Fallback placeholder image
                        }
                      />
                      {doctorDetails?.image && (
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
                        isDisabled={doctorDetails?.image !== null}
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
                    <Heading as={"h3"} size={"sm"}>
                      Social Accounts -{" "}
                    </Heading>
                    <Divider mt={2} mb={5} />
                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <CgFacebook
                          size={"20"}
                          color={theme.colors.facebook[500]}
                        />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Facebook"
                        defaultValue={doctorDetails?.fb_linik}
                        {...register("fb_linik")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          const isValidUrl =
                            /^(ftp|http|https):\/\/[^ "]+$/.test(
                              doctorDetails?.fb_linik
                            );
                          if (isValidUrl) {
                            window.open(doctorDetails?.fb_linik, "_blank");
                          } else {
                            ShowToast(
                              toast,
                              "error",
                              "This is not a valid url"
                            );
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <AiOutlineTwitter
                          size={"20"}
                          color={theme.colors.twitter[500]}
                        />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Twitter"
                        defaultValue={doctorDetails?.twitter_link}
                        {...register("twitter_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          const isValidUrl =
                            /^(ftp|http|https):\/\/[^ "]+$/.test(
                              doctorDetails?.insta_link
                            );
                          if (isValidUrl) {
                            window.open(doctorDetails?.insta_link, "_blank");
                          } else {
                            ShowToast(
                              toast,
                              "error",
                              "This is not a valid url"
                            );
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <BsInstagram
                          size={"20"}
                          color={theme.colors.red[400]}
                        />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Instagram"
                        defaultValue={doctorDetails?.insta_link}
                        {...register("insta_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          const isValidUrl =
                            /^(ftp|http|https):\/\/[^ "]+$/.test(
                              doctorDetails?.insta_link
                            );
                          if (isValidUrl) {
                            window.open(doctorDetails?.insta_link, "_blank");
                          } else {
                            ShowToast(
                              toast,
                              "error",
                              "This is not a valid url"
                            );
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <AiFillYoutube
                          size={20}
                          color={theme.colors.red[600]}
                        />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Youtube"
                        defaultValue={doctorDetails?.you_tube_link}
                        {...register("you_tube_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          const isValidUrl =
                            /^(ftp|http|https):\/\/[^ "]+$/.test(
                              doctorDetails?.you_tube_link
                            );
                          if (isValidUrl) {
                            window.open(doctorDetails?.you_tube_link, "_blank");
                          } else {
                            ShowToast(
                              toast,
                              "error",
                              "This is not a valid url"
                            );
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                  </CardBody>
                </Card>
                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                >
                  <CardBody p={2}>
                    <Heading as={"h3"} size={"sm"}>
                      Fees
                    </Heading>
                    <Divider mt={2} mb={2} />

                    <FormControl>
                      <FormLabel>OPD Fee</FormLabel>
                      <Input
                        size={"sm"}
                        borderRadius={6}
                        type="number"
                        placeholder="OPD Fee"
                        {...register("opd_fee")}
                        defaultValue={doctorDetails?.opd_fee}
                      />
                    </FormControl>
                    <FormControl mt={3}>
                      <FormLabel>Video Fee</FormLabel>
                      <Input
                        size={"sm"}
                        borderRadius={6}
                        type="number"
                        placeholder="Video Fee"
                        {...register("video_fee")}
                        defaultValue={doctorDetails?.video_fee}
                      />
                    </FormControl>
                    <FormControl mt={3}>
                      <FormLabel>Emergency Fee</FormLabel>
                      <Input
                        size={"sm"}
                        borderRadius={6}
                        type="number"
                        placeholder="Emergency Fee"
                        {...register("emg_fee")}
                        defaultValue={doctorDetails?.emg_fee}
                      />
                    </FormControl>
                  </CardBody>
                </Card>
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel p={0}>
            <TimeSlotes doctorID={param.id} />
            <Divider my={10} />
            <VideoTimeSlotes doctorID={param.id} />
          </TabPanel>
          <TabPanel p={0}>
            <DoctorQueue doctorID={param.id} /> 
          </TabPanel>
          <TabPanel p={0}>
            <Review doctID={param.id} doctorDetails={doctorDetails} />
          </TabPanel>
          <TabPanel p={0}>
            <DoctAppointments doctID={param.id} />
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

const IsActiveSwitch = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.active);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;

          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};
const StopBooking = ({ id, isStop_booking }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, stop_booking) => {
    let data = { id, stop_booking };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Updated!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.stop_booking);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isStop_booking === 1}
        size={"sm"}
        onChange={(e) => {
          let stop_booking = e.target.checked ? 1 : 0;

          mutation.mutate({ id, stop_booking });
        }}
      />
    </FormControl>
  );
};
