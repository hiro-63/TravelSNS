const db = require("../model");
const Mimic = db.mimics;
const Post = db.posts;
const User = db.users;
const authJwt = require("../middleware/authJwt");

module.exports = function (app) {
    // Mimic a Post (Save for later)
    app.post("/api/posts/:id/mimic", [authJwt.verifyToken], async (req, res) => {
        try {
            const postId = req.params.id;
            const userId = req.userId;
            const note = req.body.note; // Optional note

            // Check if already mimicked
            const existing = await Mimic.findOne({
                where: { postId: postId, userId: userId }
            });

            if (existing) {
                return res.status(400).send({ message: "Already mimicked this post." });
            }

            const mimic = await Mimic.create({
                userId: userId,
                postId: postId,
                notes: note
            });

            res.send({ message: "Post mimicked successfully!", mimic: mimic });
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    // Un-mimic a Post
    app.delete("/api/posts/:id/mimic", [authJwt.verifyToken], async (req, res) => {
        try {
            const postId = req.params.id;
            const userId = req.userId;

            const existing = await Mimic.findOne({
                where: { postId: postId, userId: userId }
            });

            if (!existing) {
                return res.status(404).send({ message: "Mimic record not found." });
            }

            await existing.destroy();
            res.send({ message: "Un-mimicked successfully." });
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    // Get My Mimics
    app.get("/api/users/me/mimics", [authJwt.verifyToken], async (req, res) => {
        try {
            const mimics = await Mimic.findAll({
                where: { userId: req.userId },
                include: [
                    {
                        model: Post,
                        as: "post",
                        include: ["user", "routePoints"] // Include basic post info
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.send(mimics);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });
};
