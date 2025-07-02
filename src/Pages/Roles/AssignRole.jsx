/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
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
import { useQueryClient } from "@tanstack/react-query";
import { UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import UsersCombobox from "../../Components/UsersComboBox";
import useUserData from "../../Hooks/Users";

export default function AssignRole({ isOpen, onClose, Roles }) {
  const [isLoading, setisLoading] = useState(false);
  const { hasPermission } = useHasPermission();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { usersData } = useUserData();
  const [selectedUser, setselectedUser] = useState();

  const addRole = async (Inputdata) => {
    if (!selectedUser) {
      return ShowToast(toast, "error", "Please Select User");
    }
    let formData = {
      ...Inputdata,
      user_id: selectedUser.id,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "assign_role", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Success");
        queryClient.invalidateQueries("roles");
        reset();
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };
  if (!hasPermission)
    return toast({
      title: "You are not authorized",
      description:
        "You tried to access a page you do not have permission to view.",
      status: "error",
      duration: 2000,
      isClosable: true,
      position: "top",
    });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(addRole)}>
        <ModalHeader fontSize={18} py={2}>
          Assign Role To User
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>User</FormLabel>
              <UsersCombobox
                name={"user"}
                data={usersData}
                setState={setselectedUser}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Role</FormLabel>
              <Select
                placeholder="Select Role"
                {...register("role_id", { required: true })}
              >
                {Roles?.map((role) => (
                  <option value={role.id} key={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </FormControl>
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
            Assign Role
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
