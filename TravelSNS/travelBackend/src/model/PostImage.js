const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const PostImage = sequelize.define("post_image", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'post_id'
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'image_url'
        },
        sortOrder: {
            type: DataTypes.TINYINT,
            defaultValue: 0,
            field: 'sort_order'
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'post_image',
        timestamps: false
    });

    return PostImage;
};
