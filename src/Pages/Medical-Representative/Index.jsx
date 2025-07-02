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
import { FiEdit } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import DynamicTable from "../../Components/DataTable";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import AddMr from "./AddMr";
import useDebounce from "../../Hooks/UseDebounce";
import Pagination from "../../Components/Pagination";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";

const ITEMS_PER_PAGE = 50;

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

const transformData = (data) => {
  return data?.map((item) => {
    const { id, f_name, l_name, phone, gender, dob, age, email, image, created_at } =
      item;
    return {
      id,

      name: `${f_name} ${l_name}`,
      phone,
      gender,
      date_Of_Birth: dob ? moment(dob).format("DD MMM YYYY") : "N/A",
      age,
      email: email || "N/A",
      image,
      created_At: moment(created_at).format("DD MMM YYYY hh:mm a"),
    };
  });
};

const MedicalRepresentative = () => {
  const { hasPermission } = useHasPermission();
  const [selectedData, setSelectedData] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const { isLoading, data, error } = useQuery({
    queryKey: ["mrs", page, debouncedSearchQuery],
    queryFn: async () => {
      const res = await GET(
        admin.token,
        `get_mr/page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}`
      );
      return { data: res.data, totalRecord: res.total_record };
    },
  });

  const handlePageChange = (newPage) => setPage(newPage);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  useEffect(() => {
    if (error && !toast.isActive("Errortoast")) {
      toast({
        id: "Errortoast",
        title: "Oops!",
        description: "Something bad happened.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }, [error, toast]);

  const totalPage = Math.ceil(data?.totalRecord / ITEMS_PER_PAGE);
  const handleActionClick = (rowData) => setSelectedData(rowData);

  if (!hasPermission("PATIENT_VIEW")) return <NotAuth />;

  return (
    <Box>
      {isLoading || !data ? (
        <SkeletonList />
      ) : (
        <Box>
          <Flex mb={5} justify="space-between" align="center">
            <Input
              size="md"
              placeholder="Search"
              w={400}
              maxW="50vw"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />

            <Button
              size="sm"
              colorScheme="blue"
              onClick={onOpen}
              isDisabled={!hasPermission("PATIENT_ADD")}
            >
              Add New
            </Button>
          </Flex>
          <DynamicTable
            imgLast={true}
            minPad="1px 20px"
            data={transformData(data?.data)}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                navigate={navigate}
                rowData={selectedData}
              />
            }
          />
        </Box>
      )}
      <Flex justify="center" mt={4}>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPage}
        />
      </Flex>
      <AddMr isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

const SkeletonList = () => (
  <Box>
    <Flex mb={5} justify="space-between">
      <Skeleton w={400} h={8} />
      <Skeleton w={200} h={8} />
    </Flex>
    {Array.from({ length: 10 }).map((_, index) => (
      <Skeleton key={index} h={10} w="100%" mt={2} />
    ))}
  </Box>
);

const YourActionButton = ({ onClick, rowData, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify="center">
      <IconButton
        isDisabled={!hasPermission("PATIENT_UPDATE")}
        size="sm"
        variant="ghost"
        _hover={{ background: "none" }}
        onClick={() => {
          onClick(rowData);
          navigate(`/medical-representative/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};

export default MedicalRepresentative;
