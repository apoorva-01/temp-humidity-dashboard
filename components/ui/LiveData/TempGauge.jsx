import ReactGauge from "react-gauge-capacity";
import React from "react";
let contWidth = 360;
let contHeight = 150;
let gaugeRadius = 60;
let centerLineHeight = 180;


export default function TempGauge(props) {
  let options = {
    isInnerNumbers: false,
    aperture: 180,
    radius: gaugeRadius,
    tickOffset: 20,
    arcStrokeWidth: 20,
    miniTickLength: 1,
    miniTickStrokeWidth: 1,
    tickLabelOffset: 12,
    scaleDivisionNumber: 5,
    centralCircleRadius:  10,
    marks: [
      "18°C",
      "20°C",
      "22°C",
      "24°C",
      "26°C",
      "28°C",
    ],
    contentWidth: contWidth,
    svgContainerWidth: contWidth,
    svgContainerHeight: contHeight,
    arrowValue: (props.value - 18) / (28 - 18),
    arrowColor: "#354357",
    gaugeCenterLineHeight: centerLineHeight,
    viewBox: "30 40 300 150",
    ranges: [
      {
        start: 0,
        end: 36 / 180,
        color: "#FF0000",
      },
  
      {
        start: 36 / 180,
        end: 144 / 180,
        color: "#37b400",
      },
      {
        start:144 / 180,
        end: 180 / 180,
        color: "#FF0000",
      },
    ],
  };
  
  return (
    <>
      <ReactGauge {...options} />
    </>
  );
}
