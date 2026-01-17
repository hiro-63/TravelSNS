const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Post = sequelize.define("post", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'post_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'content'
        },
        locationName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'location_name'
        },
        // SQL doesn't have likesCount on Post table (it calculates from likes table usually, or user didn't show it).
        // User's SQL for Post doesn't show likes_count.
        // It helps performance, but if schema is strict, I should check.
        // User's CREATE TABLE post ... doesn't have likes_count.
        // I will remove it to rely on count queries or associations.

        startLocation: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'start_location'
        },
        endLocation: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'end_location'
        },
        transportMode: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'transport_mode'
        },
        routeSummary: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'route_summary'
        },
        routeDistance: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'route_distance'
        },
        routeDuration: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'route_duration'
        },
        latitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: true,
            field: 'latitude'
        },
        longitude: {
            type: DataTypes.DECIMAL(9, 6),
            allowNull: true,
            field: 'longitude'
        },
        originalLanguage: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'original_language'
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_deleted'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        }
    }, {
        tableName: 'post',
        timestamps: false, // SQL only has created_at
        createdAt: 'created_at',
        updatedAt: false
    });

    // Instance Methods
    Post.prototype.updateRouteInfo = async function (start, end, mode, summary) {
        try {
            this.startLocation = start;
            this.endLocation = end;
            this.transportMode = mode;
            this.routeSummary = summary;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    Post.prototype.getMapLink = function () {
        // Simple Google Maps link generation
        if (this.startLocation && this.endLocation) {
            return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(this.startLocation)}&destination=${encodeURIComponent(this.endLocation)}&travelmode=${this.transportMode ? this.transportMode.toLowerCase() : 'driving'}`;
        }
        return null;
    };

    Post.prototype.setOriginalLanguage = async function (langCode) {
        this.originalLanguage = langCode;
        await this.save();
        return true;
    };

    Post.prototype.getOriginalLanguage = function () {
        return this.originalLanguage;
    };

    return Post;
};
