const db = require("../model");
const User = db.users;
const Profile = db.profile; // Note: check exact export name in model/index.js
const Post = db.posts;
const authJwt = require("../middleware/authJwt");

module.exports = function (app) {
    // Get Profile by Username
    app.get("/api/profiles/:username", async (req, res) => {
        try {
            const user = await User.findOne({
                where: { username: req.params.username },
                include: ["profile"]
            });

            if (!user) {
                return res.status(404).send({ message: "User not found." });
            }

            // user.profile might be null if not created yet, handle gracefully
            const profileData = user.profile || {};

            // Combine user and profile data for response
            const responseData = {
                username: user.username,
                displayName: profileData.displayName || user.username,
                bio: profileData.bio || "",
                avatarUrl: profileData.avatarUrl,
                bannerUrl: profileData.bannerUrl,
                ageGroup: profileData.ageGroup,
                userId: user.id
            };

            res.send(responseData);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    // Get User's Posts
    app.get("/api/profiles/:username/posts", async (req, res) => {
        try {
            const user = await User.findOne({
                where: { username: req.params.username }
            });

            if (!user) {
                return res.status(404).send({ message: "User not found." });
            }

            const posts = await Post.findAll({
                where: { userId: user.id },
                include: ["user"], // Include user to match Post component expectation
                order: [['createdAt', 'DESC']]
            });

            res.send(posts);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    // Update Own Profile
    app.put("/api/profiles/me", [authJwt.verifyToken], async (req, res) => {
        try {
            const user = await User.findByPk(req.userId, {
                include: ["profile"]
            });

            if (!user) {
                return res.status(404).send({ message: "User not found." });
            }

            let profile = user.profile;
            if (!profile) {
                // Create if doesn't exist
                profile = await Profile.create({ userId: user.id });
                // Reload user to get association? or just use new profile
            }

            // Update fields
            if (req.body.displayName) await profile.updateDisplayName(req.body.displayName);
            if (req.body.bio) await profile.updateBio(req.body.bio);
            if (req.body.avatarUrl) await profile.updateAvatarUrl(req.body.avatarUrl);
            if (req.body.bannerUrl) await profile.updateBannerUrl(req.body.bannerUrl);
            // ageGroup etc.

            res.send({ message: "Profile updated successfully." });
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });
};
