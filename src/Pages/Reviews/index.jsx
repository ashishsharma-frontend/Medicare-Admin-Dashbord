/* eslint-disable react/prop-types */
import {
  Badge,
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import moment from "moment";
import DynamicTable from "../../Components/DataTable";
import Pagination from "../../Components/Pagination";
import useDebounce from "../../Hooks/UseDebounce";
import DateRangeCalender from "../../Components/DateRangeCalender";
import { GET } from "../../Controllers/ApiControllers";
import ErrorPage from "../../Components/ErrorPage";
import { RefreshCwIcon } from "lucide-react";
import admin from "../../Controllers/admin";



const ReviewsPage = () => {
  const toast = useToast();
  const id = "ErrorToast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const { startDate, endDate } = dateRange;

  const getPageIndices = (currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;
    return { startIndex, endIndex };
  };

  const { startIndex, endIndex } = getPageIndices(page, 50);

  const fetchReviews = async () => {
    const url =
      admin.role.name === "Doctor"
        ? `get_doctor_review_page?start=${startIndex}&end=${endIndex}&start_date=${startDate}&end_date=${endDate}&search=${debouncedSearchQuery}&doctor_id=${admin.id}`
        : `get_doctor_review_page?start=${startIndex}&end=${endIndex}&start_date=${startDate}&end_date=${endDate}&search=${debouncedSearchQuery}`;
    const response = await GET(admin.token, url);
    return {
      data: response.data,
      totalRecord: response.total_record,
    };
  };

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["reviews", page, debouncedSearchQuery, dateRange],
    queryFn: fetchReviews,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil((data?.totalRecord || 0) / 50);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Error",
        description: "Failed to fetch reviews.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }

  return (
    <Box ref={boxRef}>
      {isLoading ? (
        <Box>
          <Skeleton height={8} width={400} mb={4} />
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} height={8} width="100%" mb={2} />
          ))}
        </Box>
      ) : (
        <Box>
          <Flex justifyContent="space-between" mb={4}>
            <Flex gap={4}>
              <Input
                placeholder="Search reviews"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setDateRange}
                size={"md"}
              />
            </Flex>
            <Button
              isLoading={isFetching}
              onClick={() => queryClient.invalidateQueries(["reviews"])}
              rightIcon={<RefreshCwIcon size={16} />}
              size={"sm"}
              colorScheme={"blue"}
            >
              Refresh
            </Button>
          </Flex>

          <DynamicTable
          minPad={3}
            data={data?.data?.map((review) => ({
              ID: review.id,
              "Doctor Name": `${review.doct_f_name} ${review.doct_l_name}`,
              "patinent Name": `${review.f_name} ${review.l_name}`,
              "Appointment ID": review.appointment_id,
              Points: (
                <Badge
                  colorScheme={
                    review.points >= 4
                      ? "green"
                      : review.points >= 2
                      ? "yellow"
                      : "red"
                  }
                >
                  {review.points}
                </Badge>
              ),
              Description: review.description,
              Date: moment(review.created_at).format("DD MMM YYYY, hh:mm A"),
            }))}
          />

          <Flex justifyContent="center" mt={4}>
            <Pagination
              currentPage={page}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ReviewsPage;
