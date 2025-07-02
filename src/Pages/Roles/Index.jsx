import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Roles from "./Role";
import AssignedUsers from "./AssignedUsers";

function Index() {
  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>Roles</Tab>
          <Tab>Assigned users</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Box mt={5}>
              {" "}
              <Roles />
            </Box>
          </TabPanel>
          <TabPanel p={0}>
            <Box mt={5}>
              {" "}
              <AssignedUsers />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default Index;
