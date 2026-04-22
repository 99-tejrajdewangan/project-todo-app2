require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const todoRoutes = require("./routes/todos");

connectDB();
const app = express();

// ORDER MATTERS: CORS, then JSON parser, then cookie parser
app.use(
  cors({
    origin: "https://tejprojecttodo.vercel.app/",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
); // 🛡️ Enhanced CORS for project creation
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/api/debug", (req, res) => {
  console.log("Debug body:", req.body);
  res.json({ received: req.body });
});

// Test endpoint that mimics project creation
app.post("/api/test-project", (req, res) => {
  console.log("📦 Test project body:", req.body);
  res.json({ success: true, received: req.body });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/todos", todoRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));