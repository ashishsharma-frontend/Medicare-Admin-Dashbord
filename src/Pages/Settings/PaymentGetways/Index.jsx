/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  useColorModeValue,
  useToast,
  useDisclosure,
  Tooltip,
  FormControl,
  theme,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit } from "react-icons/fi";
import { GET, UPDATE } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import ShowToast from "../../../Controllers/ShowToast";
import UpdatePaymentGetways from "./Update";

const getData = async () => {
  const res = await GET(admin.token, "get_payment_gateway");

  return res.data;
};

function PaymentGetways({ currentTab, activeTab }) {
  const toast = useToast();
  const id = "Errortoast";
  const [selectedData, setselectedData] = useState();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();

  const { isLoading, data, error } = useQuery({
    queryKey: ["payment-getways"],
    queryFn: getData,
    enabled: currentTab == activeTab,
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
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={50} h={8} />
          </Flex>
          <Skeleton h={300} w={"100%"} />
        </Box>
      ) : (
        <Box>
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
                <Tr>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Action
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    ID
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Title
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Key
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Secret
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Webhook Secret Key
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Is Active
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Created At
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Updated At
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      {" "}
                      <Flex justify={"center"}>
                        <IconButton
                          size={"sm"}
                          variant={"ghost"}
                          _hover={{
                            background: "none",
                          }}
                          onClick={() => {
                            setselectedData(item);
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
                    <Td>{item.id}</Td>
                    <Td>{item.title}</Td>
                    <Td>
                      <MaskedCell value={item.key} />
                    </Td>
                    <Td>
                      <MaskedCell value={item.secret} />
                    </Td>
                    <Td>
                      <MaskedCell value={item.webhook_secret_key} />
                    </Td>
                    <Td>
                      <IsActive id={item.id} isActive={item.is_active} />
                    </Td>
                    <Td>{item.created_at}</Td>
                    <Td>{item.updated_at}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {EditisOpen && (
        <UpdatePaymentGetways
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={selectedData}
        />
      )}
    </Box>
  );
}

const MaskedCell = ({ value }) => {
  const [show, setShow] = useState(false);
  function maskApiKey(apiKey) {
    // Check if the key length is sufficient for masking
    if (apiKey.length <= 7) {
      const firstPart = apiKey.slice(0, 1); // First 3 characters
      const lastPart = apiKey.slice(-1); // Last 4 characters
      const maskedPart = "*".repeat(apiKey.length - 5); // If it's too short, return it as is
      return `${firstPart}${maskedPart}${lastPart}`;
    } else {
      const firstPart = apiKey.slice(0, 3); // First 3 characters
      const lastPart = apiKey.slice(-4); // Last 4 characters
      const maskedPart = "*".repeat(apiKey.length - 7); // Mask the middle part
      return `${firstPart}${maskedPart}${lastPart}`;
    }
  }

  return (
    <Td
      w={"fit-content"}
      maxW="200px"
      overflow={"hidden"}
      borderRight={0}
      borderLeft={0}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Tooltip
        label={maskApiKey(value)}
        isOpen={show}
        placement="top"
        hasArrow
        bg="blue.500"
        color="white"
        transition="all 0.2s"
        borderRadius="md"
      >
        <span>*************</span>
      </Tooltip>
    </Td>
  );
};

const IsActive = ({ id, isActive }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, is_active: active };
    try {
      const res = await UPDATE(admin.token, "update_payment_gateway", data);
      if (res.response === 200) {
        return res;
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
    onSuccess: () => {
      ShowToast(toast, "success", "Payment getway updated!");
      queryClient.invalidateQueries("payment-getways");
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;
          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};

export default PaymentGetways;
