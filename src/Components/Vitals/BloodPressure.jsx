import { BiTrash } from "react-icons/bi";
import { AiFillEdit } from "react-icons/ai";
/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Divider,
  Button,
  IconButton,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "@emotion/react";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useState } from "react";
import { ADD, GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import Loading from "../Loading";
import { useForm } from "react-hook-form";
import ShowToast from "../../Controllers/ShowToast";
import todayDate from "../../Controllers/today";

const addData = async (data) => {
  const res = await ADD(admin.token, "add_vitals", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const handleDelete = async (data) => {
  const res = await ADD(admin.token, "delete_vitals", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const handleUpdate = async (data) => {
  const res = await ADD(admin.token, "update_vitals", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function BloodPressure({ id, startDate, endDate, userID }) {
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: deleteisOpen,
    onOpen: deleteonOpen,
    onClose: deleteonClose,
  } = useDisclosure();
  const {
    isOpen: editisOpen,
    onOpen: editonOpen,
    onClose: editonClose,
  } = useDisclosure();
  const theme = useTheme();
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_vitals_family_member_id_type?family_member_id=${id}&type=Blood Pressure&start_date=${startDate}&end_date=${endDate}`
    );
    return res.data;
  };
  const { data, isLoading } = useQuery({
    queryKey: ["vitals", id, startDate, endDate],
    queryFn: getData,
    enabled: !!id,
  });

  const chartData = data
    ?.map((item) => ({
      dateTime: `${item.date} ${item.time}`,
      systolic: item.bp_systolic,
      diastolic: item.bp_diastolic,
    }))
    .reverse();

  const systolicGradientId = "colorSystolic";
  const diastolicGradientId = "colorDiastolic";

  const strokeColorSystolic = useColorModeValue(
    theme.colors.blue[500],
    theme.colors.blue[200]
  );
  const strokeColorDiastolic = useColorModeValue(
    theme.colors.red[500],
    theme.colors.red[200]
  );

  if (isLoading) return <Loading />;

  return (
    <Box bg={"#FFF"} w={"100%"}>
      <Box>
        {data && data.length ? (
          <>
            <Box flex={1} w={"100%"} ml={-9} mt={5} pr={1}>
              <ResponsiveContainer width="103%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id={systolicGradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={strokeColorSystolic}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="110%"
                        stopColor={strokeColorSystolic}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id={diastolicGradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={strokeColorDiastolic}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor={strokeColorDiastolic}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="none" />
                  <XAxis
                    dataKey="dateTime"
                    tick={false} // Hide X-axis ticks
                    axisLine={true} // Hide X-axis line
                  />
                  <YAxis
                    tick={true} // Hide Y-axis ticks
                    axisLine={true} // Hide Y-axis line
                    fontSize={10}
                  />
                  <Tooltip />
                  <Area
                    cursor={"pointer"}
                    type="monotone"
                    dataKey="systolic"
                    stroke={strokeColorSystolic}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${systolicGradientId})`}
                    name="Systolic Pressure"
                    // Hide legend label
                    activeDot={{
                      stroke: strokeColorSystolic,
                      strokeWidth: 3,
                      r: 1,
                    }}
                    dot={{ stroke: strokeColorSystolic, strokeWidth: 2, r: 1 }} // Show points
                  />
                  <Area
                    cursor={"pointer"}
                    type="monotone"
                    dataKey="diastolic"
                    stroke={strokeColorDiastolic}
                    fillOpacity={1}
                    strokeWidth={2}
                    fill={`url(#${diastolicGradientId})`}
                    name="Diastolic Pressure"
                    legendType="none" // Hide legend label
                    dot={{ stroke: strokeColorDiastolic, strokeWidth: 2, r: 1 }} // Show points
                    activeDot={{
                      stroke: strokeColorDiastolic,
                      strokeWidth: 3,
                      r: 1,
                    }}
                    connectNulls={true}
                    baseValue="dataMin"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>{" "}
            <Divider />
          </>
        ) : null}

        <Box p={1} mt={2}>
          <Flex justify={"space-between"} alignItems={"center"}>
            <Text fontSize={["sm", "sm"]} fontWeight="bold">
              Blood Pressure History -
            </Text>
            <Button
              size={"sm"}
              fontSize={["xs", "sm"]}
              colorScheme={"blue"}
              onClick={onOpen}
            >
              Add Data
            </Button>
          </Flex>
          {!data?.length ? (
            <Alert status="error" py={1} fontWeight={600} mt={3} fontSize={14}>
              <AlertIcon />
              No Data Found
            </Alert>
          ) : (
            <TableContainer mt={4}>
              <Table colorScheme="blue">
                <Thead>
                  <Tr bg={"blue.500"}>
                    <Th px={1} py={2} color={"#fff"}>
                      Systolic
                    </Th>
                    <Th px={1} py={2} color={"#fff"}>
                      Diastolic
                    </Th>
                    <Th px={1} py={2} color={"#fff"}>
                      Date
                    </Th>
                    <Th px={1} py={2} color={"#fff"}>
                      Time
                    </Th>
                    <Th px={1} py={2} color={"#fff"}>
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.map((record) => (
                    <Tr key={record.id} fontSize={14}>
                      <Td px={1} py={2}>
                        {record.bp_systolic ? record.bp_systolic : "N/A"}
                      </Td>
                      <Td px={1} py={2}>
                        {record.bp_diastolic ? record.bp_diastolic : "N/A"}
                      </Td>
                      <Td px={1} py={2}>
                        {" "}
                        {record.date}
                      </Td>
                      <Td px={1} py={2}>
                        {moment(record.time, "HH:mm:ss").format("hh:mm A")}
                      </Td>
                      <Td px={1} py={2}>
                        <Flex gap={1}>
                          <IconButton
                            colorScheme={"blue"}
                            size={"xs"}
                            variant={"ghost"}
                            icon={<AiFillEdit fontSize={18} />}
                            onClick={() => {
                              setselectedData(record);
                              editonOpen();
                            }}
                          />
                          <IconButton
                            colorScheme={"red"}
                            size={"xs"}
                            variant={"ghost"}
                            icon={<BiTrash fontSize={18} />}
                            onClick={() => {
                              setselectedData(record);
                              deleteonOpen();
                            }}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
      {isOpen ? (
        <AddNew
          isOpen={isOpen}
          onClose={onClose}
          selectedMember={id}
          userID={userID}
        />
      ) : null}
      {deleteisOpen ? (
        <DeleteData
          isOpen={deleteisOpen}
          onClose={deleteonClose}
          selectedMember={id}
          data={selectedData}
        />
      ) : null}
      {editisOpen ? (
        <Edit
          isOpen={editisOpen}
          onClose={editonClose}
          selectedMember={id}
          data={selectedData}
          userID={userID}
        />
      ) : null}
    </Box>
  );
}

export default BloodPressure;

const AddNew = ({ onClose, isOpen, selectedMember, userID }) => {
  const now = new Date();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: async (data) => {
      await addData(data);
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries(["vitals", selectedMember]);
      ShowToast(toast, "success", "Success");
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
      onClose();
    },
  });

  const onSubmit = (data) => {
    let formData = {
      ...data,
      user_id: userID,
      family_member_id: selectedMember,
      type: "Blood Pressure",
    };
    mutation.mutate(formData);
    // Reset the form after submission
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        overflow={"hidden"}
        as={"form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalHeader
          fontSize={"md"}
          py={2}
          textAlign={"center"}
          bg={"main.400"}
          color={"#fff"}
        >
          Add Blood Pressure Data
        </ModalHeader>

        <Divider />
        <ModalBody px={2}>
          <Flex gap={2}>
            <FormControl mb={4}>
              <FormLabel mb={1}>Date</FormLabel>
              <Input
                type="date"
                max={todayDate()}
                defaultValue={moment(now).format("YYYY-MM-DD")}
                {...register("date", { required: true })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel mb={1}>Time</FormLabel>
              <Input
                type="time"
                defaultValue={moment(now).format("HH:mm")}
                textAlign={"left"}
                {...register("time", { required: true })}
              />
            </FormControl>
          </Flex>

          <FormControl mb={4}>
            <FormLabel mb={1}>Systolic (mmHg)</FormLabel>
            <Input
              type="number"
              placeholder="Enter systolic pressure"
              {...register("bp_systolic", { required: true })}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel mb={1}>Diastolic (mmHg)</FormLabel>
            <Input
              type="number"
              placeholder="Enter diastolic pressure"
              {...register("bp_diastolic", { required: true })}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose} size={"sm"}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            size={"sm"}
            w={32}
            isLoading={mutation.isPending}
            type="submit"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Edit = ({ onClose, isOpen, selectedMember, data, userID }) => {
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries(["vitals", selectedMember]);
      ShowToast(toast, "success", "Success");
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
      onClose();
    },
  });

  const onSubmit = (dataForm) => {
    let formData = {
      ...dataForm,
      user_id: userID,
      family_member_id: selectedMember.id,
      type: "Blood Pressure",
      id: data.id,
    };
    mutation.mutate(formData);
    // Reset the form after submission
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        overflow={"hidden"}
        as={"form"}
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalHeader
          fontSize={"md"}
          py={2}
          textAlign={"center"}
          bg={"main.400"}
          color={"#fff"}
        >
          Update Blood Pressure Data
        </ModalHeader>

        <Divider />
        <ModalBody px={2}>
          <Flex gap={2}>
            <FormControl mb={4}>
              <FormLabel mb={1}>Date</FormLabel>
              <Input
                max={todayDate()}
                type="date"
                defaultValue={data.date}
                {...register("date", { required: true })}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel mb={1}>Time</FormLabel>
              <Input
                type="time"
                defaultValue={data.time}
                textAlign={"left"}
                {...register("time", { required: true })}
              />
            </FormControl>
          </Flex>

          <FormControl mb={4}>
            <FormLabel mb={1}>Systolic (mmHg)</FormLabel>
            <Input
              type="number"
              placeholder="Enter systolic pressure"
              defaultValue={data.bp_systolic}
              {...register("bp_systolic", { required: true })}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel mb={1}>Diastolic (mmHg)</FormLabel>
            <Input
              type="number"
              defaultValue={data.bp_diastolic}
              placeholder="Enter diastolic pressure"
              {...register("bp_diastolic", { required: true })}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose} size={"sm"}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            size={"sm"}
            w={32}
            isLoading={mutation.isPending}
            type="submit"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
const DeleteData = ({ onClose, isOpen, selectedMember, data }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mutation = useMutation({
    mutationFn: async () => {
      let formData = {
        id: data.id,
      };
      await handleDelete(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["vitals", selectedMember]);
      ShowToast(toast, "success", "Success");
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
      onClose();
    },
  });

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Vitals Data
          </AlertDialogHeader>

          <AlertDialogBody fontSize={"md"} fontWeight={500}>
            Are you sure? Do you want to delete Blood Pressure data for date -{" "}
            {data?.date}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onClose} size={"sm"}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={mutation.mutate}
              ml={3}
              size={"sm"}
              w={32}
              isLoading={mutation.isPending}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
