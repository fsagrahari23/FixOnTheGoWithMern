const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    },
    attachments: [
        {
            type: String, // URL to the attachment
            contentType: String, // Type of attachment (image, document, etc.)
        },
    ],
});

const GeneralChatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    messages: [MessageSchema],
    lastActivity: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
GeneralChatSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model("GeneralChat", GeneralChatSchema);
