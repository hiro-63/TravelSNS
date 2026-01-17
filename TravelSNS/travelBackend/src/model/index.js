
const Sequelize = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const dbName = process.env.DB_NAME || "travel_db";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbHost = process.env.DB_HOST || "localhost";

const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, '../../sql_debug.log'), { flags: 'a' });

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: "mysql",
    logging: (msg) => logStream.write(msg + '\n'),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// モデルのインポート
db.profile = require("./Profile")(sequelize, Sequelize);
db.users = require("./User")(sequelize, Sequelize);
db.posts = require("./Post")(sequelize, Sequelize);
db.comments = require("./Comment")(sequelize, Sequelize);
db.likes = require("./Like")(sequelize, Sequelize);
db.follows = require("./Follow")(sequelize, Sequelize);
// New Models
db.routePoints = require("./RoutePoint")(sequelize, Sequelize);
db.tripData = require("./TripData")(sequelize, Sequelize);
db.mimics = require("./Mimic")(sequelize, Sequelize);
db.tags = require("./Tag")(sequelize, Sequelize);
db.postTags = require("./PostTag")(sequelize, Sequelize);
db.postImages = require("./PostImage")(sequelize, Sequelize);

// リレーション定義

// Post - PostImage (1:N)
db.posts.hasMany(db.postImages, { foreignKey: "postId", as: "images" });
db.postImages.belongsTo(db.posts, { foreignKey: "postId", as: "post" });

// User - Profile (1:1)
db.users.hasOne(db.profile, { foreignKey: "userId", as: "profile" });
db.profile.belongsTo(db.users, { foreignKey: "userId", as: "user" });

// User - Post (1:N)
db.users.hasMany(db.posts, { foreignKey: "userId", as: "posts" });
db.posts.belongsTo(db.users, { foreignKey: "userId", as: "user" });

// Post - Comment (1:N)
db.posts.hasMany(db.comments, { foreignKey: "postId", as: "comments" });
db.comments.belongsTo(db.posts, { foreignKey: "postId", as: "post" });

// User - Comment (1:N)
db.users.hasMany(db.comments, { foreignKey: "userId", as: "comments" });
db.comments.belongsTo(db.users, { foreignKey: "userId", as: "user" });

// Likes (N:M via Like model)
db.users.hasMany(db.likes, { foreignKey: 'userId' });
db.likes.belongsTo(db.users, { foreignKey: 'userId' });

db.posts.hasMany(db.likes, { foreignKey: 'postId' });
db.likes.belongsTo(db.posts, { foreignKey: 'postId' });

// Follows (N:M via Follow model)
db.users.belongsToMany(db.users, {
    as: 'Following',
    through: db.follows,
    foreignKey: 'followerId',
    otherKey: 'followedId'
});

db.users.belongsToMany(db.users, {
    as: 'Followers',
    through: db.follows,
    foreignKey: 'followedId',
    otherKey: 'followerId'
});

db.follows.belongsTo(db.users, { foreignKey: 'followerId', as: 'follower' });
db.follows.belongsTo(db.users, { foreignKey: 'followedId', as: 'followed' });

// --- New Associations ---

// Post - RoutePoint (1:N)
db.posts.hasMany(db.routePoints, { foreignKey: "postId", as: "routePoints" });
db.routePoints.belongsTo(db.posts, { foreignKey: "postId", as: "post" });

// Post - TripData (1:1)
db.posts.hasOne(db.tripData, { foreignKey: "postId", as: "tripData" });
db.tripData.belongsTo(db.posts, { foreignKey: "postId", as: "post" });

// Mimic (User/Post N:M-ish but explicit model)
db.users.hasMany(db.mimics, { foreignKey: "userId", as: "mimics" });
db.mimics.belongsTo(db.users, { foreignKey: "userId", as: "user" });

db.posts.hasMany(db.mimics, { foreignKey: "postId", as: "mimics" });
db.mimics.belongsTo(db.posts, { foreignKey: "postId", as: "post" });

// Post - Tag (N:M)
db.posts.belongsToMany(db.tags, {
    through: db.postTags,
    foreignKey: "postId",
    otherKey: "tagId",
    as: "tags"
});
db.tags.belongsToMany(db.posts, {
    through: db.postTags,
    foreignKey: "tagId",
    otherKey: "postId",
    as: "posts"
});

module.exports = db;
