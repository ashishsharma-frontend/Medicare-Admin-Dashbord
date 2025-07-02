/* eslint-disable react/prop-types */
import { useState } from "react";
import { Checkbox, Text, Grid, Box, Input } from "@chakra-ui/react";
import useAllPermissions from "../../Hooks/UseAllPermissions";

const RolePermissions = ({ selectedPermissions, setSelectedPermissions }) => {
  const { allPermissionsData } = useAllPermissions();

  const [searchQuery, setSearchQuery] = useState("");

  const handleCheckboxChange = (permissionId) => {
    setSelectedPermissions((prevSelected) =>
      prevSelected.includes(permissionId)
        ? prevSelected.filter((id) => id !== permissionId)
        : [...prevSelected, permissionId]
    );
  };

  const filteredPermissions = allPermissionsData?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Search Box */}
      <Input
        placeholder="Search permissions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        mb={4}
      />

      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <Checkbox
          size={"md"}
          fontSize={"sm"}
          isChecked={selectedPermissions?.length === allPermissionsData?.length}
          onChange={() => {
            let permissionIDs = allPermissionsData.map((item) => item.id);
            if (selectedPermissions.length === allPermissionsData.length) {
              setSelectedPermissions([]);
            } else {
              setSelectedPermissions(permissionIDs);
            }
          }}
        >
          <Text fontSize={"xs"} fontWeight={600}>
            All
          </Text>
        </Checkbox>
        {filteredPermissions?.map((item) => (
          <Checkbox
            size={"md"}
            fontSize={"sm"}
            key={item.id}
            isChecked={selectedPermissions.includes(item.id)}
            onChange={() => handleCheckboxChange(item.id)}
          >
            <Text fontSize={"xs"} fontWeight={600}>
              {item.name}
            </Text>
          </Checkbox>
        ))}
      </Grid>
    </Box>
  );
};

export default RolePermissions;
