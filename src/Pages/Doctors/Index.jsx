/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  FormControl,
  IconButton,
  Input,
  Skeleton,
  Switch,
  theme,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import DeleteDoctor from "./Delete";
import { useNavigate } from "react-router-dom";
import useHasPermission from "../../Hooks/HasPermission";
import ShowToast from "../../Controllers/ShowToast";
import NotAuth from "../../Components/NotAuth";
import t from "../../Controllers/configs";

export default function Doctors() {
  const { hasPermission } = useHasPermission();
  const [SelectedData, setSelectedData] = useState();
  const [searchTerm, setsearchTerm] = useState();
  const {
    isOpen: DeleteisOpen,
    // onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const navigate = useNavigate();

  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    await t();
    const res = await GET(admin.token, "get_doctor");
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        id,
        user_id,
        image,
        f_name,
        l_name,
        phone,
        email,
        specialization,
        department_name,
        active,
        stop_booking,
      } = doctor;
      return {
        id,
        UserID: user_id,
        image,
        Name: `${f_name} ${l_name}`,
        phone,
        email,
        specialization,
        dept: department_name,
        active: <IsActive id={user_id} isActive={active} />,
        "Stop Booking": (
          <StopBooking id={user_id} isStop_booking={stop_booking} />
        ),
      };
    });
    return rearrangedArray;
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["doctors"],
    queryFn: getData,
  });

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

  function filterData(data, searchKey = "") {
    // If the search key is empty or a string, return all data
    if (!searchKey) {
      return data;
    }

    // Filter the data based on the search key matching any key or value
    return data.filter((doctor) => {
      for (const key in doctor) {
        const value = doctor[key]?.toString().toLowerCase();
        if (value && value.includes(searchKey.toLowerCase())) {
          return true;
        }
      }
      return false;
    });
  }

  if (!hasPermission("DOCTOR_VIEW")) return <NotAuth />;

  return (
    <Box>
      {isLoading || !data ? (
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
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Input
              size={"md"}
              placeholder="Search"
              w={400}
              maxW={"50vw"}
              onChange={(e) => {
                setsearchTerm(e.target.value);
              }}
            />
            <Box>
              <Button
                isDisabled={!hasPermission("DOCTOR_ADD")}
                size={"sm"}
                colorScheme="blue"
                onClick={() => {
                  navigate("/doctors/add");
                }}
              >
                Add New
              </Button>
            </Box>
          </Flex>
          <DynamicTable
            data={filterData(data, searchTerm)}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                navigate={navigate}
              />
            }
          />
        </Box>
      )}

      <DeleteDoctor
        isOpen={DeleteisOpen}
        onClose={DeleteonClose}
        data={SelectedData}
      />
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          navigate(`/doctor/update/${rowData.UserID}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
      <IconButton
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          DeleteonOpen();
        }}
        icon={<FaTrash fontSize={18} color={theme.colors.red[500]} />}
      />
    </Flex>
  );
};

export const IsActive = ({ id, isActive }) => {
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
export const StopBooking = ({ id, isStop_booking }) => {
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
