const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const RoutePoint = sequelize.define("route_point", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'post_id'
        },
        orderIndex: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'order_index'
        },
        lat: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: false,
            field: 'lat'
        },
        lon: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: false,
            field: 'lon'
        },
        locationName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'location_name'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'description'
        },
        arrivalTime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'arrival_time'
        },
        transportToNext: {
            type: DataTypes.ENUM('walk', 'train', 'bus', 'car', 'bicycle', 'plane', 'ship'),
            defaultValue: 'walk',
            allowNull: true,
            field: 'transport_to_next'
        }
    }, {
        tableName: 'route_point',
        timestamps: false
    });

    return RoutePoint;
};
