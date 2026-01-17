const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const TripData = sequelize.define("trip_data", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'id'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            field: 'post_id'
        },
        totalBudget: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'total_budget'
        },
        budgetFood: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'budget_food'
        },
        budgetAccommodation: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'budget_accommodation'
        },
        budgetTransport: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'budget_transport'
        },
        accommodationNames: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'accommodation_names'
        },
        transportMethods: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'transport_methods'
        }
    }, {
        tableName: 'trip_data',
        timestamps: false
    });

    return TripData;
};
