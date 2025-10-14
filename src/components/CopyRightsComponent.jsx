import React from "react";

function CopyrightFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="text-center py-4 bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 text-gray-600 text-sm">
      <span className="font-semibold  text-gray-900">
        Copyright &copy; {year}
      </span>{" "}
      Thaalam. All rights reserved.
    </footer>
  );
}

export default CopyrightFooter;
