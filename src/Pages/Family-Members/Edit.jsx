/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import Loading from "../../Components/Loading";
import moment from "moment";
import ShowToast from "../../Controllers/ShowToast";
import todayDate from "../../Controllers/today";

function EditFamily({ data, isOpen, onClose }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { isLoading: isDataLoading, data: memberData } = useQuery({
    queryKey: ["family-member", data.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_family_members/${data.id}`);
      return res.data;
    },
  });

  const AddNewDepartment = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      dob: moment(Inputdata.dob).format("YYYY-MM-DD"),
      id: data.id,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "update_family_member", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Family Member Updated!");
        queryClient.invalidateQueries(["family-member", data.id]);
        queryClient.invalidateQueries(["family-members"]);
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  if (isDataLoading) return <Loading />;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"2xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Update Family Member
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <Flex gap={3}>
              {" "}
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  defaultValue={memberData?.f_name}
                  placeholder="First Name"
                  {...register("f_name", { required: true })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  defaultValue={memberData?.l_name}
                  placeholder="Last Name"
                  {...register("l_name", { required: true })}
                />
              </FormControl>
            </Flex>
            <Flex gap={3} mt={5}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Gender</FormLabel>
                <Select
                  defaultValue={memberData?.gender}
                  placeholder="Select Gender"
                  {...register("gender", { required: true })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date Of Birth</FormLabel>
                <Input
                  max={todayDate()}
                  type="date"
                  defaultValue={memberData?.dob}
                  placeholder="Date Of Birth"
                  {...register("dob", { required: true })}
                />
              </FormControl>
            </Flex>
            <Flex gap={3} mt={5}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <Input
                  defaultValue={memberData?.phone}
                  placeholder="Phone"
                  {...register("phone", { required: true,pattern: /^[0-9]+$/ })}
                />
              </FormControl>
            </Flex>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Close
          </Button>
          <Button
            variant="solid"
            size={"sm"}
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
          >
            Update Family Member
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditFamily;
