import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AdminRecordsContext = createContext();

export const AdminRecordsProvider = ({ children }) => {
  const [centerGroups, setCenterGroups] = useState([]);
  const [bookItems, setBookItems] = useState([]);
  const [logEntries, setLogEntries] = useState([]);

  /* ---------------- Center Groups ---------------- */

  const fetchCenterGroups = async () => {
    try {
      const res = await api.get("/groups");
      setCenterGroups(res.data.map((g) => ({ ...g, students: [] })));
    } catch (error) {
      console.error("Fetch Groups Error:", error.message);
    }
  };

  const fetchGroupStudents = async (groupId) => {
    try {
      const res = await api.get(`/bookings/group/${groupId}`);
      const students = res.data.map((b) => ({
        id: b._id,
        name: b.student.fullName,
        code: b.student.studentCode,
        sessionDate: new Date(b.sessionDate).toISOString().split("T")[0],
        status: b.status,
      }));

      setCenterGroups((prev) =>
        prev.map((g) => (g._id === groupId ? { ...g, students } : g))
      );
    } catch (error) {
      console.error("Fetch Group Students Error:", error.message);
    }
  };

  const toggleCenterStudentStatus = async (groupId, bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}`);

      setCenterGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? {
                ...g,
                students: g.students.map((s) =>
                  s.id === bookingId
                    ? { ...s, status: s.status === "confirmed" ? "pending" : "confirmed" }
                    : s
                ),
              }
            : g
        )
      );
    } catch (error) {
      console.error("Toggle Booking Status Error:", error.message);
    }
  };

  const saveCenterGroupSnapshot = async (groupId) => {
    try {
      await api.post(`/bookings/group/${groupId}/save`);
    } catch (error) {
      console.error("Save Group Snapshot Error:", error.message);
      throw error;
    }
  };

  // ✅ دالة حذف طالب من المجموعة
  const removeStudentFromGroup = async (groupId, bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);

      setCenterGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? {
                ...g,
                students: g.students.filter((s) => s.id !== bookingId),
              }
            : g
        )
      );
    } catch (error) {
      console.error("Delete Booking Error:", error.message);
      throw error;
    }
  };

  /* ---------------- Book Items ---------------- */

  const fetchBookItems = async () => {
    try {
      const res = await api.get("/books");
      setBookItems(res.data.map((b) => ({ ...b, requests: [] })));
    } catch (error) {
      console.error("Fetch Books Error:", error.message);
    }
  };

  const fetchBookRequests = async (bookId) => {
    try {
      const res = await api.get(`/book-requests/book/${bookId}`);
      const requests = res.data.map((r) => ({
        id: r._id,
        name: r.student.fullName,
        code: r.student.studentCode,
        date: new Date(r.requestDate).toISOString().split("T")[0],
        status: r.status,
      }));

      setBookItems((prev) =>
        prev.map((b) => (b._id === bookId ? { ...b, requests } : b))
      );
    } catch (error) {
      console.error("Fetch Book Requests Error:", error.message);
    }
  };

  const toggleBookRequestStatus = async (bookId, requestId) => {
    try {
      await api.patch(`/book-requests/${requestId}`);

      setBookItems((prev) =>
        prev.map((b) =>
          b._id === bookId
            ? {
                ...b,
                requests: b.requests.map((r) =>
                  r.id === requestId
                    ? { ...r, status: r.status === "confirmed" ? "pending" : "confirmed" }
                    : r
                ),
              }
            : b
        )
      );
    } catch (error) {
      console.error("Toggle Request Status Error:", error.message);
    }
  };

  const saveBookRequestsAndClear = async (bookId) => {
    try {
      await api.post(`/book-requests/book/${bookId}/save`);

      setBookItems((prev) =>
        prev.map((b) => (b._id === bookId ? { ...b, requests: [] } : b))
      );
    } catch (error) {
      console.error("Save Book Requests Error:", error.message);
      throw error;
    }
  };

  /* ---------------- Log ---------------- */

  const fetchLogEntries = async () => {
    try {
      const res = await api.get("/admin-log");
      setLogEntries(res.data);
    } catch (error) {
      console.error("Fetch Log Entries Error:", error.message);
    }
  };

  // ✅ حساب عدد مرات التعليق لكل طالب
  const getVisibleLogEntries = () => {
    const globalSuspensionCount = {};

    logEntries.forEach(log => {
      log.entries.forEach(entry => {
        if (entry.status === "pending") {
          const key = entry.studentCode;
          globalSuspensionCount[key] = (globalSuspensionCount[key] || 0) + 1;
        }
      });
    });

    return logEntries.map(log => ({
      ...log,
      entries: log.entries.map(entry => ({
        ...entry,
        suspensionCount: globalSuspensionCount[entry.studentCode] || 0,
      })),
    }));
  };

  return (
    <AdminRecordsContext.Provider
      value={{
        centerGroups,
        bookItems,
        fetchCenterGroups,
        fetchGroupStudents,
        toggleCenterStudentStatus,
        saveCenterGroupSnapshot,
        removeStudentFromGroup, // ✅
        fetchBookItems,
        fetchBookRequests,
        toggleBookRequestStatus,
        saveBookRequestsAndClear,
        fetchLogEntries,
        getVisibleLogEntries,
      }}
    >
      {children}
    </AdminRecordsContext.Provider>
  );
};

export const useAdminRecords = () => useContext(AdminRecordsContext);