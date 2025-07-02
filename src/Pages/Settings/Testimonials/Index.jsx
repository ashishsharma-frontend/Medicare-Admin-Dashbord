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
} from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import useSearchFilter from "../../../Hooks/UseSearchFilter";
import DynamicTable from "../../../Components/DataTable";
import { GET } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import DeleteSocial from "./delete.JSX";
import AddTestimonial from "./Add";
import UpdateTastimonials from "./Update";
import useHasPermission from "../../../Hooks/HasPermission";
import NotAuth from "../../../Components/NotAuth";

export default function Testimonials() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();

  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";

  const getData = async () => {
    const res = await GET(admin.token, "get_testimonial");
    const newData = res.data.map((item) => {
      const { id, title, sub_title, description, rating, image } = item;
      return {
        id,
        name: title,
        sub_title,
        rating,
        image,
        description,
      };
    });
    return newData;
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["testimonials"],
    queryFn: getData,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  const { hasPermission } = useHasPermission();
  if (!hasPermission("TESTIMONIAL_VIEW")) return <NotAuth />;

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
            <Box>
              <Button
                size={"sm"}
                colorScheme="blue"
                onClick={onOpen}
                isDisabled={!hasPermission("TESTIMONIAL_ADD")}
              >
                Add New
              </Button>
            </Box>
          </Flex>
          <DynamicTable
            minPad={"8px 8px"}
            data={filteredData}
            onActionClick={
              <SocialMediaActionButton
                onClick={handleActionClick}
                DeleteonOpen={DeleteonOpen}
                EditonOpen={EditonOpen}
              />
            }
          />
        </Box>
      )}
      <AddTestimonial isOpen={isOpen} onClose={onClose} />

      <DeleteSocial
        isOpen={DeleteisOpen}
        onClose={DeleteonClose}
        data={SelectedData}
      />
      {EditisOpen && (
        <UpdateTastimonials
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={SelectedData}
        />
      )}
    </Box>
  );
}

const SocialMediaActionButton = ({
  onClick,
  rowData,
  DeleteonOpen,
  EditonOpen,
}) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          EditonOpen();
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
        isDisabled={!hasPermission("TESTIMONIAL_UPDATE")}
      />

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
        isDisabled={!hasPermission("TESTIMONIAL_DELETE")}
      />
    </Flex>
  );
};
