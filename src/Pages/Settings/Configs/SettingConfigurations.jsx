/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  FormControl,
  IconButton,
  Image,
  Skeleton,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  theme,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { GET, UPDATE } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit } from "react-icons/fi";
import ShowToast from "../../../Controllers/ShowToast";
import UpdateConfigs from "./UpdateConfigs";
import imageBaseURL from "../../../Controllers/image";
import r from "../../../Controllers/configs";

function SettingConfigurations({ groupName }) {
  const [SelectedData, setSelectedData] = useState();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    await r();
    const res = await GET(
      admin.token,
      `get_configurations/group_name/${groupName}`
    );

    if (res.response === 200 && Array.isArray(res.data)) {
      return res.data;
    } else {
      throw new Error("Failed to fetch data");
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["group-configs", groupName],
    queryFn: getData,
  });

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
  return (
    <Box>
      {isLoading || !data ? (
        <Box mt={10}>
          <Skeleton h={300} w={"100%"} />
        </Box>
      ) : (
        <Box maxWidth="100%" overflowX="auto" mt={10}>
          <TableContainer
            border={"1px solid"}
            borderColor={useColorModeValue("gray.100", "gray.600")}
            borderRadius={"lg"}
            padding={3}
          >
            <Table
              variant="simple"
              colorScheme="gray"
              fontSize={12}
              size={"sm"}
              fontWeight={500}
            >
              <Thead background={useColorModeValue("blue.50", "blue.700")}>
                <Tr color={"#000"}>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    padding={"8px 8px"}
                    textAlign={"center"}
                  >
                    ACTION
                  </Th>
                  {["ID", "Titile", "Value", "Last Update"].map((item) => (
                    <Th
                      key={item}
                      color={useColorModeValue("#000", "#fff")}
                      py={3}
                      padding={"8px 8px"}
                    >
                      {item}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {data.map((item) => (
                  <Tr key={item.id}>
                    <Td padding={"12px"}>
                      {" "}
                      <Flex justify={"center"}>
                        <IconButton
                          isDisabled={
                            item.value === "true" ||
                            item.value === "false" ||
                            item.value === true ||
                            item.value === false
                          }
                          size={"sm"}
                          variant={"ghost"}
                          _hover={{
                            background: "none",
                          }}
                          onClick={() => {
                            setSelectedData(item);
                            EditonOpen();
                          }}
                          icon={
                            <FiEdit
                              fontSize={18}
                              color={theme.colors.blue[500]}
                            />
                          }
                        />
                      </Flex>
                    </Td>
                    <Td padding={"12px"}>{item.id}</Td>
                    <Td padding={"12px"}>{item.title}</Td>
                    <Td padding={"12px"} maxW={500} overflow={"hidden"}>
                      {item.id_name === "fav_icon" ||
                      item.id_name === "logo" ||
                      item?.id_name === "ma_doctor_image" ||
                      item?.id_name === "web_doctor_image" ? (
                        <Image
                          src={`${imageBaseURL}/${item.value}`}
                          w={12}
                          fallbackSrc="imagePlaceholder.png"
                        />
                      ) : item.value === "true" ||
                        item.value === "false" ||
                        item.value === true ||
                        item.value === false ? (
                        <IsActive
                          id={item.id}
                          isActive={item.value}
                          groupName={item.group_name}
                        />
                      ) : (
                        item.value
                      )}
                    </Td>
                    <Td padding={"12px"}>{item.updated_at}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {EditisOpen && (
        <UpdateConfigs
          data={SelectedData}
          isOpen={EditisOpen}
          onClose={EditonClose}
        />
      )}
    </Box>
  );
}

export default SettingConfigurations;

const IsActive = ({ id, isActive, groupName }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, value) => {
    let data = { id, value };
    try {
      const res = await UPDATE(admin.token, "update_configurations", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Updated!");
        queryClient.invalidateQueries("group-configs", groupName);
      } else {
        ShowToast(toast, "error", res.message);
        queryClient.invalidateQueries("group-configs", groupName);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.value);
    },
    onError: () => {
      queryClient.invalidateQueries("group-configs", groupName);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        defaultChecked={isActive === "true"}
        size={"md"}
        onChange={(e) => {
          let value = e.target.checked ? "true" : "false";

          mutation.mutate({ id, value });
        }}
      />
    </FormControl>
  );
};
