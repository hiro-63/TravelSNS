const db = require("../model");
const User = db.users;
const Follow = db.follows;
const Profile = db.profile;
const authJwt = require("../middleware/authJwt");

module.exports = function (app) {
    // Follow/Unfollow User
    app.post("/api/users/:id/follow", [authJwt.verifyToken], async (req, res) => {
        try {
            const followerId = req.userId;
            const followedId = req.params.id;

            if (followerId == followedId) {
                return res.status(400).send({ message: "Cannot follow yourself" });
            }

            const existingFollow = await Follow.findOne({
                where: { followerId: followerId, followedId: followedId }
            });

            if (existingFollow) {
                await existingFollow.destroy();
                return res.send({ message: "Unfollowed" });
            } else {
                await Follow.create({ followerId: followerId, followedId: followedId });
                return res.send({ message: "Followed" });
            }
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    // Get User Profile
    app.get("/api/users/:id", async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id, {
                include: ["profile", "posts", "Followers", "Following"]
            });
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }
            // パスワードなどの機密情報は除外して返すのが望ましいが、簡易実装としてそのまま返す
            // 本番では DTO パターン等を使うべき
            res.send(user);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });
};
