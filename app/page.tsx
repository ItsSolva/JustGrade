"use client";
import React, { useState } from "react";

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name); // Store the file name
      setFileContent(null); // Reset file content when a new file is selected
    }
  };

  // Handle file submission and display the content
  const handleSubmit = () => {
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(reader.result as string); // Update state with file content
    };
    reader.readAsText(file);
  };

  return (
    <div className="container">
      {/* Navbar */}
      <div className="navbar">
        <h1 className="logo">JustGrade</h1>
      </div>

      {/* File upload input */}
      <div className="buttons-container">
        <label htmlFor="file-input" className="upload-btn">
          Select File
        </label>
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          className="file-input"
        />

        {/* Display selected file name */}

        {/* Buttons container */}
        {/* Submit button */}
        <button onClick={handleSubmit} className="submit-btn">
          Submit
        </button>
      </div>
        {fileName && <p className="file-name">Selected file: {fileName}</p>}

      {/* Display file content */}
      {fileContent && (
        <div className="file-content">
          <h2>File Contents:</h2>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
