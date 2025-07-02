import { Box } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import React, { useEffect, Suspense } from "react";
import { getToken, messaging } from "./Controllers/firebase.config";
import { UPDATE } from "./Controllers/ApiControllers";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import admin from "./Controllers/admin";
import "/src/App.css";
import Loading from "./Components/Loading";
import ErrorBoundary from "./ErrorBoundary";
import moment from "moment";
const Dashboard = React.lazy(() => import("./Global/Dashboard"));
const Topbar = React.lazy(() => import("./Global/Topbar"));
const Login = React.lazy(() => import("./Pages/Login"));
const Sidebar = React.lazy(() => import("./Global/Sidebar"));
const QueueList = React.lazy(() => import("./Pages/Checkin/Queue"));
const updateUser = async (fcmid) => {
  await UPDATE(admin.token, "update_user", { id: admin.id, web_fcm: fcmid });
  localStorage.setItem("webfcm", fcmid);
};
function hasExpiredUser(timestamp) {
  const currentTime = moment().valueOf();
  return currentTime > timestamp;
}
export default function App() {
  const location = useLocation();
  const requestPermission = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        console.error("Service workers are not supported in this browser.");
        return;
      }
      if (!("Notification" in window)) {
        console.error("This browser does not support notifications.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_FCM_PUBLIC_KEY,
        });
        //console.log(token);
        if (admin) {
          updateUser(token);
        }
      } else {
        console.error("Notification permission denied.");
      }
    } catch (error) {
      console.error("An error occurred while requesting permission:", error);
    }
  };
  useEffect(() => {
    admin && requestPermission();
  }, []);
  useEffect(() => {
    if (admin) {
      if (hasExpiredUser(admin.exp)) {
        localStorage.removeItem("admin");
        window.location.reload();
      }
    }
  }, []);
  return (
    <ErrorBoundary>
      {" "}
      <Suspense fallback={<Loading />}>
        {" "}
        {location.pathname === "/queue" ? (
          <QueueList />
        ) : admin ? (
          <Box display={"flex"} width={"100%"}>
            {" "}
            <Box>
              {" "}
              <Sidebar />{" "}
            </Box>{" "}
            <Box
              maxH={"100vh"}
              overflow={"scroll"}
              w={"100vw"}
              overflowX={"hidden"}
            >
              {" "}
              <Topbar /> <Dashboard />{" "}
            </Box>{" "}
          </Box>
        ) : (
          <Login />
        )}{" "}
        <ReactQueryDevtools initialIsOpen={false} />{" "}
      </Suspense>{" "}
    </ErrorBoundary>
  );
}
