const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  done: {
    type: Boolean,
    default: false
  },
  owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true
}
});

TaskSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("Task", TaskSchema);