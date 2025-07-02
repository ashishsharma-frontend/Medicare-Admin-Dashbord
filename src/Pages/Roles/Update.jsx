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
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ADD, GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import RolePermissions from "./RolePermissons";
import Loading from "../../Components/Loading";
const permissonsIDs = (data) => {
  if (!data?.length) return [];
  const IDs = data?.map((item) => item.permission_id);
  return IDs;
};

const updatePermission = async (data) => {
  const res = await ADD(admin.token, "assign_permission_to_tole", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
export default function UpdateRoleModel({ isOpen, onClose, data }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState();
  const toast = useToast();
  const getData = async () => {
    const res = await GET(admin.token, `get_role_permisssion/role/${data.id}`);
    return res.data;
  };
  const { data: permissons, isLoading: isPermissionsLoading } = useQuery({
    queryKey: ["permissons", data.id],
    queryFn: getData,
  });

  useEffect(() => {
    setSelectedPermissions(permissonsIDs(permissons));
  }, [permissons]);

  const updateRole = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      id: data.id,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "update_role", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Role Updated!");
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

  const mutation = useMutation({
    mutationFn: async () => {
      let formData = {
        role_id: data.id,
        permission_ids: selectedPermissions.join(",") || "",
      };

      await updatePermission(formData);
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Permissions Updated");
      queryClient.invalidateQueries("roles");
      queryClient.invalidateQueries(["permissions", data.id]);
      onClose();
    },
  });

  if (isPermissionsLoading) return <Loading />;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"3xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={18} py={2}>
          Update Role
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <Flex
              as={"form"}
              onSubmit={handleSubmit(updateRole)}
              align={"flex-end"}
              gap={5}
            >
              {" "}
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  size={"sm"}
                  borderRadius={6}
                  defaultValue={data?.name}
                  placeholder="Name"
                  {...register("role_name", { required: true })}
                />
              </FormControl>
              <Button
                w={48}
                variant="solid"
                size={"sm"}
                colorScheme="blue"
                type="submit"
                isLoading={isLoading}
              >
                Update Title
              </Button>
            </Flex>

            <FormControl mt={5}>
              <FormLabel>Permissoins</FormLabel>

              <RolePermissions
                selectedPermissions={selectedPermissions}
                setSelectedPermissions={setSelectedPermissions}
                onClose={onClose}
                role_id={data.id}
              />
            </FormControl>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button
            w={"50"}
            variant="solid"
            size={"sm"}
            colorScheme="blue"
            mr={5}
            isLoading={mutation.isPending}
            onClick={() => {
              mutation.mutate();
            }}
          >
            Update Permissions
          </Button>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
