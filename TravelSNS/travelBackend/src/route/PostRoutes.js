const db = require("../model");
const Post = db.posts;
const User = db.users;
const Comment = db.comments;
const Like = db.likes;
const RoutePoint = db.routePoints;
const TripData = db.tripData;
const Tag = db.tags;
const Profile = db.profile;
const authJwt = require("../middleware/authJwt");

module.exports = function (app) {
    // Create a new Post with enhanced data
    app.post("/api/posts", [authJwt.verifyToken], async (req, res) => {
        const fs = require('fs');
        const path = require('path');
        const logFile = path.join(__dirname, '../../app_debug.log');
        const log = (msg) => fs.appendFileSync(logFile, new Date().toISOString() + ' ' + msg + '\n');

        const transaction = await db.sequelize.transaction();
        try {
            log('Starting Post Creation');
            log('Request Body: ' + JSON.stringify(req.body));

            // 1. Create Base Post
            // imageUrl is removed from Post model
            const post = await Post.create({
                userId: req.userId,
                content: req.body.content,
                startLocation: req.body.startLocation,
                endLocation: req.body.endLocation,
                transportMode: req.body.transportMode,
                routeSummary: req.body.routeSummary,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
                locationName: req.body.locationName
            }, { transaction });
            log('Post Created: ' + post.id);

            // 2. Handle Images (PostImage)
            if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
                log('Processing Images: ' + req.body.images.length);
                const imagePromises = req.body.images.map(img => {
                    return db.postImages.create({
                        postId: post.id,
                        imageUrl: img.url,
                        description: img.description,
                        sortOrder: img.sortOrder || 0
                    }, { transaction });
                });
                await Promise.all(imagePromises);
            }

            // 3. Create Route Points
            if (req.body.routePoints && Array.isArray(req.body.routePoints) && req.body.routePoints.length > 0) {
                log('Processing RoutePoints: ' + req.body.routePoints.length);
                const routePointsData = req.body.routePoints.map((point, index) => ({
                    postId: post.id,
                    orderIndex: index, // index or explicit order field
                    lat: point.lat,
                    lon: point.lng || point.lon, // Handle both 'lng' (Google/Leaflet) and 'lon' (OSM/Yahoo)
                    locationName: point.name,
                    description: point.description,
                    transportToNext: point.transportToNext
                }));
                await RoutePoint.bulkCreate(routePointsData, { transaction });
            }

            // 4. Create Trip Data
            if (req.body.tripData) {
                log('Processing TripData');
                // Helper to ensure we always have an array of strings
                const toSafeArray = (val) => {
                    if (val === null || val === undefined) return [];
                    if (Array.isArray(val)) return val.map(String); // Ensure elements are strings
                    if (typeof val === 'string') {
                        return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    }
                    // Number or Object
                    return [String(val)];
                };

                const tripData = req.body.tripData;
                const accommodationNames = toSafeArray(tripData.accommodationNames);
                const transportMethods = toSafeArray(tripData.transportMethods);

                await TripData.create({
                    postId: post.id,
                    totalBudget: tripData.totalBudget,
                    budgetFood: tripData.budgetFood,
                    budgetAccommodation: tripData.budgetAccommodation,
                    budgetTransport: tripData.budgetTransport,
                    accommodationNames: JSON.stringify(accommodationNames),
                    transportMethods: JSON.stringify(transportMethods)
                }, { transaction });

            }

            // 5. Handle Tags
            if (req.body.tags && Array.isArray(req.body.tags) && req.body.tags.length > 0) {
                log('Processing Tags: ' + req.body.tags);
                for (const tagName of req.body.tags) {
                    const [tag] = await Tag.findOrCreate({
                        where: { name: tagName },
                        transaction
                    });
                    await post.addTag(tag, { transaction });
                }
            }

            await transaction.commit();
            log('Transaction Committed');

            // Fetch the complete post to return
            const completePost = await Post.findByPk(post.id, {
                include: [
                    "user",
                    { model: db.postImages, as: "images" },
                    "routePoints",
                    "tripData",
                    "tags"
                ],
                order: [
                    [{ model: db.postImages, as: "images" }, 'sortOrder', 'ASC']
                ]
            });

            res.send(completePost);

        } catch (err) {
            await transaction.rollback();
            log('ERROR: ' + err.message);
            log('ERROR STACK: ' + err.stack);
            console.error("Post Creation Error:", err);
            res.status(500).send({ message: err.message });
        }
    });

    // Get all Posts (Timeline) with Filters
    app.get("/api/posts", [authJwt.verifyToken], async (req, res) => {
        try {
            const { search, ageGroup, tag, type, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * parseInt(limit);
            const limitNum = parseInt(limit);


            let postCondition = { isDeleted: false };
            let includeOptions = [
                {
                    model: User,
                    as: "user",
                    include: ["profile"]
                },
                "tags",
                "routePoints",
                {
                    model: TripData,
                    as: "tripData"
                },
                {
                    model: Like,
                    as: "likes"
                },
                {
                    model: db.postImages,
                    as: "images"
                }
            ];

            // Filter: Following
            if (type === 'following') {
                const user = await User.findByPk(req.userId, {
                    include: [{
                        model: User,
                        as: 'Following',
                        attributes: ['id']
                    }]
                });

                if (!user) {
                    return res.status(404).send({ message: "User not found" });
                }

                const followingIds = user.Following.map(u => u.id);
                if (followingIds.length === 0) {
                    return res.send([]);
                }
                postCondition.userId = { [db.Sequelize.Op.in]: followingIds };
            }

            // Filter by Search (Content or Location)
            if (search) {
                postCondition = {
                    ...postCondition,
                    [db.Sequelize.Op.or]: [
                        { content: { [db.Sequelize.Op.like]: `%${search}%` } },
                        { locationName: { [db.Sequelize.Op.like]: `%${search}%` } }
                    ]
                };
            }

            // Filter by Tag
            if (tag) {
                const tagInclude = {
                    model: Tag,
                    as: "tags",
                    where: { name: tag }
                };
                includeOptions = includeOptions.map(inc => inc === "tags" ? tagInclude : inc);
            }

            // Filter by Age Group
            if (ageGroup) {
                const userIncludeIndex = includeOptions.findIndex(inc => inc.as === "user" || (inc.model && inc.model.name === 'User'));
                if (userIncludeIndex !== -1) {
                    includeOptions[userIncludeIndex] = {
                        model: User,
                        as: "user",
                        required: true,
                        include: [{
                            model: Profile,
                            as: "profile",
                            where: { ageGroup: ageGroup },
                            required: true
                        }]
                    };
                }
            }

            const posts = await Post.findAll({
                where: postCondition,
                include: includeOptions,
                order: [
                    ['createdAt', 'DESC'],
                    [{ model: db.postImages, as: 'images' }, 'sortOrder', 'ASC'] // Order images
                ],
                limit: limitNum,
                offset: offset
            });
            res.send(posts);
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: err.message });
        }
    });

    // Get specific Post
    app.get("/api/posts/:id", async (req, res) => {
        try {
            const post = await Post.findOne({
                where: { id: req.params.id, isDeleted: false },
                include: [
                    "user",
                    "comments",
                    "likes",
                    "routePoints",
                    "tripData",
                    "tags",
                    { model: db.postImages, as: "images" }
                ],
                order: [
                    [{ model: db.postImages, as: "images" }, 'sortOrder', 'ASC']
                ]
            });
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }
            res.send(post);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    // Like a Post
    app.post("/api/posts/:id/like", [authJwt.verifyToken], async (req, res) => {
        try {
            const postId = req.params.id;
            const userId = req.userId;

            const existingLike = await Like.findOne({ where: { postId: postId, userId: userId } });
            if (existingLike) {
                await existingLike.destroy();
                return res.send({ message: "Unliked" });
            } else {
                await Like.create({ postId: postId, userId: userId });
                return res.send({ message: "Liked" });
            }
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    // Comment on a Post
    app.post("/api/posts/:id/comment", [authJwt.verifyToken], async (req, res) => {
        try {
            const comment = await Comment.create({
                userId: req.userId,
                postId: req.params.id,
                content: req.body.content
            });
            res.send(comment);
        } catch (err) {
            res.status(500).send({ message: err.message });
        }
    });

    // Delete a Post (Logical Delete)
    app.delete("/api/posts/:id", [authJwt.verifyToken], async (req, res) => {
        try {
            const post = await Post.findByPk(req.params.id);
            if (!post) {
                return res.status(404).send({ message: "Post not found" });
            }

            // Check if current user is the owner
            if (post.userId !== req.userId) {
                return res.status(403).send({ message: "Unauthorized. You can only delete your own posts." });
            }

            post.isDeleted = true;
            await post.save();

            res.send({ message: "Post deleted successfully" });
        } catch (err) {
            console.error("Delete Post Error:", err);
            res.status(500).send({ message: err.message });
        }
    });

};
