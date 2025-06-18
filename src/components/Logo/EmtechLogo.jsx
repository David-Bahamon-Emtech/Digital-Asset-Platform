import React from 'react';

// This component accepts 'logoUrl' and 'altText' as props
const EmtechLogo = ({ logoUrl, altText = "Company Logo" }) => {
  // If no logoUrl is provided, render nothing
  if (!logoUrl) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <img
        src={logoUrl} // Use the prop for the image source
        alt={altText} // Use the prop for alt text
        // Set width to 2/3 of container, height adjusts automatically
        className="w-2/3 h-auto"
      />
    </div>
  );
};

export default EmtechLogo;