"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function Home() {
  const { address } = useAccount();

  const [moduleName, setModuleName] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [sessionDate, setSessionDate] = useState("");

  const [sessionId, setSessionId] = useState("1");
  const [studentName, setStudentName] = useState("");
  const [isPresent, setIsPresent] = useState(true);

  const { writeContractAsync } = useScaffoldWriteContract("AttendanceRegistry");

  const { data: sessionCount } = useScaffoldReadContract({
    contractName: "AttendanceRegistry",
    functionName: "sessionCount",
  });

  const parsedSessionId = BigInt(sessionId || "1");
  const connectedAddress = address ?? "0x0000000000000000000000000000000000000000";

  const { data: sessionData } = useScaffoldReadContract({
    contractName: "AttendanceRegistry",
    functionName: "getSession",
    args: [parsedSessionId],
  });

  const { data: attendanceData } = useScaffoldReadContract({
    contractName: "AttendanceRegistry",
    functionName: "getAttendance",
    args: [parsedSessionId, connectedAddress],
  });

  const handleCreateSession = async () => {
    if (!moduleName || !moduleCode || !teacherName || !sessionDate) {
      alert("Please complete all session fields");
      return;
    }

    try {
      const unixDate = Math.floor(new Date(sessionDate).getTime() / 1000);

      await writeContractAsync({
        functionName: "createSession",
        args: [moduleName, moduleCode, teacherName, BigInt(unixDate)],
      });

      alert("Session created successfully");
      setModuleName("");
      setModuleCode("");
      setTeacherName("");
      setSessionDate("");
    } catch (error) {
      console.error(error);
      alert("Unable to create session");
    }
  };

  const handleMarkAttendance = async () => {
    if (!studentName) {
      alert("Please enter the student name");
      return;
    }

    try {
      await writeContractAsync({
        functionName: "markAttendance",
        args: [parsedSessionId, studentName, isPresent],
      });

      alert("Attendance submitted successfully");
      setStudentName("");
    } catch (error) {
      console.error(error);
      alert("Unable to submit attendance");
    }
  };

  return (
    <main className="min-h-screen bg-base-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">ClassChain Attendance Management System</h1>
          <p className="text-base text-gray-500">A blockchain-based system for recording classroom attendance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-base-100 shadow-md rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Create Teaching Session</h2>

            <input
              type="text"
              placeholder="Module Name"
              value={moduleName}
              onChange={e => setModuleName(e.target.value)}
              className="input input-bordered w-full mb-3"
            />

            <input
              type="text"
              placeholder="Module Code"
              value={moduleCode}
              onChange={e => setModuleCode(e.target.value)}
              className="input input-bordered w-full mb-3"
            />

            <input
              type="text"
              placeholder="Teacher Name"
              value={teacherName}
              onChange={e => setTeacherName(e.target.value)}
              className="input input-bordered w-full mb-3"
            />

            <input
              type="date"
              value={sessionDate}
              onChange={e => setSessionDate(e.target.value)}
              className="input input-bordered w-full mb-4"
            />

            <button onClick={handleCreateSession} className="btn btn-primary w-full">
              Create Session
            </button>
          </div>

          <div className="bg-base-100 shadow-md rounded-2xl p-6">
            <h2 className="text-2xl font-semibold mb-4">Submit Attendance for Selected Session</h2>

            <input
              type="number"
              placeholder="Session ID"
              value={sessionId}
              onChange={e => setSessionId(e.target.value)}
              className="input input-bordered w-full mb-4"
            />

            <div className="bg-base-200 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">Selected Session Details</h3>

              {sessionData && sessionData[6] ? (
                <div className="space-y-2">
                  <p>
                    <strong>Module Name:</strong> {sessionData[1]}
                  </p>
                  <p>
                    <strong>Module Code:</strong> {sessionData[2]}
                  </p>
                  <p>
                    <strong>Teacher Name:</strong> {sessionData[3]}
                  </p>
                  <p>
                    <strong>Session Date:</strong> {new Date(Number(sessionData[4]) * 1000).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No session found for this Session ID.</p>
              )}
            </div>

            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className="input input-bordered w-full mb-3"
            />

            <select
              value={isPresent ? "present" : "absent"}
              onChange={e => setIsPresent(e.target.value === "present")}
              className="select select-bordered w-full mb-4"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>

            <button onClick={handleMarkAttendance} className="btn btn-secondary w-full">
              Submit Attendance
            </button>
          </div>
        </div>

        <div className="bg-base-100 shadow-md rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Session Summary</h2>

          <p className="mb-2">
            <strong>Total Sessions Created:</strong> {sessionCount ? sessionCount.toString() : "0"}
          </p>

          {sessionData && sessionData[6] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <p>
                <strong>Session ID:</strong> {sessionData[0].toString()}
              </p>
              <p>
                <strong>Module Name:</strong> {sessionData[1]}
              </p>
              <p>
                <strong>Module Code:</strong> {sessionData[2]}
              </p>
              <p>
                <strong>Teacher Name:</strong> {sessionData[3]}
              </p>
              <p>
                <strong>Session Date:</strong> {new Date(Number(sessionData[4]) * 1000).toLocaleDateString()}
              </p>
              <p>
                <strong>Total Attendance Records:</strong> {sessionData[5].toString()}
              </p>
            </div>
          )}
        </div>

        <div className="bg-base-100 shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Attendance Record</h2>

          {attendanceData && attendanceData[5] ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <p>
                <strong>Wallet Address:</strong> {attendanceData[0]}
              </p>
              <p>
                <strong>Student Name:</strong> {attendanceData[1]}
              </p>
              <p>
                <strong>Attendance Status:</strong> {attendanceData[2] ? "Present" : "Absent"}
              </p>
              <p>
                <strong>Marked By:</strong> {attendanceData[3]}
              </p>
              <p className="md:col-span-2">
                <strong>Recorded At:</strong> {new Date(Number(attendanceData[4]) * 1000).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No attendance record found for the selected session and wallet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
