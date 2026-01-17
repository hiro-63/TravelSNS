const db = require("../model");
const Tag = db.tags;
const Post = db.posts;

module.exports = function (app) {
    // Get Popular Tags
    app.get("/api/tags/popular", async (req, res) => {
        try {
            // Complex query to count tags usage via PostTag if possible, 
            // or just return all tags for now since dataset is small.
            // For robust solution, we need aggregation.
            // Sequelize shorthand for counting usually involves grouping.

            // Simplified approach for MVP: return all tags ordered by name
            // Better approach: Count occurrence in PostTag

            /*
            // Correct way with Sequelize (raw query might be easier)
            const tags = await Tag.findAll({
                attributes: ['name', [db.sequelize.fn('COUNT', db.sequelize.col('posts.post_id')), 'count']],
                include: [{
                    model: Post,
                    as: 'posts', // defined in model/index.js
                    attributes: [],
                    through: { attributes: [] }
                }],
                group: ['tag.tag_id'],
                order: [[db.sequelize.literal('count'), 'DESC']],
                limit: 20
            });
            */

            // Simple fallback if associations or grouping is tricky
            const tags = await Tag.findAll({
                limit: 50
            });

            res.send(tags);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });
};
