import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AnnouncementsContext = createContext();

export const AnnouncementsProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("/announcements");
        setAnnouncements(res.data);
      } catch (error) {
        console.error("Fetch Announcements Error:", error.message);
      }
    };
    fetchAnnouncements();
  }, []);

  const addAnnouncement = async (formData) => {
    const res = await api.post("/announcements", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setAnnouncements((prev) => [res.data.announcement, ...prev]);
  };

  const deleteAnnouncement = async (id) => {
    await api.delete(`/announcements/${id}`);
    setAnnouncements((prev) => prev.filter((a) => a._id !== id));
  };

  return (
    <AnnouncementsContext.Provider
      value={{ announcements, addAnnouncement, deleteAnnouncement }}
    >
      {children}
    </AnnouncementsContext.Provider>
  );
};

export const useAnnouncements = () => useContext(AnnouncementsContext);