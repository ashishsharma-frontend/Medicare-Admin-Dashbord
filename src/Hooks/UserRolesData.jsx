import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const getData = async () => {
  const res = await GET(admin.token, `get_roles`);
  return res.data;
};

const useRolesData = () => {
  const {
    isLoading: rolesLoading,
    data: rolesData,
    error: rolesError,
  } = useQuery({
    queryKey: ["Roles"],
    queryFn: getData,
  });
  return { rolesData, rolesLoading, rolesError };
};

export default useRolesData;
