/* eslint-disable react/prop-types */
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-moment";
import moment from "moment";

Chart.register(...registerables);

const TransactionChart = ({ data }) => {
  // Aggregate the amounts by date
  const aggregatedData = data.reduce((acc, item) => {
    const date = moment(item.created_at).format("YYYY-MM-DD");
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += item.amount;
    return acc;
  }, {});

  // Prepare the data for the chart
  const dates = Object.keys(aggregatedData);
  const amounts = Object.values(aggregatedData);

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: "Transaction Amount",
        data: amounts,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "ll",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default TransactionChart;
