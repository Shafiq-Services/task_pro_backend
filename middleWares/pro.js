const jwt = require('jsonwebtoken');  // Import jsonwebtoken

module.exports.proMiddleWare = (req, res, next) => {
  // Extract token from Bearer token
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {

    return res.status(401).json({ message: "Token missing" });  // If no token, return error
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);


    req.userId = decodedToken.userId;  // Attach userId to request object
    next();  // Proceed to the next middleware or route handler
  } catch (error) {

    return res.status(401).json({ message: "Invalid or expired token" });  // If token is invalid or expired
  }
};
