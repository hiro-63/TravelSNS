const db = require("./src/model/index.js");
const User = db.users;
const Profile = db.profile;

async function backfill() {
    try {
        await db.sequelize.authenticate();
        console.log("Database connected.");

        // Find users with null displayName or empty string
        const users = await User.findAll();

        console.log(`Found ${users.length} users. Checking for missing displayNames...`);

        for (const user of users) {
            let processed = false;
            let newDisplayName = user.displayName;

            // Generate if missing on User
            if (!user.displayName) {
                const randomSuffix = Math.random().toString(36).substring(2, 8);
                newDisplayName = `user_${randomSuffix}`;
                user.displayName = newDisplayName;
                await user.save();
                console.log(`Updated User ${user.username} with displayName: ${newDisplayName}`);
                processed = true;
            }

            // Sync to Profile
            // Force fetch profile if not included (though finding usually excludes unless specified)
            // But we can just try to findOne profile
            let profile = await Profile.findOne({ where: { userId: user.id } });

            if (profile) {
                if (!profile.displayName) {
                    profile.displayName = user.displayName; // Sync with User's display name
                    await profile.save();
                    console.log(`Updated Profile for ${user.username} with displayName: ${profile.displayName}`);
                    processed = true;
                }
            } else {
                // Create profile if missing?
                console.log(`No profile found for ${user.username}, creating one...`);
                await Profile.create({
                    userId: user.id,
                    displayName: user.displayName
                });
                console.log(`Created Profile for ${user.username}`);
                processed = true;
            }

            if (!processed) {
                console.log(`User ${user.username} already has display name: ${user.displayName}`);
            }
        }

        console.log("Backfill complete.");

    } catch (error) {
        console.error("Error during backfill:", error);
    } finally {
        await db.sequelize.close();
    }
}

backfill();
