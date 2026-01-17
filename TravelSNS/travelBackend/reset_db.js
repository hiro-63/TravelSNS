const db = require('./src/model');

console.log("Database reset starting...");
db.sequelize.sync({ force: true })
    .then(() => {
        console.log("Database reset complete. All tables dropped and recreated.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error resetting database:", err);
        process.exit(1);
    });
