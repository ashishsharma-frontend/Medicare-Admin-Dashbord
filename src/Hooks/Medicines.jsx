import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const getData = async () => {
  const res = await GET(admin.token, `get_prescribe_medicines`);
  return res.data;
};

const useMedicineData = () => {
  const {
    isLoading: medicinesLoading,
    data: medicinesData,
    error: medicinesError,
  } = useQuery({
    queryKey: ["medicines"],
    queryFn: getData,
  });

  return { medicinesData, medicinesLoading, medicinesError };
};

export default useMedicineData;
