/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicTable from "../../Components/DataTable";
import { DELETE, GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import AddRoleModel from "./Add";
import DeleteRole from "./Delete";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import AssignRole from "./AssignRole";
import ShowToast from "../../Controllers/ShowToast";
const getRoles = async () => {
  const res = await GET(admin.token, "get_roles");
  return res.data;
};
const getData = async () => {
  const res = await GET(admin.token, "get_assign_roles");
  const rearrangedArray = res?.data.map((item) => {
    const {
      id,
      user_id,
      role_id,
      role_name,
      f_name,
      l_name,
      phone,
      isd_code,
      updated_at,
      created_at,
    } = item;

    return {
      id: id,
      user_id,
      role_id,
      role_name: role_name,
      name: `${f_name} ${l_name}`,
      phone: `${phone}`,
      created_at,
      updated_at,
      serchQuery:
        id +
        user_id +
        role_id +
        role_name +
        f_name +
        l_name +
        phone +
        isd_code +
        updated_at +
        created_at,
    };
  });
  return rearrangedArray;
};

export default function AssignedUsers() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const {
    isOpen: AssignisOpen,
    onOpen: AssignonOpen,
    onClose: AssignonClose,
  } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["assigned-roles"],
    queryFn: getData,
  });
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
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
  const { hasPermission } = useHasPermission();
  if (!hasPermission("ROLE_VIEW")) return <NotAuth />;

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
            {hasPermission("ROLE_ADD") && (
              <Flex align={"center"} gap={5}>
                <Button size={"sm"} colorScheme="teal" onClick={AssignonOpen}>
                  Assign Role To User
                </Button>
                <Button size={"sm"} colorScheme="blue" onClick={onOpen}>
                  Add New Role
                </Button>
              </Flex>
            )}
          </Flex>
          <DynamicTable
            data={filteredData}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                DeleteonOpen={DeleteonOpen}
              />
            }
          />
        </Box>
      )}

      <AddRoleModel isOpen={isOpen} onClose={onClose} />
      {DeleteisOpen && (
        <DeleteAssignRole
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={SelectedData}
        />
      )}

      {AssignisOpen && (
        <AssignRole
          isOpen={AssignisOpen}
          onClose={AssignonClose}
          Roles={roles}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("ROLE_DELETE") && (
        <IconButton
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
      )}
    </Flex>
  );
};

function DeleteAssignRole({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setisLoading] = useState();

  const DeleteRole = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "de_assign_role", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Deleted!");
        queryClient.invalidateQueries("roles");
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="semi-bold">
            Delete Assign Role ( <b>{data.role_name}</b> ) form ({data.name})
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You can not undo this action afterwards.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              colorScheme="gray"
              size={"sm"}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={DeleteRole}
              ml={3}
              size={"sm"}
              isLoading={isLoading}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
