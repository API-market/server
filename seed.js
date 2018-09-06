const serverInfo = require("./server_info.js");
const SEED_AUTH = serverInfo.SEED_AUTH;
const dbSetup = require("./db_setup.js");
const sequelize = dbSetup.dbInstance;
const db_entities = require("./db_entities.js");
const User = db_entities.User;


function runSeed() {
    sequelize.sync().then(() => {
        User.findOne({where: {email: "admin@lumeos.io"}}).then(user => {
            if (user) {
                console.log("User with id " + user["id"] + " already exists")
            } else {
                User.create({
                    "lastName": "Adminach",
                    "firstName": "Admin",
                    "email": "admin@lumeos.io",
                    "password": SEED_AUTH
                }).then(user => {
                    console.log("seeded with user with id " + user["id"])
                    if (!module.parent) {
                        process.exit(0);
                    }
                })
                    .catch(error => {
                        console.log("Error seeding:");
                        console.log(error);
                    })
            }
        })
    });
}
if (!process.env.LUMEOS_SERVER_DB) {
    runSeed();
}
