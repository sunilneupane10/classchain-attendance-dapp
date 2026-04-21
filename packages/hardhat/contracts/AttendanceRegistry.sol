// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AttendanceRegistry {
    address public lecturer;
    uint256 public sessionCount;

    struct Session {
        uint256 id;
        string moduleName;
        string moduleCode;
        string teacherName;
        uint256 date;
        uint256 attendanceCount;
        bool exists;
    }

    struct AttendanceRecord {
        address studentAddress;
        string studentName;
        bool isPresent;
        string markedByTeacher;
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => Session) public sessions;
    mapping(uint256 => mapping(address => AttendanceRecord)) private attendanceRecords;
    mapping(uint256 => address[]) private attendees;

    event SessionCreated(
        uint256 indexed sessionId,
        string moduleName,
        string moduleCode,
        string teacherName,
        uint256 date
    );

    event AttendanceMarked(
        uint256 indexed sessionId,
        address indexed student,
        string studentName,
        bool isPresent,
        string markedByTeacher
    );

    event AttendanceUpdated(
        uint256 indexed sessionId,
        address indexed student,
        string studentName,
        bool isPresent,
        string markedByTeacher
    );

    constructor(address _owner) {
        lecturer = _owner;
    }

    function createSession(
        string memory _moduleName,
        string memory _moduleCode,
        string memory _teacherName,
        uint256 _date
    ) public {
        sessionCount++;

        sessions[sessionCount] = Session({
            id: sessionCount,
            moduleName: _moduleName,
            moduleCode: _moduleCode,
            teacherName: _teacherName,
            date: _date,
            attendanceCount: 0,
            exists: true
        });

        emit SessionCreated(sessionCount, _moduleName, _moduleCode, _teacherName, _date);
    }

    function markAttendance(
        uint256 _sessionId,
        string memory _studentName,
        bool _isPresent
    ) public {
        require(sessions[_sessionId].exists, "Session does not exist");

        if (!attendanceRecords[_sessionId][msg.sender].exists) {
            attendanceRecords[_sessionId][msg.sender] = AttendanceRecord({
                studentAddress: msg.sender,
                studentName: _studentName,
                isPresent: _isPresent,
                markedByTeacher: sessions[_sessionId].teacherName,
                timestamp: block.timestamp,
                exists: true
            });

            sessions[_sessionId].attendanceCount++;
            attendees[_sessionId].push(msg.sender);

            emit AttendanceMarked(
                _sessionId,
                msg.sender,
                _studentName,
                _isPresent,
                sessions[_sessionId].teacherName
            );
        } else {
            AttendanceRecord storage existingRecord = attendanceRecords[_sessionId][msg.sender];
            existingRecord.studentName = _studentName;
            existingRecord.isPresent = _isPresent;
            existingRecord.markedByTeacher = sessions[_sessionId].teacherName;
            existingRecord.timestamp = block.timestamp;

            emit AttendanceUpdated(
                _sessionId,
                msg.sender,
                _studentName,
                _isPresent,
                sessions[_sessionId].teacherName
            );
        }
    }

    function getSession(uint256 _sessionId)
        public
        view
        returns (
            uint256 id,
            string memory moduleName,
            string memory moduleCode,
            string memory teacherName,
            uint256 date,
            uint256 attendanceCount,
            bool exists
        )
    {
        Session memory s = sessions[_sessionId];
        return (
            s.id,
            s.moduleName,
            s.moduleCode,
            s.teacherName,
            s.date,
            s.attendanceCount,
            s.exists
        );
    }

    function getAttendance(uint256 _sessionId, address _student)
        public
        view
        returns (
            address studentAddress,
            string memory studentName,
            bool isPresent,
            string memory markedByTeacher,
            uint256 timestamp,
            bool exists
        )
    {
        AttendanceRecord memory a = attendanceRecords[_sessionId][_student];
        return (
            a.studentAddress,
            a.studentName,
            a.isPresent,
            a.markedByTeacher,
            a.timestamp,
            a.exists
        );
    }

    function getAttendees(uint256 _sessionId) public view returns (address[] memory) {
        return attendees[_sessionId];
    }

    function getAllAttendance(uint256 _sessionId)
        public
        view
        returns (
            address[] memory studentAddresses,
            string[] memory studentNames,
            bool[] memory statuses,
            string[] memory markedByTeachers,
            uint256[] memory timestamps
        )
    {
        address[] memory sessionAttendees = attendees[_sessionId];
        uint256 length = sessionAttendees.length;

        studentAddresses = new address[](length);
        studentNames = new string[](length);
        statuses = new bool[](length);
        markedByTeachers = new string[](length);
        timestamps = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            AttendanceRecord memory record = attendanceRecords[_sessionId][sessionAttendees[i]];
            studentAddresses[i] = record.studentAddress;
            studentNames[i] = record.studentName;
            statuses[i] = record.isPresent;
            markedByTeachers[i] = record.markedByTeacher;
            timestamps[i] = record.timestamp;
        }

        return (studentAddresses, studentNames, statuses, markedByTeachers, timestamps);
    }
}