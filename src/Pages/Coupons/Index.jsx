import { Box, Tab, TabList, Tabs, TabPanels, TabPanel } from "@chakra-ui/react";
import AllCoupons from "./AllCoupon";
import UsedCoupons from "./UsedCoupons";

function Coupons() {
  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>All Coupons</Tab>
          <Tab>Used Coupons</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <AllCoupons />
          </TabPanel>
          <TabPanel px={0}>
            <UsedCoupons />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default Coupons;
