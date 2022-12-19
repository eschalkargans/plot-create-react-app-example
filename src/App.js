import * as Plot from "@observablehq/plot";
import * as d3 from "d3";
import "./App.css";
import { useEffect, useRef, useState } from "react";

function App() {
  // Change this boolean to switch between the example / customization
  const overrideWithCustomData = true;

  const headerRef = useRef();
  const [data, setData] = useState();

  const createDefaultChart = (data) => {
    return Plot.plot({
      style: {
        background: "transparent",
      },
      y: {
        grid: true,
      },
      x: {
        grid: true,
      },
      color: {
        type: "diverging",
        scheme: "burd",
      },
      marks: [
        Plot.ruleY([0]),
        Plot.ruleY([1.0]),
        Plot.dot(data, { x: "Date", y: "Anomaly", stroke: "Anomaly" }),
      ],
    });
  };

  const createCustomChart = (data) => {
    console.log(data);

    // We expect that all the entries are related to a month.
    // So we extract the year and month from any entry
    const year = data[0]["YEAR"];
    const month = data[0]["MONTH"];
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getDate();
    const dateScale = [...Array(daysInMonth).keys()]
      .map((x) => x + 1)
      .map((d) => new Date(Date.UTC(year, month - 1, d)));

    console.log(year, month, daysInMonth, dateScale);
    return Plot.plot({
      style: {
        background: "transparent",
      },
      y: {
        grid: true,
      },
      x: {
        grid: true,
        tickFormat: d3.utcFormat("%d"),
        domain: dateScale,
      },
      color: {
        type: "diverging",
        range: ["red", "blue"],
      },
      marks: [
        Plot.barY(data, {
          x: "date",
          y: "VALUE",
          fill: (d) => Math.sign(d.VALUE),
          title: (d) => d.VALUE,
        }),
        Plot.text(data, {
          x: "date",
          y: "VALUE",
          text: (d) => d.VALUE,
          dy: -5,
        }),
        Plot.ruleY([0]),
      ],
    });
  };

  useEffect(() => {
    overrideWithCustomData
      ? d3.json("/ExampleData.json").then((data) => {
          const refinedData = Object.values(data)
            .flatMap((x) => x)
            .map((x) => {
              return {
                ...x,
                // Plot defaults to UTC scale.
                // Decrement month, because JS expects a [0, 11] encoded month integer representation.
                date: new Date(Date.UTC(x.YEAR, x.MONTH - 1, x.DAY)),
              };
            });
          console.log(refinedData);
          setData(refinedData);
        })
      : d3.csv("/gistemp.csv", d3.autoType).then(setData);
  }, []);

  useEffect(() => {
    if (data === undefined) return;
    const chart = overrideWithCustomData
      ? createCustomChart(data)
      : createDefaultChart(data);
    headerRef.current.append(chart);

    return () => chart.remove(); // Seems to be a destruction method (side effect)
  }, [data]);

  return (
    <div className="App">
      <header className="App-header" ref={headerRef}>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
