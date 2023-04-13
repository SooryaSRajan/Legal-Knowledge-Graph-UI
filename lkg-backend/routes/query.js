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

    if (tightSearch) {
        let count = 0;
        const matchParts = [];
        const whereParts = [];
        for (const param of query) {
            count++;
            const type = param.type;
            const value = param.value.trim();

            if (value === "") {
                continue;
            }

            let apocQuery = `(apoc.text.levenshteinSimilarity(toLower(e${count}.name), toLower("${value}")) >= 0.7 OR e${count}.name CONTAINS "${value}")`;
            if (type === "NONE") {
                whereParts.push(apocQuery);
            } else {
                whereParts.push(`(e${count}.type = "${type}" AND ${apocQuery})`);
            }
            matchParts.push(`MATCH (e${count}:Entity)-[]->(s${count}:SubText)-[:SUBTEXT_OF]->(c)`);
        }
        const secondaryMatchPart = matchParts.join(" ");
        const wherePart = whereParts.join(" AND ");

        queryString = `${secondaryMatchPart} WHERE ${wherePart} RETURN c`;
        console.log(query);

    } else {
        const matchPart = `MATCH (e:Entity)-[]->(s:SubText)-[:SUBTEXT_OF]->(c:Case)`;
        const whereParts = [];

        for (const param of query) {
            const type = param.type;
            const value = param.value.trim();

            if (value === "") {
                continue;
            }

            let apocQuery = `(apoc.text.levenshteinSimilarity(toLower(e.name), toLower("${value}")) >= 0.7 OR e.name CONTAINS "${value}")`;
            if (type === "NONE") {
                whereParts.push(apocQuery);
            } else {
                whereParts.push(`(e.type = "${type}" AND ${apocQuery}) `);
            }
        }

        queryString = `${matchPart} WHERE ${whereParts.join(' OR ')} RETURN c, s, e`;
        console.log(query);

    }


    session.run(queryString).then((result) => {
        let annotationIdSet = new Set();

        const cases = []
        result.records.forEach((record) => {
            let caseObj = record._fields[0].properties;
            caseObj.showMore = false;
            let annotationId = caseObj.annotation_id;
            if (!annotationIdSet.has(annotationId)) {
                annotationIdSet.add(annotationId);
                cases.push(caseObj);
            }

        });

        console.log(cases)
        return res.json(cases);
    });

});

module.exports = router;