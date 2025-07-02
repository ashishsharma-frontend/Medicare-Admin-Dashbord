/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Image,
  Text,
} from "@chakra-ui/react";
import imageBaseURL from "../Controllers/image";
import moment from "moment";

const DynamicTable = ({ data, onActionClick, minPad, imgLast }) => {
  if (!data || data.length === 0) {
    return (
      <Text
        textAlign="center"
        mt={4}
        w={"100%"}
        padding={"4px"}
        background={"red.100"}
        color={useColorModeValue("#000", "#000")}
      >
        No data found
      </Text>
    );
  }

  // Automatically generate columns based on the keys of the first object in the data array
  const columns = React.useMemo(() => {
    const originalColumns = Object?.keys(data[0]);

    // Check if "id" is present in the original columns
    const hasIdColumn = originalColumns.includes("id");

    // Specify the columns you want to keep in a specific order
    const desiredColumns = hasIdColumn ? ["id"] : [];

    // Check if "image" is available in the original columns
    const hasImageColumn = originalColumns.includes("image");

    // Add "image" column if it exists and not already added
    if (hasImageColumn && !desiredColumns.includes("image") && !imgLast) {
      desiredColumns.push("image");
    }

    // Filter out the columns not in the desired list and maintain the original order
    const remainingColumns = originalColumns.filter(
      (column) => !desiredColumns.includes(column)
    );
    const removed = remainingColumns.filter(
      (column) =>
        ![
          "current_cancel_req_status",
          "filterCancelation",
          "filterStatus",
          "serchQuery",
          "file_name",
        ].includes(column)
    );

    // Include remaining columns in the desired order
    const rearrangedColumns = [...desiredColumns, ...removed];

    return rearrangedColumns;
  }, [data, imgLast]);

  function convertToReadableFormat(text) {
    return text.replace(/_/g, " ");
  }

  return (
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
            {onActionClick && (
              <Th
                color={useColorModeValue("#000", "#fff")}
                py={3}
                textAlign={"center"}
              >
                Action
              </Th>
            )}
            {columns.map((column) => (
              <Th
                key={column}
                color={useColorModeValue("#000", "#fff")}
                py={3}
                padding={minPad || "8px 8px"}
              >
                {convertToReadableFormat(column)}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {onActionClick && (
                <Td w={5}>
                  {React.cloneElement(onActionClick, { rowData: row })}
                </Td>
              )}
              {columns.map((column) => (
                <Td
                  key={column}
                  w={"fit-content"}
                  maxW="200px"
                  overflow={"hidden"}
                  padding={minPad || "1px 8px"}
                  borderRight={0}
                  borderLeft={0}
                >
                  {column === "image" ? (
                    <Image
                      src={
                        row[column] &&
                        row[column] !== "null" &&
                        row[column] !== null
                          ? `${imageBaseURL}/${row[column]}`
                          : "imagePlaceholder.png"
                      }
                      w={8}
                      fallbackSrc="imagePlaceholder.png"
                    />
                  ) : column === "created_at" || column === "updated_at" ? (
                    <p>
                      {row[column] &&
                      row[column] !== "null" &&
                      row[column] !== null &&
                      row[column] !== ""
                        ? moment
                            .utc(row[column])
                            .local()
                            .format("DD MMM YY  hh:mm A")
                        : "N/A"}
                    </p>
                  ) : row[column] &&
                    row[column] !== "null" &&
                    row[column] !== null &&
                    row[column] !== "" ? (
                    row[column]
                  ) : (
                    "N/A"
                  )}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default DynamicTable;
