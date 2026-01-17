const db = require("./src/model/index.js");
const User = db.users;
const Profile = db.profile;

async function checkUser1() {
    try {
        await db.sequelize.authenticate();
        console.log("Database connected.");

        const user = await User.findOne({
            where: { username: "user1" },
            include: ["profile"]
        });

        if (!user) {
            console.log("User1 not found.");
        } else {
            console.log(`User: ${user.username}, ID: ${user.id}`);
            console.log(`User.displayName: ${user.displayName}`);

            if (user.profile) {
                console.log(`Profile.displayName: ${user.profile.displayName}`);
            } else {
                console.log("Profile not found.");
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await db.sequelize.close();
    }
}

checkUser1();
