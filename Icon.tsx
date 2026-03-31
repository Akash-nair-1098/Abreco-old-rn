import React from 'react';
import { SvgXml } from 'react-native-svg';

interface IconProps {
  xml: any; // The raw SVG string from your file
  size?: number; // Diameter of the icon
  color?: string; // Fill/Stroke color
  strokeWidth?: number; // Adjust thickness
  fill?: string;
}

const Icon = ({
  xml,
  size = 24,
  color = 'white',
  strokeWidth,
  fill = 'none',
}: IconProps) => {
  
  // SAFETY CHECK: If xml is undefined or null, return null to prevent crash
  if (!xml) {
    console.warn("Icon Component: 'xml' prop is undefined or null.");
    return null; 
  }

  let processedXml = xml;

  // We only attempt to replace if xml is a string
  if (strokeWidth && typeof xml === 'string') {
    processedXml = xml.replace(
      /stroke-width=".*?"/g,
      `stroke-width="${strokeWidth}"`,
    );
  }

  return (
    <SvgXml
      xml={processedXml}
      width={size}
      height={size}
      color={color}
      fill={fill}
    />
  );
};

export default Icon;