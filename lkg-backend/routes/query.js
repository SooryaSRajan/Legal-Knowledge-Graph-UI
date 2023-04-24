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

router.post("/searchForValues", (req, res) => {
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

            whereParts.push(`(apoc.text.levenshteinSimilarity(toLower(e${count}.name), toLower("${value}")) >= 0.7 OR toLower(e${count}.name) CONTAINS toLower("${value}"))`)
            if (type === "NONE") {
                matchParts.push(`MATCH (e${count}:Entity)-[]->(s${count}:SubText)-[:SUBTEXT_OF]->(c)`);
            } else {
                matchParts.push(`MATCH (e${count}:Entity {type: "${type}"})-[]->(s${count}:SubText)-[:SUBTEXT_OF]->(c)`);
            }
        }
        const secondaryMatchPart = matchParts.join(" ");
        const wherePart = whereParts.join(" AND ");

        queryString = `${secondaryMatchPart} WHERE ${wherePart} RETURN c`;

    } else {
        const matchPart = `MATCH (e:Entity)-[]->(s:SubText)-[:SUBTEXT_OF]->(c:Case)`;
        const whereParts = [];

        for (const param of query) {
            const type = param.type;
            const value = param.value.trim();

            if (value === "") {
                continue;
            }

            let apocQuery = `(apoc.text.levenshteinSimilarity(toLower(e.name), toLower("${value}")) >= 0.7 OR toLower(e.name) CONTAINS toLower("${value}"))`;
            if (type === "NONE") {
                whereParts.push(apocQuery);
            } else {
                whereParts.push(`(toLower(e.type) = toLower("${type}") AND ${apocQuery})`);
            }
        }

        queryString = `${matchPart} WHERE ${whereParts.join(' OR ')} RETURN c`;

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

        cases.sort((a, b) => {
            return b.pagerank - a.pagerank;
        });

        return res.json({cases: cases, similarCases: []});
    });

});

router.post("/searchForSimilarResults", (req, res) => {
    const session = require("../config/neo4j").getSession();

    const query = req.body;
    const type = query.type;
    const value = query.value.trim();

    const matchPart = `MATCH (e:Entity)-[]->(s:SubText)-[:SUBTEXT_OF]->(c:Case)`;
    let wherePart = '';

    if(type === "NONE") {
        wherePart = `WHERE (apoc.text.levenshteinSimilarity(toLower(e.name), toLower("${value}")) >= 0.7 OR toLower(e.name) CONTAINS toLower("${value}"))`;
    }
    else {
        wherePart = `WHERE (toLower(e.type) = toLower("${type}") AND (apoc.text.levenshteinSimilarity(toLower(e.name), toLower("${value}")) >= 0.7 OR toLower(e.name) CONTAINS toLower("${value}")))`;
    }

    const queryString = `${matchPart} ${wherePart} RETURN c`;

    session.run(queryString).then((result) => {
        let annotationIdSet = new Set();

        const cases = []
        const communityIdSet = new Set();
        result.records.forEach((record) => {
            let caseObj = record._fields[0].properties;
            caseObj.showMore = false;
            let annotationId = caseObj.annotation_id;
            if (!annotationIdSet.has(annotationId)) {
                annotationIdSet.add(annotationId);
                cases.push(caseObj);
                communityIdSet.add(caseObj.community);
            }

        });

        cases.sort((a, b) => {
            return b.pagerank - a.pagerank;
        });

        session.run(`MATCH (c:Case) WHERE c.community IN [${Array.from(communityIdSet).join(",")}] RETURN c`).then((result) => {

            const similarCases = [];
            result.records.forEach((record) => {
                let caseObj = record._fields[0].properties;
                caseObj.showMore = false;
                let annotationId = caseObj.annotation_id;
                if (!annotationIdSet.has(annotationId)) {
                    annotationIdSet.add(annotationId);
                    similarCases.push(caseObj);
                }
            });

            similarCases.sort((a, b) => {
                return b.pagerank - a.pagerank;
            });


            return res.json({cases: cases, similarCases: similarCases});
        }).catch((error) => {
            console.log(error);
            return res.json({cases: cases, similarCases: []});
        });

    }).catch((error) => {
        console.log(error);
        return res.json({cases: [], similarCases: []});
    });

});


module.exports = router;