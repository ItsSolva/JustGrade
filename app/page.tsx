"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver"; // For exporting CSV
import Papa from "papaparse"; // For CSV generation

interface StudentResult {
  fileName: string;
  fullName: string;
  studentId: string;
  grade: string;
  feedback: string;
}

const Home = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleRubricChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setRubricFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!rubricFile) {
      alert("Please upload a rubric file.");
      return;
    }
    if (files.length === 0) {
      alert("Please upload at least one student file.");
      return;
    }

    setLoading(true);
    const rubricContent = await readFileAsText(rubricFile);

    const newResults: StudentResult[] = [];
    for (const file of files) {
      try {
        const fileContent = await readFileAsText(file);
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

          // Extract full name and student ID from filename
          const { fullName, studentId } = parseFileName(file.name);

          newResults.push({
            fileName: file.name,
            fullName,
            studentId,
            grade: gradeLine.replace("Grade:", "").trim(),
            feedback: feedbackLine.replace("Feedback:", "").trim(),
          });
        } else {
          alert(`Error grading ${file.name}: ${data.error}`);
        }
      } catch (error) {
        alert(`Failed to process ${file.name}.`);
        console.error(error);
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const parseFileName = (fileName: string) => {
    const parts = fileName.split("_");
    if (parts.length >= 4) {
      const fullName = `${parts[1]} ${parts[2]}`; // Voornaam + Achternaam
      const studentId = parts[3].split(".")[0]; // Leerlingnummer (remove file extension)
      return { fullName, studentId };
    }
    return { fullName: "Unknown", studentId: "Unknown" };
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(results, {
      fields: ["fileName", "fullName", "studentId", "grade", "feedback"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "grading_results.csv");
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
          onChange={handleRubricChange}
          className="file-input"
        />

        {/* Upload Student Files */}
        <label
          htmlFor="file-input"
          className={`upload-btn ${files.length > 0 ? "file-selected" : ""}`}
        >
          {files.length > 0
            ? `${files.length} Files Selected`
            : "Select Student Files"}
        </label>
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          multiple
          className="file-input"
        />

        {/* Buttons */}
        <button onClick={handleSubmit} className="submit-btn" disabled={loading}>
          {loading ? "Grading..." : "Grade Assignments"}
        </button>
        {results.length > 0 && (
          <button onClick={handleExportCSV} className="export-btn">
            Export as CSV
          </button>
        )}
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="results-table">
          <h2>Grading Results</h2>
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Full Name</th>
                <th>Student ID</th>
                <th>Grade</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td>{result.fileName}</td>
                  <td>{result.fullName}</td>
                  <td>{result.studentId}</td>
                  <td>{result.grade}</td>
                  <td>{result.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Home;