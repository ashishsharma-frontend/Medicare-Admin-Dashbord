/* eslint-disable react/prop-types */
import admin from "../../Controllers/admin";
import {
  FormControl,
  FormLabel,
  Skeleton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
} from "@chakra-ui/react";

import WysiwygEditor from "./Wsywig";
import { useQuery } from "@tanstack/react-query";
import { GET } from "../../Controllers/ApiControllers";
import Loading from "../../Components/Loading";

const getWebPages = async () => {
  const res = await GET(admin.token, `get_web_pages`);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};
function WebPages({ currentTab, activeTab }) {
  const { data, isLoading } = useQuery({
    queryFn: getWebPages,
    queryKey: ["web-pages"],
    enabled: currentTab == activeTab,
  });

  if (isLoading) return <Loading />;
  return (
    <Tabs>
      <TabList>
        {data?.map((item) => (
          <Tab key={item.id}>{item.title}</Tab>
        ))}
      </TabList>

      <TabPanels>
        {data?.map((item) => (
          <TabPanel key={item.id}>
            <WebPage page={item.page_id} name={item.title} />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

export default WebPages;

const WebPage = ({ page, name }) => {
  const getWebPage = async () => {
    const res = await GET(admin.token, `get_web_page/page/${page}`);
    if (res.response !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  };
  const { data, isLoading } = useQuery({
    queryFn: getWebPage,
    queryKey: ["web-page", page],
  });

  return (
    <Box>
      <FormControl isRequired>
        {" "}
        <FormLabel fontSize={24}>{name}</FormLabel>
        {isLoading || (data !== null && <WysiwygEditor value={data} />)}
        {isLoading && <Skeleton w={"full"} h={20} />}
      </FormControl>
    </Box>
  );
};
