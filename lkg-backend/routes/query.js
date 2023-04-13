const express = require("express");
const router = express.Router();

router.get("/types", (req, res) => {
    const session = require("../config/neo4j").getSession();
    if (session === null) {
        return res.status(500).json({message: "Neo4j connection error"});
    }
    session.run("MATCH (n:Entity) RETURN DISTINCT n.type").then((result) => {
        const types = result.records.map((record) => {
            return record._fields[0];
        });
        types.sort();
        types.unshift("NONE");
        return res.json(types);
    });
})

router.post("/search", (req, res) => {
    const session = require("../config/neo4j").getSession();

    const {query, tightSearch} = req.body;

    if (session === null) {
        return res.status(500).json({message: "Neo4j connection error"});
    }

    let queryString = "";

    if(tightSearch) {
        let count = 0;
        //MATCH (e1:Entity)-[]->(s1:SubText)-[:SUBTEXT_OF]->(c:Case)
        // MATCH (e2:Entity)-[]->(s2:SubText)-[:SUBTEXT_OF]->(c)
        // WHERE apoc.text.levenshteinSimilarity(toLower(e1.name), toLower("Raveendran")) >= 0.7
        // AND apoc.text.levenshteinSimilarity(toLower(e2.name), toLower("Delhi Transport Corporation")) >= 0.7
        // AND apoc.text.levenshteinSimilarity(toLower(e2.name), toLower("Delhi Transport Corporation")) >= 0.7
        // . . .
        // RETURN c, e1, e2, s1, s2
        const matchParts = [];
        const whereParts = [];
        for (const param of query) {
            count++;
            const type = param.type;
            const value = param.value;
            if (type === "NONE") {
                whereParts.push(`apoc.text.levenshteinSimilarity(toLower(e${count}.name), toLower("${value}")) >= 0.7`);
            } else {
                whereParts.push(`e${count}.type = "${type}" AND apoc.text.levenshteinSimilarity(toLower(e${count}.name), toLower("${value}")) >= 0.7`);
            }
            matchParts.push(`MATCH (e${count}:Entity)-[]->(s${count}:SubText)-[:SUBTEXT_OF]->(c)`);
        }
        const secondaryMatchPart = matchParts.join(" ");
        const wherePart = whereParts.join(" AND ");

        queryString = `${secondaryMatchPart} WHERE ${wherePart} RETURN c`;
        console.log(query);

    }
    else{
        //MATCH (e:Entity)-[]->(s:SubText)-[:SUBTEXT_OF]->(c)
        // WHERE apoc.text.levenshteinSimilarity(toLower(e.name), toLower("Raveendran")) >= 0.7
        // OR apoc.text.levenshteinSimilarity(toLower(e.name), toLower("Delhi Transport Corporation")) >= 0.7
        // RETURN e, s, c
        const matchPart = `MATCH (e:Entity)-[]->(s:SubText)-[:SUBTEXT_OF]->(c:Case)`;
        const whereParts = [];

        for (const param of query) {
            const type = param.type;
            const value = param.value;
            if (type === "NONE") {
                whereParts.push(`apoc.text.levenshteinSimilarity(toLower(e.name), toLower("${value}")) >= 0.7`);
            } else {
                whereParts.push(`e.type = "${type}" AND apoc.text.levenshteinSimilarity(toLower(e.name), toLower("${value}")) >= 0.7`);
            }
        }

        queryString = `${matchPart} WHERE ${whereParts.join(' OR ')} RETURN c, s, e`;
        console.log(query);

    }


    session.run(queryString).then((result) => {
        const cases = result.records.map((record) => {
            return record._fields[0];
        });
        console.log(cases)
        return res.json(cases);
    });

});

module.exports = router;