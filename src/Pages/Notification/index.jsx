/* eslint-disable react/prop-types */
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useState } from "react";
import UserNotification from "./UserNotification";
import DoctorNotification from "./DoctorNotification";
import useHasPermission from "../../Hooks/HasPermission";
import NotAuth from "../../Components/NotAuth";
import admin from "../../Controllers/admin";
import AdminNotification from "./AdminNotifcation";

export default function Notification() {
  const [activeTab, setActiveTab] = useState(0);
  const { hasPermission } = useHasPermission();
  if (!hasPermission("NOTIFICATION_VIEW")) return <NotAuth />;
  return (
    <Box>
      <Tabs index={activeTab} onChange={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>User Notification</Tab>
          <Tab>Doctor Notification</Tab>
          {admin.role.name === "Admin" || admin.role.name === "admin" ? (
            <Tab>Admin Notification</Tab>
          ) : null}
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <UserNotification currentTab={0} activeTab={activeTab} />
          </TabPanel>
          <TabPanel px={0}>
            <DoctorNotification currentTab={1} activeTab={activeTab} />
          </TabPanel>

          {admin.role.name === "Admin" || admin.role.name === "admin" ? (
            <TabPanel>
              <AdminNotification currentTab={2} activeTab={activeTab} />
            </TabPanel>
          ) : null}

          <TabPanel>
            {/* <PaymentGetways currentTab={3} activeTab={activeTab} /> */}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
