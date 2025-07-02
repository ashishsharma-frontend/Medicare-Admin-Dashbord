/* eslint-disable react-hooks/rules-of-hooks */
import React, { Suspense, useEffect } from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Loading from "../Components/Loading";
import AllPrescription from "../Pages/Prescriptions/AllPrescription";
import useSettingsData from "../Hooks/SettingData";
import imageBaseURL from "../Controllers/image";
import admin from "../Controllers/admin";
import Notification from "../Pages/Notification";
import AppointmentStatusLog from "../Pages/Appointments/AppointmentLog";

const Department = React.lazy(() => import("../Pages/Department/Index"));
const Specialization = React.lazy(() =>
  import("../Pages/Spacialization/Index")
);
const Doctors = React.lazy(() => import("../Pages/Doctors/Index"));
const AddDoctor = React.lazy(() => import("../Pages/Doctors/Add"));
const UpdateDoctor = React.lazy(() => import("../Pages/Doctors/Update"));
const Roles = React.lazy(() => import("../Pages/Roles/Index"));
const Cities = React.lazy(() => import("../Pages/Cities/Index"));
const States = React.lazy(() => import("../Pages/States/Index"));
const Appointments = React.lazy(() => import("../Pages/Appointments"));
const Users = React.lazy(() => import("../Pages/Users/Index"));
const Patients = React.lazy(() => import("../Pages/Patients"));
const UpdatePatient = React.lazy(() => import("../Pages/Patients/Update"));
const MedicalRepresentative = React.lazy(() => import("../Pages/Medical-Representative/Index"));
const UpdateMedicalRepresentative = React.lazy(() => import("../Pages/Medical-Representative/Update"));

const UpdateAppointment = React.lazy(() =>
  import("../Pages/Appointments/Update")
);
const UpdatePrescription = React.lazy(() =>
  import("../Pages/Prescriptions/UpdatePrescription")
);
const AddPrescription = React.lazy(() =>
  import("../Pages/Prescriptions/AddPrescription")
);
const AddUser = React.lazy(() => import("../Pages/Users/AddUser"));
const UpdateUser = React.lazy(() => import("../Pages/Users/UpdateUser"));
const Medicines = React.lazy(() => import("../Pages/Medicines/Index"));
const Settings = React.lazy(() => import("../Pages/Settings/Settings"));
const Transactions = React.lazy(() => import("../Pages/Transaction/Index"));
const DashboardMain = React.lazy(() => import("../Pages/Dashboard/Dashboard"));
const FamilyMembers = React.lazy(() => import("../Pages/Family-Members/Index"));
const AppontmentCalender = React.lazy(() =>
  import("../Pages/Appointments/AppontmentCalender")
);
const Checkin = React.lazy(() => import("../Pages/Checkin/Index"));
const Coupons = React.lazy(() => import("../Pages/Coupons/Index"));
const Queue = React.lazy(() => import("../Pages/Checkin/Queue"));
const Files = React.lazy(() => import("../Pages/Files/Files"));
const Testimonials = React.lazy(() =>
  import("../Pages/Settings/Testimonials/Index")
);
const LoginScreen = React.lazy(() =>
  import("../Pages/Settings/LoginScreen/LoginScreen")
);
const ReviewsPage = React.lazy(() => import("../Pages/Reviews/index"));
const ContactUs = React.lazy(() => import("../Pages/Contact-us/Index"));

export default function Dashboard() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { settingsData } = useSettingsData();

  useEffect(() => {
    const faviconItem = settingsData?.find(
      (value) => value.id_name === "fav_icon"
    );
    const title = settingsData?.find(
      (value) => value.id_name === "clinic_name"
    );
    document.title = `${admin.role.name} - ${title?.value || ""}`;
    // Change the favicon
    const favicon =
      document.querySelector('link[rel="icon"]') ||
      document.createElement("link");
    favicon.type = "image/x-icon";
    favicon.rel = "icon";
    favicon.href = `${imageBaseURL}/${faviconItem?.value}`; // Replace with your favicon path
    document.getElementsByTagName("head")[0].appendChild(favicon);
  }, [settingsData]);

  return (
    <Box
      w={"100%"}
      p={5}
      pt={8}
      bg={
        currentPath === "/" || currentPath === "/dashboard"
          ? useColorModeValue("gray.100", "gray.800")
          : "initial"
      }
    >
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardMain />} />
          <Route path="/checkins" element={<Checkin />} />
          <Route path="/queue" element={<Queue />} />

          <Route path="/departments" element={<Department />} />
          <Route path="/specialization" element={<Specialization />} />

          {/* Users */}
          <Route path="/users" element={<Users />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/user/update/:id" element={<UpdateUser />} />
          {/* family */}
          <Route path="/family-members" element={<FamilyMembers />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/user/update/:id" element={<UpdateUser />} />

          {/* Patients */}
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/add" element={<Patients />} />
          <Route path="/patient/:id" element={<UpdatePatient />} />
          <Route path="/medical-representative" element={<MedicalRepresentative />} />
          <Route path="/medical-representative/add" element={<MedicalRepresentative />} />
          <Route path="/medical-representative/:id" element={<UpdateMedicalRepresentative />} />

          {/* Doctors */}
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/add" element={<AddDoctor />} />
          <Route path="/doctor/update/:id" element={<UpdateDoctor />} />
          <Route path="/doctor/:id" element={<UpdateDoctor />} />

          {/* Appointments */}
          <Route path="/appointments" element={<Appointments />} />
          <Route
            path="/appointments-calender"
            element={<AppontmentCalender />}
          />
          <Route
            path="/appointment-status-log"
            element={<AppointmentStatusLog />}
          />
          <Route path="/appointment/add" element={<Appointments />} />
          <Route path="/appointment/:id" element={<UpdateAppointment />} />

          {/* Prescription */}
          <Route path="prescriptions" element={<AllPrescription />} />
          <Route path="prescription/:id/*" element={<UpdatePrescription />} />
          <Route path="add-prescription/*" element={<AddPrescription />} />

          {/* Transactions */}
          <Route path="/transactions" element={<Transactions />} />

          {/* Misc */}
          <Route path="/patient-files" element={<Files />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/states" element={<States />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/doctor-reviews" element={<ReviewsPage />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/login-screen" element={<LoginScreen />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/contact-us-form" element={<ContactUs />} />
        </Routes>
      </Suspense>
    </Box>
  );
}
