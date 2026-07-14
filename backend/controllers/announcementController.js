const Announcement = require("../models/Announcement");

const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    console.error("Get Announcements Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};


const createAnnouncement = async (req, res) => {
  try {
    const { type, title, message, pages } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "العنوان والنص مطلوبين" });
    }

    // pages بتوصل كـ JSON string من الـ FormData، لازم نحولها array حقيقي
    let parsedPages = [];
    try {
      parsedPages = pages ? JSON.parse(pages) : [];
    } catch (e) {
      parsedPages = [];
    }

    const announcement = await Announcement.create({
      type: type || "general",
      title: title.trim(),
      message: message.trim(),
      pages: Array.isArray(parsedPages) && parsedPages.length > 0 ? parsedPages : "all",
    });

    res.status(201).json({ message: "تم نشر الإعلان بنجاح", announcement });
  } catch (error) {
    console.error("Create Announcement Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};


const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "الإعلان غير موجود" });
    }

    await announcement.deleteOne();
    res.status(200).json({ message: "تم حذف الإعلان بنجاح" });
  } catch (error) {
    console.error("Delete Announcement Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

module.exports = { getAllAnnouncements, createAnnouncement, deleteAnnouncement };