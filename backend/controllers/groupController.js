const Group = require("../models/Group");

/**
 * @desc   Get all groups (for students to browse)
 * @route  GET /api/groups
 */
const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Get Groups Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Create a new group (Admin only)
 * @route  POST /api/groups
 */
const createGroup = async (req, res) => {
  try {
    const { groupName, centerName, days, grade, startDate, isNew, image, notes, timeSlots } = req.body;

    if (!groupName || !centerName || !days || !grade || !startDate || !timeSlots?.length) {
      return res.status(400).json({ message: "كل الحقول الأساسية مطلوبة" });
    }

    const newGroup = await Group.create({
      groupName,
      centerName,
      days,
      grade,
      startDate,
      isNew: isNew || false,
      image: image || "",
      notes: notes || "",
      timeSlots,
    });

    res.status(201).json({ message: "تم إضافة المجموعة بنجاح", group: newGroup });
  } catch (error) {
    console.error("Create Group Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Update an existing group (Admin only)
 * @route  PUT /api/groups/:id
 */
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "المجموعة غير موجودة" });
    }

    const updatedGroup = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "تم تعديل المجموعة بنجاح", group: updatedGroup });
  } catch (error) {
    console.error("Update Group Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

/**
 * @desc   Delete a group (Admin only)
 * @route  DELETE /api/groups/:id
 */
const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "المجموعة غير موجودة" });
    }

    await group.deleteOne();

    res.status(200).json({ message: "تم حذف المجموعة بنجاح" });
  } catch (error) {
    console.error("Delete Group Error:", error.message);
    res.status(500).json({ message: "حصل خطأ في السيرفر" });
  }
};

module.exports = { getAllGroups, createGroup, updateGroup, deleteGroup };