/* eslint-disable react/prop-types */
import { Doughnut } from "react-chartjs-2";
import { Box, Text, useTheme } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const statusColors = {
  Pending: "#f6e05e", // yellow
  Confirmed: "#48bb78", // green
  Rejected: "#f56565", // red
  Cancelled: "red", // red
  Completed: "#3182ce", // blue
  Rescheduled: "#ed8936", // orange
  Visited: "#805ad5", // purple
  Unknown: "gray", // purple
};

const getStatusCounts = (appointments) => {
  const statusCounts = {
    Pending: 0,
    Confirmed: 0,
    Rejected: 0,
    Cancelled: 0,
    Completed: 0,
    Rescheduled: 0,
    Visited: 0,
    Unknown: 0,
  };

  appointments.forEach((appointment) => {
    const status = appointment.status || "Unknown";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return statusCounts;
};

function StatusPieChart({ appointments }) {
  const theme = useTheme();

  const statusCounts = getStatusCounts(appointments || []);
  const chartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map(
          (status) => statusColors[status] || theme.colors.gray[500]
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box p={4} borderRadius="md" maxW={"100%"}>
      <Text mb={4}>Appointment Status Distribution</Text>
      <Doughnut data={chartData} />
    </Box>
  );
}

export default StatusPieChart;
