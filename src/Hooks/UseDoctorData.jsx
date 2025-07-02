import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const fetchDoctorData = async () => {
  const res = await GET(admin.token, `get_doctor`);
  return res.data;
};

const useDoctorData = () => {
  const {
    isLoading: doctorsLoading,
    data: doctorsData,
    error: doctorsError,
  } = useQuery({
    queryKey: ["doctors" , "dashboard"],
    queryFn: fetchDoctorData,
  });

  return { doctorsData, doctorsLoading, doctorsError };
};

export default useDoctorData;
