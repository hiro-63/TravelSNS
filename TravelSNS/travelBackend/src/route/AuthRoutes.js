const db = require("../model");
const config = process.env;
const User = db.users;
const Profile = db.profile;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/auth/register", async (req, res) => {
        try {
            // Check if username exists
            const existingUser = await User.findOne({ where: { username: req.body.username } });
            if (existingUser) {
                return res.status(400).send({ message: "このユーザー名はすでに使われています" });
            }

            if (!req.body.username || !req.body.password) {
                return res.status(400).send({ message: "必須項目が入力されていません" });
            }

            // Create User
            const user = await User.create({
                username: req.body.username,
                // email removed as per schema
                password: req.body.password,
                isActive: true
            });

            // Create empty Profile for User
            const profile = await Profile.create({
                userId: user.id,
                displayName: user.displayName || user.username
            });

            // Update User with ProfileId - though relation is hasOne, so user.profileId might not exist on User table if not defined in User model. 
            // In User.js, we didn't add profileId column. The association is User.hasOne(Profile). 
            // So Profile table has userId. User table does not necessarily have profileId unless we added it.
            // The SQL for User table DID NOT have profileId. So we should NOT save it to user.
            // Removing: user.profileId = profile.id; await user.save(); 

            res.send({ message: "ユーザー登録が完了しました" });
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    app.post("/api/auth/login", async (req, res) => {
        try {
            const user = await User.findOne({
                where: {
                    username: req.body.username
                }
            });

            if (!user) {
                return res.status(404).send({ message: "アカウントが存在しません。新規登録してください" });
            }

            if (!user.isActive) {
                return res.status(401).send({ message: "このアカウントは無効化されています" });
            }

            const passwordIsValid = await user.verifyPassWord(req.body.password);
            // Note: User model has verifyPassWord instance method now? Let's check User.js.
            // Yes: User.prototype.verifyPassWord = async function (input) ...

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "ユーザー名またはパスワードが正しくありません"
                });
            }

            const token = jwt.sign({ id: user.id }, config.JWT_SECRET, {
                expiresIn: 86400 // 24 hours
            });

            res.status(200).send({
                id: user.id,
                username: user.username,
                // email: user.email, // email removed
                accessToken: token
            });
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });
};
