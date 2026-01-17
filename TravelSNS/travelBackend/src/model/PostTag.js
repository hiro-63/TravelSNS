const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const PostTag = sequelize.define("post_tag", {
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'post_id'
        },
        tagId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'tag_id'
        }
    }, {
        tableName: 'post_tag',
        timestamps: false
    });

    return PostTag;
};
