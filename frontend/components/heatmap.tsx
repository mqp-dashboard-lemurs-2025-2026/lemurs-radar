"use client";
import { useEffect, useRef } from "react";

import CalHeatmap from "cal-heatmap";
import "cal-heatmap/cal-heatmap.css";
import "@/app/css/global.css";
import Tooltip from "cal-heatmap/plugins/Tooltip";

interface CalendarHeatmapProps {
  userId: number;
  userStart: string | Date;
}

export default function CalendarHeatmap({ userId, userStart }: CalendarHeatmapProps) {
    const containerRef = useRef<HTMLDivElement>(null);   
    const cal = useRef<any>(null);  

  useEffect(() => {
    
    // Do not paint until the DOM node is ready.
    if (!containerRef.current) {
      return;
    }

    if (!cal.current) {
      // CalHeatmap manages its own DOM, so keep one instance in a ref.
      cal.current = new CalHeatmap();
    }

    async function loadData() {
      try {
        const response = await fetch(
          `/api/survey-timestamps/${userId}`
        );
        const timestamps = await response.json();

        // Normalize userStart to a Date
        const startDate =
          userStart instanceof Date ? userStart : new Date(userStart);

        // 4 weeks after userStart
        const fourWeeksAfter = new Date(startDate);
        fourWeeksAfter.setDate(fourWeeksAfter.getDate() + 28);

        cal.current.paint(
          {
            itemSelector: containerRef.current ?? "#heatmap",
            domain: { type: "month", gutter: 4 },
            subDomain: { type: "day", radius: 2 },
            range: fourWeeksAfter.getMonth() - startDate.getMonth() + 1,

            data: {
              source: timestamps,
              x: "date",
              y: "value",
            },

            date: {
              start: startDate,
              highlight: [startDate, fourWeeksAfter],
            },

            scale: {
              color: {
                range: ["#c3edff", "#579cac", "#1c5f6e"],
                type: "quantize",
                domain: [1, 3],
              },
            },
          },
          [
            [
              Tooltip,
              {
                text: (timestamp: Date, value: number | null, dayjsDate: any) => {
                  const dateStr = dayjsDate.format("YYYY-MM-DD");

                  if (value == null) {
                    return `No surveys on ${dateStr}`;
                  }

                  return `${value} survey${value === 1 ? "" : "s"} on ${dateStr}`;
                },
              },
            ],
          ],
        );


      
        // CalHeatmap auto legend is not flexible enough, so we build a custom one here
        const legendContainer = document.getElementById("heatmap-legend");
        if (legendContainer) {
          legendContainer.innerHTML = ""; // clear old legend
          const legendValues = [1, 2, 3, "Start/End"];
          const legendColors = ["#c3edff", "#579cac", "#1c5f6e", "gold"];

          const legendWrapper = document.createElement("div");
          legendWrapper.style.display = "flex";
          legendWrapper.style.flexWrap = "wrap";
          legendWrapper.style.gap = "10px";

          legendValues.forEach((value, idx) => {
            const item = document.createElement("div");
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.gap = "5px";
            item.style.fontSize = "0.5rem";

            const colorBox = document.createElement("div");
            colorBox.style.width = "5px";
            colorBox.style.height = "5px";
            colorBox.style.backgroundColor = legendColors[idx];
            colorBox.style.border = "1px solid #000"; // optional border

            const label = document.createElement("span");
            label.innerText = value.toString();

            item.appendChild(colorBox);
            item.appendChild(label);
            legendWrapper.appendChild(item);
          });

          legendContainer.appendChild(legendWrapper);
        }

      } catch (err) {
        console.error("Error loading heatmap data:", err);
      }
    }

    loadData();
  }, [userId, userStart]); // reload if user changes

  return <>
          <div id="heatmap" ref={containerRef} />
          <div id="heatmap-legend" aria-label="Heatmap legend" />
        </>;
}
