const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Like = sequelize.define("likes", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'like_id'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'post_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        }
    }, {
        tableName: 'likes',
        timestamps: false,
        createdAt: 'created_at',
        updatedAt: false
    });

    return Like;
};
