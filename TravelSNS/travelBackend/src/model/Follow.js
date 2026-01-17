const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Follow = sequelize.define("user_follow", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'follow_id'
        },
        followerId: { // フォローする側
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'follower_id'
        },
        followedId: { // フォローされる側
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'followed_id'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        }
    }, {
        tableName: 'user_follow',
        timestamps: false,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['follower_id', 'followed_id']
            }
        ]
    });

    return Follow;
};
