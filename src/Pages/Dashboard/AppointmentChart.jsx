import { AiOutlineDown } from "react-icons/ai";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import moment from "moment";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const getTransparentColor = (color, alpha) => {
  // Convert the color to RGB format if needed
  const rgb = color
    .replace(/^#/, "")
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16));
  return `rgba(${rgb.join(", ")}, ${alpha})`;
};

const getAppointmentsForLast30Days = (appointments, lastDays) => {
  const now = moment();
  const past30Days = moment().subtract(lastDays, "days");

  const appointmentsPerDay = {};

  appointments.forEach((appointment) => {
    const appointmentDate = moment(appointment.date);

    if (appointmentDate.isBetween(past30Days, now, null, "[]")) {
      const day = appointmentDate.format("YYYY-MM-DD");
      if (!appointmentsPerDay[day]) {
        appointmentsPerDay[day] = 0;
      }
      appointmentsPerDay[day]++;
    }
  });

  // Generate a list of dates for the last 30 days
  const dateRange = [];
  let currentDate = past30Days.clone();
  while (currentDate.isBefore(now, "day")) {
    dateRange.push(currentDate.format("YYYY-MM-DD"));
    currentDate.add(1, "day");
  }

  // Fill in missing days with zero counts
  const data = dateRange.map((date) => ({
    date,
    count: appointmentsPerDay[date] || 0,
  }));

  return data;
};

function AppointmentChart({
  appointments,
  cancelledAppointments,
  compleatedAppointments,
}) {
  const [lastDays, setlastDays] = useState(15);
  const theme = useTheme();
  const data = getAppointmentsForLast30Days(appointments || [], lastDays);
  const cancelledData = getAppointmentsForLast30Days(
    cancelledAppointments || [],
    lastDays
  );
  const compleatedData = getAppointmentsForLast30Days(
    compleatedAppointments || [],
    lastDays
  );

  // Create an object to unify the dates of both datasets
  const allDates = new Set([
    ...data.map((d) => d.date),
    ...cancelledData.map((d) => d.date),
  ]);
  const sortedDates = Array.from(allDates).sort();

  // Create data points for both datasets
  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "All",
        data: sortedDates.map(
          (date) => data.find((d) => d.date === date)?.count || 0
        ),
        borderColor: theme.colors.blue[500],
        backgroundColor: getTransparentColor(theme.colors.blue[500], 5), // Transparent fill color
        borderWidth: 2,
        fill: "origin",
        tension: 0.2, // Curved lines
      },
      {
        label: "Cancelled",
        data: sortedDates.map(
          (date) => cancelledData.find((d) => d.date === date)?.count || 0
        ),
        borderColor: theme.colors.red[500],
        backgroundColor: getTransparentColor(theme.colors.red[500], 5), // Transparent fill color
        borderWidth: 2,
        fill: true,
        tension: 0.2, // Curved lines
      },
      {
        label: "Compleated",
        data: sortedDates.map(
          (date) => compleatedData.find((d) => d.date === date)?.count || 0
        ),
        borderColor: theme.colors.green[500],
        backgroundColor: getTransparentColor(theme.colors.green[500], 5), // Transparent fill color
        borderWidth: 2,
        fill: true,
        tension: 0.2, // Curved lines
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "nearest",
      axis: "xy",
      intersect: false,
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: lastDays > 179 ? "month" : lastDays > 89 ? "week" : "day",
        },
        border: {
          color: useColorModeValue(
            theme.colors.gray[600],
            theme.colors.gray[300]
          ), // Change y-axis line color
        },
        grid: {
          display: false,
        },
        ticks: {
          color: useColorModeValue(
            theme.colors.gray[600],
            theme.colors.gray[400]
          ),
        },
      },
      y: {
        border: {
          color: useColorModeValue(
            theme.colors.gray[600],
            theme.colors.gray[300]
          ), // Change y-axis line color
        },
        grid: {
          display: false,
        },
        ticks: {
          color: useColorModeValue(
            theme.colors.gray[600],
            theme.colors.gray[400]
          ),
        },
      },
    },
    onHover: (event, chartElement) => {
      if (chartElement.length) {
        event.native.target.style.cursor = "pointer";
      } else {
        event.native.target.style.cursor = "default";
      }
    },
  };

  return (
    <Box
      p={4}
      borderRadius="md"
      boxShadow="md"
      maxW={"100%"}
      bg={useColorModeValue("#fff", "gray.900")}
    >
      <Flex mb={5} justify={"space-between"} align={"center"}>
        {" "}
        <Text fontSize="lg" fontWeight="bold">
          Appointments in the Last {lastDays} Days
        </Text>
        <Menu>
          <MenuButton as={Button} rightIcon={<AiOutlineDown />} size={"sm"}>
            Last {lastDays} Days
          </MenuButton>
          <MenuList>
            {[15, 30, 90, 180, 365].map((item) => (
              <MenuItem
                bg={item === lastDays ? "gray.200" : "transparent"}
                key={item}
                onClick={() => {
                  setlastDays(item);
                }}
                fontSize={"sm"}
              >
                Last {item} Days
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Flex>

      <Line data={chartData} options={options} />
    </Box>
  );
}

export default AppointmentChart;
