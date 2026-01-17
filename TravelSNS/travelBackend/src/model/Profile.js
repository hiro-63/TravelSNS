const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Profile = sequelize.define("profile", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'profile_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'display_name'
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'bio'
        },
        avatarUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'avatar_url'
        },
        bannerUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'banner_url'
        },
        ageGroup: {
            type: DataTypes.ENUM('teen', '20s', '30s', '40s', '50s', '60plus'),
            allowNull: true,
            field: 'age_group'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
        }
    }, {
        tableName: 'profile',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    // Instance Methods
    Profile.prototype.updateDisplayName = async function (newName) {
        try {
            this.displayName = newName;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    Profile.prototype.updateBio = async function (newBio) {
        try {
            this.bio = newBio;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    Profile.prototype.updateAvatarUrl = async function (newUrl) {
        try {
            this.avatarUrl = newUrl;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    Profile.prototype.updateBannerUrl = async function (newUrl) {
        try {
            this.bannerUrl = newUrl;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    Profile.prototype.updateAgeGroup = async function (newAgeGroup) {
        try {
            this.ageGroup = newAgeGroup;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    Profile.prototype.getProfileView = function () {
        return {
            displayName: this.displayName,
            bio: this.bio,
            avatarUrl: this.avatarUrl,
            bannerUrl: this.bannerUrl,
            ageGroup: this.ageGroup
        };
    };

    return Profile;
};
