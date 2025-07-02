/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  IconButton,
  Skeleton,
  theme,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import DynamicTable from "../DataTable";
import { FaTrash } from "react-icons/fa";
import AddDoctorTimeSlotes from "./Add";
import { useState } from "react";
import DeleteTimeSlots from "./Delete";

export default function TimeSlotes({ doctorID }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  // get
  const getDoctorTimeSlotes = async () => {
    const res = await GET(admin.token, `get_doctor_time_slots/${doctorID}`);
    const rearrangedArray = res?.data.map((slotes) => {
      const { day, time_start, time_end, time_duration, id } = slotes;
      return {
        id,
        day,
        time_start,
        time_end,
        time_duration,
      };
    });
    return rearrangedArray;
  };

  const { data: timeSlotes } = useQuery({
    queryKey: ["time-slotes", doctorID],
    queryFn: getDoctorTimeSlotes,
  });
  return (
    <>
      <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
        <CardBody p={3}>
          <Flex alignItems={"center"} justifyContent={"space-between"}>
            {" "}
            <Heading as={"h3"} size={"sm"}>
              OPD Time Slotes -{" "}
            </Heading>
            <Button
              size={"sm"}
              colorScheme="blue"
              onClick={() => {
                onOpen();
              }}
            >
              Add New
            </Button>
          </Flex>
          <Divider mt={2} mb={5} />
          {timeSlotes ? (
            <DynamicTable
              data={timeSlotes}
              onActionClick={
                <YourActionButton
                  onClick={handleActionClick}
                  DeleteonOpen={DeleteonOpen}
                />
              }
              minPad={"8px 8px"}
            />
          ) : (
            <>
              {" "}
              <Skeleton w={"100%"} h={5} mt={2} />
              <Skeleton w={"100%"} h={5} mt={2} />
              <Skeleton w={"100%"} h={5} mt={2} />
              <Skeleton w={"100%"} h={5} mt={2} />
            </>
          )}
        </CardBody>
      </Card>
      <AddDoctorTimeSlotes
        isOpen={isOpen}
        onClose={onClose}
        doctorID={doctorID}
      />

      {DeleteisOpen && (
        <DeleteTimeSlots
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={SelectedData}
          doctID={doctorID}
        />
      )}
    </>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen }) => {
  return (
    <Flex justify={"center"}>
      <IconButton
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        padding={2}
        onClick={() => {
          onClick(rowData);
          DeleteonOpen();
        }}
        icon={<FaTrash fontSize={16} color={theme.colors.red[500]} />}
      />
    </Flex>
  );
};
