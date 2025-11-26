// src/components/Charts.js
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

// ===== Sales Value Line Chart =====
export const SalesValueChart = ({ lineColor = "#0d6efd" }) => {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sales",
        data: [1, 2, 2, 3, 3, 4, 3],
        fill: true,
        tension: 0.3,
        borderColor: lineColor,
        backgroundColor: `${lineColor}33`,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, ticks: { callback: v => `$${v}k` }, beginAtZero: true },
    },
  };

  return <Line data={data} options={options} />;
};

// ===== Sales Value for Phone (smaller) =====
export const SalesValueChartPhone = (props) => <SalesValueChart lineColor={props.lineColor} />;

// ===== Circle / Donut Chart =====
export const CircleChart = ({ series = [], colors = ["#0d6efd", "#28a745", "#ffc107", "#dc3545"], donutWidth = 30 }) => {
  const total = series.reduce((a, b) => a + b, 0) || 1;
  const data = {
    labels: series.map((s, idx) => `${Math.round((s / total) * 100)}%`),
    datasets: [
      {
        data: series,
        backgroundColor: colors,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    cutout: `${donutWidth}%`,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}` } } },
    maintainAspectRatio: false,
  };

  return <Doughnut data={data} options={options} />;
};

// ===== Bar Chart =====
export const BarChart = ({ labels = [], series = [], colors = [] }) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Series",
        data: series,
        backgroundColor: colors.length ? colors : "#0d6efd",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { display: false }, beginAtZero: true } },
    maintainAspectRatio: false,
  };

  return <Bar data={data} options={options} />;
};

// ===== Sales vs Target Bar Chart (two-series) =====
export const SalesVsTargetChart = ({ labels = [], sales = [], target = [], salesColor = "#0d6efd", targetColor = "#ffc107" }) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Sales",
        data: sales,
        backgroundColor: salesColor,
      },
      {
        label: "Target",
        data: target,
        backgroundColor: targetColor,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
    scales: { x: { stacked: false }, y: { beginAtZero: true } },
    maintainAspectRatio: false,
  };

  return <Bar data={data} options={options} />;
};
