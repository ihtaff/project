const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const router = express.Router();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");


dotenv.config();
 {/* () => {
    console.log("Connected to MongoDB");
  }*/}
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}

).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.log(err);
});
//conn.once
app.use("/images", express.static(path.join(__dirname, "public/images")));

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("common"));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }))
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/auth", authRoute);
app.use("/api/users",userRoute);
app.use("/api/posts", postRoute);
app.listen(8800, () => {
  console.log("Backend server is running!");
});
