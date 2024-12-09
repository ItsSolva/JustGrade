"use client";

import React, { useState } from "react";

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    grade: string;
    feedback: string;
  } | null>(null);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [rubricFileName, setRubricFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a student's file.");
      return;
    }
    if (!rubricFile) {
      alert("Please upload an assignment/rubric file.");
      return;
    }

    const reader = new FileReader();
    const rubricReader = new FileReader();

    rubricReader.onload = async () => {
      const rubricContent = rubricReader.result as string;
      reader.onload = async () => {
        const fileContent = reader.result as string;
        setLoading(true);

        try {
          const response = await fetch("/api/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileContent, rubricContent }),
          });

          const data = await response.json();
          if (response.ok) {
            const [gradeLine, feedbackLine] = data.result
              .split("\n")
              .filter(Boolean);
            setAiResult({
              grade: gradeLine.replace("Grade:", "").trim(),
              feedback: feedbackLine.replace("Feedback:", "").trim(),
            });
          } else {
            alert("Error: " + data.error);
          }
        } catch (error) {
          alert("Failed to process the files.");
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    };
    rubricReader.readAsText(rubricFile);
  };

  return (
    <div className="container">
      {/* Navbar */}
      <div className="navbar">
        <h1 className="logo">JustGrade</h1>
      </div>

      <div className="buttons-container">
        {/* Upload Rubric Button */}
        <label
          htmlFor="rubric-input"
          className={`upload-btn ${rubricFile ? "file-selected" : ""}`}
        >
          {rubricFile ? "Rubric Selected" : "Assignment/Rubric"}
        </label>
        <input
          type="file"
          id="rubric-input"
          onChange={(e) => {
            if (e.target.files) {
              const selectedFile = e.target.files[0];
              setRubricFile(selectedFile);
              setRubricFileName(selectedFile.name);
            }
          }}
          className="file-input"
        />

        {/* File upload */}
        <label
          htmlFor="file-input"
          className={`upload-btn ${file ? "file-selected" : ""}`}
        >
          {file ? "File Selected" : "Select File"}
        </label>
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          className="file-input"
        />

        {/* Buttons */}
        <button onClick={handleSubmit} className="submit-btn">
          {loading ? "Processing..." : "Submit"}
        </button>
      </div>

      {/* AI Result */}
      {aiResult && (
        <div className="ai-result">
          <h2>Grading Results</h2>
          <p>
            <strong>Grade:</strong> {aiResult.grade}
          </p>
          <p>
            <strong>Feedback:</strong> {aiResult.feedback}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
