// components/Alert.js
import React from 'react';

const Alert = ({ message, type }) => {
  if (!message) return null;

  const alertStyle = type === 'success' 
    ? 'bg-green-100 text-green-600' 
    : 'bg-red-100 text-red-600';

  return (
    <div className={`p-3 rounded-md mb-4 ${alertStyle}`}>
      {message}
    </div>
  );
};

export default Alert;
