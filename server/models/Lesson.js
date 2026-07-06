const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Module / Section grouping
    module: {
      type: String,
      default: "General",
      trim: true,
    },
    moduleOrder: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",  // e.g. "12:30"
    },
    order: {
      type: Number,
      default: 1,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
