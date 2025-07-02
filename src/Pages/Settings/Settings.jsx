/* eslint-disable react/prop-types */
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import SocialMedia from "./Social Media/SocialMedia";
import SettingsPage from "./SettingPage";
import PaymentGetways from "./PaymentGetways/Index";
import WebPages from "./WebPages";
import { useState } from "react";

export default function Settings() {
  const { hasPermission } = useHasPermission();
  const [activeTab, setActiveTab] = useState(0);
  if (!hasPermission("SETTING_VIEW")) return <NotAuth />;

  return (
    <Box>
      <Tabs index={activeTab} onChange={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>Settings</Tab>
          <Tab>Web pages</Tab>
          <Tab>Social Media</Tab>
          <Tab>Payment Getways</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <SettingsPage currentTab={0} activeTab={activeTab} />
          </TabPanel>
          <TabPanel px={0}>
            <WebPages currentTab={1} activeTab={activeTab} />
          </TabPanel>

          <TabPanel>
            <SocialMedia currentTab={2} activeTab={activeTab} />
          </TabPanel>

          <TabPanel>
            <PaymentGetways currentTab={3} activeTab={activeTab} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
