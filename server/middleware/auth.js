import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = verified.id;
    req.user = { id: verified.id };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
