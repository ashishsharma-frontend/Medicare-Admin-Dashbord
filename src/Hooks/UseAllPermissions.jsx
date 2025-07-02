import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const fetchPermissions = async () => {
  const res = await GET(admin.token, `get_permisssion`);
  return res.data;
};

const useAllPermissions = () => {
  const {
    isLoading: allPermissionsLoading,
    data: allPermissionsData,
    error: allPermissionsError,
  } = useQuery({
    queryKey: ["all-permissions"],
    queryFn: fetchPermissions,
  });

  return { allPermissionsData, allPermissionsLoading, allPermissionsError };
};

export default useAllPermissions;
