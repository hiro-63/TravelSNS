const jwt = require("jsonwebtoken");
const config = process.env;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        console.log("Auth Error: No token provided");
        return res.status(403).send({
            message: "No token provided!"
        });
    }

    // console.log("Verifying token:", token); // Security risk to log actual token in production, but okay for debugging

    if (!config.JWT_SECRET) {
        console.error("FATAL: JWT_SECRET is not defined in environment");
    }

    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Auth Error: Verification failed:", err.message);
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }
        req.userId = decoded.id;
        next();
    });
};

const authJwt = {
    verifyToken: verifyToken
};

module.exports = authJwt;
