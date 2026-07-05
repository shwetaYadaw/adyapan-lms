/**
 * seedProduction.js
 * Run this once after deploying to seed the Atlas database.
 * Usage: MONGO_URI="mongodb+srv://..." node seedProduction.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");
const User     = require("./models/User");

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("Set MONGO_URI environment variable.");

    await mongoose.connect(uri);
    console.log("✅ Connected to Atlas");

    // ── Admin account ──────────────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL || "admin@adyapan.com";
    const adminPass  = process.env.ADMIN_PASS  || "Admin@123456";

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    } else {
      const hashed = await bcrypt.hash(adminPass, 12);
      await User.create({ name: "Adyapan Admin", email: adminEmail, password: hashed, role: "admin" });
      console.log(`✅ Admin created: ${adminEmail}`);
      console.log(`   Password: ${adminPass}`);
      console.log("   ⚠️  Change this password immediately after first login!");
    }

    // ── Seed courses ───────────────────────────────────────────────────────
    const { default: seedCourses } = await import("./seedCourses.js").catch(() => ({ default: null }));
    console.log("\n📚 Run 'node seedCourses.js' and 'node seedQuizzes.js' to add sample content.");

  } catch (err) {
    console.error("❌", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
