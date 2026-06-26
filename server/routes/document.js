const express = require("express");
const multer = require("multer");
const router = express.Router();

const Document = require("../models/Document");
const User = require("../models/User");
const protect = require("../middleware/auth");
const { hasAccess } = require("../utils/access");
const { textToHtml, titleFromFilename } = require("../utils/importText");

router.use(protect);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB - plenty for plain text notes
  fileFilter: (req, file, cb) => {
    if (!/\.(txt|md)$/i.test(file.originalname)) {
      return cb(new Error("Only .txt and .md files are supported"));
    }
    cb(null, true);
  },
});

// Wrapping upload.single() like this (instead of passing it straight to the
// router) lets us turn multer's errors - wrong file type, file too big - into
// a normal JSON error response instead of Express's default HTML error page.
const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

router.post("/import", handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const document = await Document.create({
      title: titleFromFilename(req.file.originalname),
      owner: req.userId,
      content: textToHtml(req.file.buffer.toString("utf-8")),
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title } = req.body;

    const document = await Document.create({
      title: title || "Untitled Document",
      owner: req.userId,
      content: "",
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/mine", async (req, res) => {
  try {
    const ownedDocuments = await Document.find({ owner: req.userId }).sort({ updatedAt: -1 });
    const sharedDocuments = await Document.find({ sharedWith: req.userId }).sort({ updatedAt: -1 });

    res.json({ ownedDocuments, sharedDocuments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/single/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!hasAccess(document, req.userId)) {
      return res.status(403).json({ message: "You don't have access to this document" });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!hasAccess(document, req.userId)) {
      return res.status(403).json({ message: "You don't have access to this document" });
    }

    const { title, content } = req.body;

    document.title = title ?? document.title;
    document.content = content ?? document.content;

    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner?.toString() !== req.userId) {
      return res.status(403).json({ message: "Only the owner can delete this document" });
    }

    await document.deleteOne();

    res.json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/share/:id", async (req, res) => {
  try {
    const { email } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.owner?.toString() !== req.userId) {
      return res.status(403).json({ message: "Only the owner can share this document" });
    }

    const userToShareWith = await User.findOne({ email: email?.toLowerCase() });

    if (!userToShareWith) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    if (userToShareWith._id.toString() === req.userId) {
      return res.status(400).json({ message: "You already own this document" });
    }

    const alreadyShared = document.sharedWith.some(
      (id) => id.toString() === userToShareWith._id.toString()
    );

    if (!alreadyShared) {
      document.sharedWith.push(userToShareWith._id);
      await document.save();
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
