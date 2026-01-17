const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'user_id'
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'password_hash',
            validate: {
                notEmpty: true
            }
        },
        displayName: {
            type: DataTypes.STRING,
            field: 'display_name',
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: true, // SQL says DEFAULT TRUE (implies nullable or not? usually boolean is not null with default, but SQL didn't specify NOT NULL. Wait, SQL: is_active BOOLEAN DEFAULT TRUE. Nullability unknown, usually nullable unless NOT NULL specified. Safe to allow null or false.)
            // Actually, usually we want NOT NULL DEFAULT TRUE. But let's stick to simple compatibility.
            field: 'is_active'
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
            field: 'is_verified'
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
        tableName: 'users', // MATCHING SQL: users
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
                if (!user.displayName) {
                    // Generate random string like 'a8f3k2'
                    const randomSuffix = Math.random().toString(36).substring(2, 8);
                    user.displayName = `user_${randomSuffix}`;
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    });

    // Instance Methods
    User.prototype.verifyPassWord = async function (input) {
        return await bcrypt.compare(input, this.password);
    };

    User.prototype.changeUserName = async function (newUsername) {
        try {
            this.username = newUsername;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    User.prototype.resetPassWord = async function (newPassword) {
        try {
            this.password = newPassword;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    User.prototype.deactivateAccount = async function () {
        try {
            this.isActive = false;
            await this.save();
            return true;
        } catch (error) {
            return false;
        }
    };

    User.prototype.getCreatedAt = function () {
        return this.createdAt;
    };

    return User;
};
