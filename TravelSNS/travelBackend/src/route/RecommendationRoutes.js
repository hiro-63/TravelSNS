const db = require("../model");
const User = db.users;
const Profile = db.profile;
const Post = db.posts;
const { Op } = require("sequelize"); // Correctly destructure Op
const authJwt = require("../middleware/authJwt");

module.exports = function (app) {
    // Recommended Users
    app.get("/api/recommendations/users", [authJwt.verifyToken], async (req, res) => {
        try {
            const currentUserId = req.userId;

            const [users] = await db.sequelize.query(`
            SELECT 
                u.user_id AS userId,
                u.username,
                u.display_name AS displayName,
                p.avatar_url AS avatarUrl,
                p.bio AS bio
            FROM users u
            LEFT JOIN profile p ON u.user_id = p.user_id
            WHERE u.user_id != :currentUserId
              AND u.user_id NOT IN (
                  SELECT followed_id 
                  FROM user_follow 
                  WHERE follower_id = :currentUserId
              )
            ORDER BY RAND()
            LIMIT 5
        `, {
                replacements: { currentUserId },
            });

            res.send(users);
        } catch (err) {
            console.error("Error fetching recommended users:", err);
            res.status(500).send({ message: err.message });
        }
    });

    // Recommended Locations
    app.get("/api/recommendations/locations", [authJwt.verifyToken], async (req, res) => {
        try {
            const [locations] = await db.sequelize.query(`
            SELECT 
                rp.location_name AS locationName,
                COUNT(rp.id) AS postCount,
                MIN(pi.image_url) AS thumbnail
            FROM route_point rp
            JOIN post p ON rp.post_id = p.post_id
            LEFT JOIN post_image pi ON p.post_id = pi.post_id
            WHERE rp.location_name IS NOT NULL
            GROUP BY rp.location_name
            ORDER BY postCount DESC
            LIMIT 3
        `);

            res.send(locations);
        } catch (err) {
            console.error("Error fetching recommended locations:", err.original || err);
            res.status(500).send({
                message: err.message,
                error: err.original
            });
        }
    });
};
