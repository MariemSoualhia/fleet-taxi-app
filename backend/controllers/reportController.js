const Report = require("../models/Report");
const User = require("../models/User");

// ➕ Create a report
exports.createReport = async (req, res) => {
  try {
    const user = req.user;

    let generatedByUserId = user.id;
    let superAdminId = null;
    let isSuperAdmin = false;

    if (user.role === "superAdmin") {
      // Si superAdmin, il est à la fois le créateur et le superAdmin
      superAdminId = user.id;
      isSuperAdmin = true;
    } else if (user.role === "admin") {
      // Si admin, il a un champ superAdmin
      if (!user.superAdmin) {
        return res
          .status(400)
          .json({ message: "Admin missing superAdmin reference." });
      }
      superAdminId = user.superAdmin;
      isSuperAdmin = false;
    } else {
      return res
        .status(403)
        .json({ message: "Only superAdmins and admins can generate reports." });
    }

    const report = await Report.create({
      ...req.body,
      generatedByUserId,
      superAdmin: superAdminId,
      isSuperAdmin,
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// 📖 GET /api/reports?type=trips&from=2024-07-01&to=2024-07-15
exports.getReports = async (req, res) => {
  try {
    const { type, from, to } = req.query;
    const user = req.user;

    if (user.role !== "superAdmin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only superAdmins can view this." });
    }

    const query = {
      superAdmin: user._id, // ✅ Ne voir que les rapports liés à ce super admin
    };

    if (type) {
      query.reportType = type;
    }

    if (from && to) {
      query.reportPeriodStart = { $gte: new Date(from) };
      query.reportPeriodEnd = { $lte: new Date(to) };
    }

    const reports = await Report.find(query).populate(
      "generatedByUserId",
      "name email role"
    );

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
