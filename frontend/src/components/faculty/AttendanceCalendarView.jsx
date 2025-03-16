import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isAfter,
  isBefore,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const apiUrl = import.meta.env.VITE_API_URL;

export function AttendanceCalendarView({
  attendanceHistory,
  onClose,
  onSelectDate,
  semesterStartDate,
  semesterEndDate,
  specialDates = [],
  sectionId,
  courseId,
  facultyId,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date();

  // Create a map of dates with attendance
  const attendanceDatesMap = new Map();
  attendanceHistory.forEach((record) => {
    attendanceDatesMap.set(record._id, {
      present: record.presentCount,
      absent: record.absentCount,
      total: record.count,
    });
  });

  // Fetch marked dates for the current month
  useEffect(() => {
    const fetchMarkedDates = async () => {
      if (!sectionId || !facultyId) return;

      const courseMapping = sectionId.courseFacultyMappings.find(
        (mapping) => mapping.facultyId === facultyId._id
      );
      if (!courseMapping) return;

      const courseId = courseMapping.courseId;
      setIsLoading(true);

      try {
        const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
        const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const response = await axios.get(
          `${apiUrl}/api/attendance/is-marked/${sectionId._id}/section/${courseId._id}/course/${facultyId._id}/faculty`, 
          config
        );

        const data = response.data.data;        
        
        const newMarkedDates = new Map();
        if (Array.isArray(data)) {
          data.forEach((dateString) => {
            // The API returns an array of date strings, so we use the dateString directly
            newMarkedDates.set(dateString, true);
          });
        }

        setMarkedDates(newMarkedDates);
      } catch (error) {
        console.error("Error fetching marked dates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkedDates();
  }, [currentMonth, sectionId, facultyId]);

  // Navigation functions
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Get days to display
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous and next month to fill the calendar grid
  const startDay = monthStart.getDay();
  const endDay = monthEnd.getDay();

  const prevMonthDays =
    startDay > 0
      ? eachDayOfInterval({
        start: new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - startDay),
        end: new Date(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate() - 1),
      })
      : [];

  const nextMonthDays =
    6 - endDay > 0
      ? eachDayOfInterval({
        start: new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + 1),
        end: new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + (6 - endDay)),
      })
      : [];

  // Handle day click
  const handleDayClick = (day) => {
    if (
      (semesterStartDate && day < parseISO(semesterStartDate)) ||
      (semesterEndDate && day > parseISO(semesterEndDate))
    ) {
      return;
    }

    setSelectedDate(day);
    onSelectDate(day);
  };

  const isDateDisabled = (date) => {
    if (semesterStartDate && date < parseISO(semesterStartDate)) return true;
    if (semesterEndDate && date > parseISO(semesterEndDate)) return true;
    return false;
  };

  const isSpecialDate = (date) => specialDates.some((specialDate) => isSameDay(date, parseISO(specialDate)));

  const hasAttendance = (date) => attendanceDatesMap.has(format(date, "yyyy-MM-dd"));

  const isDateMarked = (date) => markedDates.has(format(date, "yyyy-MM-dd"));
  
  const isPastDate = (date) => isBefore(date, today) && !isSameDay(date, today);

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="border shadow-lg bg-white mt-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mt-0">
        <div>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Attendance Calendar
          </CardTitle>
          <CardDescription>View attendance history by date</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
            className="flex items-center"
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <h2 className="text-lg font-semibold flex items-center">
            {format(currentMonth, "MMMM yyyy")}
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="flex items-center"
            disabled={isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday headers */}
          {weekdays.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {/* Previous month days */}
          {prevMonthDays.map((day) => (
            <div
              key={day.toString()}
              className="h-10 flex items-center justify-center text-sm text-gray-300"
            >
              {day.getDate()}
            </div>
          ))}

          {/* Current month days */}
          {daysInMonth.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isToday = isSameDay(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isDisabled = isDateDisabled(day);
            const isSpecial = isSpecialDate(day);
            const hasAttendanceRecord = hasAttendance(day);
            const isMarked = isDateMarked(day);
            const isPast = isPastDate(day);

            let dayClasses = "h-10 flex items-center justify-center text-sm rounded-full relative";

            if (isDisabled) {
              dayClasses += " text-gray-300 cursor-not-allowed";
            } else {
              dayClasses += " cursor-pointer hover:bg-gray-400 hover:text-white";

              if (isToday) {
                dayClasses += " bg-green-200 text-green-900 font-bold";
              }

              if (isSelected) {
                dayClasses += " bg-[#63144c] text-white";
              } else if (isMarked) {
                // If attendance is marked, make it completely green
                dayClasses += " bg-green-500 text-white font-bold";
              } else if (isSpecial) {
                dayClasses += " bg-blue-200 text-blue-900 font-semibold";
              } else if (hasAttendanceRecord) {
                dayClasses += " bg-green-500 text-white font-bold";
              } else if (isPast && !isMarked) {
                // If it's a past date and attendance is not marked, make it light yellow
                dayClasses += " bg-yellow-100 text-yellow-800";
              }
            }

            return (
              <div
                key={day.toString()}
                className={dayClasses}
                onClick={() => !isDisabled && handleDayClick(day)}
              >
                {day.getDate()}
              </div>
            );
          })}

          {/* Next month days */}
          {nextMonthDays.map((day) => (
            <div
              key={day.toString()}
              className="h-10 flex items-center justify-center text-sm text-gray-300"
            >
              {day.getDate()}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 text-sm">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>Attendance Marked</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-100"></div>
              <span>Past Date (No Attendance)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-200"></div>
              <span>Special Date</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-200"></div>
              <span>Today</span>
            </div>
          </div>

          <p className="mt-4 text-muted-foreground">Total days with attendance: {attendanceHistory.length}</p>
        </div>
      </CardContent>
    </Card>
  );
}