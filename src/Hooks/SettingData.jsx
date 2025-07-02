import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const getData = async () => {
  const res = await GET(admin.token, `get_configurations`);
  return res.data;
};

const useSettingsData = () => {
  const {
    isLoading: settingsLoading,
    data: settingsData,
    error: settingsError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getData,
  });

  return { settingsData, settingsLoading, settingsError };
};

export default useSettingsData;
