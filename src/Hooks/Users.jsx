import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const getData = async () => {
  const res = await GET(admin.token, `get_users`);
  return res.data;
};

const useUserData = () => {
  const {
    isLoading: usersLoading,
    data: usersData,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getData,
  });

  return { usersData, usersLoading, usersError };
};

export default useUserData;
