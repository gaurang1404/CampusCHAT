import { CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export function AttendanceStatusBanner({ existingAttendance, date }) {
  if (existingAttendance === null) {
    return null;
  }

  if (existingAttendance.length > 0) {
    // Count present and absent students
    const presentCount = existingAttendance.filter((record) => record.status === "Present").length;
    const absentCount = existingAttendance.filter((record) => record.status === "Absent").length;
    const total = existingAttendance.length;
    const attendancePercentage = Math.round((presentCount / total) * 100);

    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-md">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
          <div>
            <p className="font-medium text-green-800">Attendance Recorded for {format(date, "MMMM d, yyyy")}</p>
            <p className="text-sm text-green-700 mt-1">
              {presentCount} Present • {absentCount} Absent • {attendancePercentage}% Attendance Rate
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 rounded-md">
      <div className="flex items-center">
        <AlertCircle className="h-6 w-6 text-yellow-500 mr-3" />
        <div>
          <p className="font-medium text-yellow-800">No Attendance Recorded for {format(date, "MMMM d, yyyy")}</p>
          <p className="text-sm text-yellow-700 mt-1">
            All students are marked as absent by default. Update and save to record attendance.
          </p>
        </div>
      </div>
    </div>
  );
}
