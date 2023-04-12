const express = require("express");
const router = express.Router();
const session = require("../config/neo4j").getSession();

router.get("/types", (req, res) => {
    session.run("MATCH (n:Entity) RETURN DISTINCT n.type").then((result) => {
        const types = result.records.map((record) => {
            return record._fields[0];
        });
        res.json(types);
    });
})

module.exports = router;