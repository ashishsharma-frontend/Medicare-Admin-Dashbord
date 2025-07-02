import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const fetchPatientData = async () => {
  const res = await GET(admin.token, `get_patients`);
  return res.data;
};

const usePatientData = () => {
  const {
    isLoading: patientsLoading,
    data: patientsData,
    error: patientsError,
  } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatientData,
  });

  return { patientsData, patientsLoading, patientsError };
};

export default usePatientData;
