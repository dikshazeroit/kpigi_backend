import React from "react";
import Chartist from "react-chartist";
import ChartistTooltip from "chartist-plugin-tooltips-updated";

// ===== Line Chart - Sales Value =====
export const SalesValueChart = () => {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [[1, 2, 2, 3, 3, 4, 3]]
  };

  const options = {
    low: 0,
    showArea: true,
    fullWidth: true,
    axisX: {
      position: 'end',
      showGrid: true
    },
    axisY: {
      showGrid: false,
      showLabel: false,
      labelInterpolationFnc: value => `$${value}k`
    }
  };

  const plugins = [ChartistTooltip()];

  return (
    <Chartist
      data={data}
      options={{ ...options, plugins }}
      type="Line"
      className="ct-series-g ct-double-octave"
    />
  );
};

// ===== Line Chart =====
export const SalesValueChartphone = () => {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    series: [[1, 2, 2, 3, 3, 4, 3]]
  };

  const options = {
    low: 0,
    showArea: true,
    fullWidth: false,
    axisX: {
      position: 'end',
      showGrid: true
    },
    axisY: {
      showGrid: false,
      showLabel: false,
      labelInterpolationFnc: value => `$${value}k`
    }
  };

  const plugins = [ChartistTooltip()];

  return (
    <Chartist
      data={data}
      options={{ ...options, plugins }}
      type="Line"
      className="ct-series-g ct-major-tenth"
    />
  );
};

// ===== Circle / Donut Chart =====
export const CircleChart = (props) => {
  const { series = [], donutWidth = 20 } = props;
  const sum = (a, b) => a + b;

  const options = {
    low: 0,
    high: 8,
    donutWidth,
    donut: true,
    donutSolid: true,
    fullWidth: false,
    showLabel: false,
    labelInterpolationFnc: value => `${Math.round((value / series.reduce(sum)) * 100)}%`
  };

  const plugins = [ChartistTooltip()];

  return (
    <Chartist
      data={{ series }}
      options={{ ...options, plugins }}
      type="Pie"
      className="ct-golden-section"
    />
  );
};

// ===== Bar Chart =====
export const BarChart = (props) => {
  const { labels = [], series = [], chartClassName = "ct-golden-section" } = props;
  const data = { labels, series };

  const options = {
    low: 0,
    showArea: true,
    axisX: { position: 'end' },
    axisY: { showGrid: false, showLabel: false, offset: 0 }
  };

  const plugins = [ChartistTooltip()];

  return (
    <Chartist
      data={data}
      options={{ ...options, plugins }}
      type="Bar"
      className={chartClassName}
    />
  );
};

// ===== Donut Chart with Labels =====
export const DonutChartWithLabels = ({ series = [], labels = [] }) => {
  const total = series.reduce((acc, val) => acc + val, 0);

  const options = {
    donut: true,
    donutWidth: 25,
    showLabel: true,
    labelDirection: 'explode',
    labelOffset: 30,
    chartPadding: 20,
    plugins: [ChartistTooltip()],
    labelInterpolationFnc: (value, idx) => {
      const percent = Math.round((series[idx] / total) * 100);
      return `${labels[idx]} (${percent}%)`;
    }
  };

  return (
    <Chartist
      data={{ series, labels }}
      options={options}
      type="Pie"
      className="ct-golden-section"
    />
  );
};

// ===== New: Stacked Bar Chart =====
export const StackedBarChart = ({ labels = [], series = [], chartClassName = "ct-golden-section" }) => {
  const data = { labels, series };

  const options = {
    stackBars: true,
    axisY: {
      offset: 20
    },
    plugins: [ChartistTooltip()]
  };

  return (
    <Chartist
      data={data}
      options={options}
      type="Bar"
      className={chartClassName}
    />
  );
};
