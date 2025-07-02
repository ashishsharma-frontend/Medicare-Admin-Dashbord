import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const fetchAppointments = async () => {
  const res = await GET(admin.token, `get_appointments`);
  return res.data;
};
const fetchAppointmentsByDoct = async () => {
  const res = await GET(admin.token, `get_appointments/doctor/${admin.id}`);
  return res.data;
};

const useAppointmentData = () => {
  const {
    isLoading: appointmentsLoading,
    data: appointmentsData,
    error: appointmentsError,
  } = useQuery({
    queryKey: ["dashboard-appointments"],
    queryFn:
      admin.role.name === "Doctor"
        ? fetchAppointmentsByDoct
        : fetchAppointments,
  });

  return { appointmentsData, appointmentsLoading, appointmentsError };
};

export default useAppointmentData;
