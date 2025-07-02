import { useQuery } from "@tanstack/react-query";
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

// Function to fetch permissions
const fetchPermissions = async () => {
  const response = await GET(
    admin.token,
    `get_role_permisssion/role/${admin.role.role_id}`
  );
  return response.data;
};

// Custom hook to fetch permissions and check if a specific permission exists
const useHasPermission = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["permissions", admin.role.role_id],
    queryFn: fetchPermissions,
  });

  // Function to check if the user has a specific permission
  const hasPermission = (permissionName) => {
    if (admin.role.name === "Admin" || admin.role.name === "admin") {
      return true;
    } else {
      return data?.some(
        (permission) => permission.permission_name === permissionName
      );
    }
  };

  return { hasPermission, isLoading, error };
};

export default useHasPermission;
