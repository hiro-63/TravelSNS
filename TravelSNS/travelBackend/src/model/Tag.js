const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Tag = sequelize.define("tag", {
        tagId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'tag_id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: 'name'
        }
    }, {
        tableName: 'tag',
        timestamps: false
    });

    return Tag;
};
