import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function AttendanceStatusIndicator({ existingAttendance, date }) {
  if (existingAttendance === null) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        Loading attendance status...
      </Badge>
    );
  }

  if (existingAttendance.length > 0) {
    // Count present and absent students
    const presentCount = existingAttendance.filter((record) => record.status === "Present").length;
    const absentCount = existingAttendance.filter((record) => record.status === "Absent").length;
    const total = existingAttendance.length;

    return (
      <div className="flex flex-col gap-1">
        <Badge className="bg-green-100 text-green-800">
          Attendance Recorded for {format(date, "MMM d, yyyy")}
        </Badge>
        <div className="text-xs flex gap-2">
          <span className="text-green-600">{presentCount} Present</span>
          <span className="text-red-600">{absentCount} Absent</span>
          <span className="text-gray-600">({Math.round((presentCount / total) * 100)}% attendance)</span>
        </div>
      </div>
    );
  }

  return (
    <Badge className="bg-yellow-100 text-yellow-800">
      No Attendance Recorded for {format(date, "MMM d, yyyy")}
    </Badge>
  );
}
