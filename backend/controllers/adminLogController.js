const AdminLog = require("../models/AdminLog");

/**
 * @desc   Get all admin log entries. Expired "book" entries (older than
 *         48h) are already auto-deleted by MongoDB's TTL index, so this
 *         simply returns whatever currently exists in the collection.
 * @route  GET /api/admin-log
 */
const getLogEntries = async (req, res) => {
  try {
    const entries = await AdminLog.find().sort({ savedAt: -1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Get Log Entries Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

module.exports = { getLogEntries };