import React from "react";

const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 ${className}`}
  >
    {children}
  </button>
);

export default Button;
