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

    let queryString;

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

        const whereExistsParts = [];
        for (let i = 0; i < whereParts.length; i++) {
            whereExistsParts.push(`EXISTS { ${matchParts[i]} WHERE ${whereParts[i]} }`);
        }

        queryString = `MATCH (c) WHERE ${whereExistsParts.join(" AND ")} RETURN DISTINCT c`;

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

        queryString = `${matchPart} WHERE ${whereParts.join(' OR ')} RETURN DISTINCT c`;

    }


    session.run(queryString).then((result) => {

        const cases = []
        result.records.forEach((record) => {
            let caseObj = record._fields[0].properties;
            caseObj.showMore = false;
            cases.push(caseObj);
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

    if (type === "NONE") {
        wherePart = `WHERE (apoc.text.levenshteinSimilarity(toLower(e.name), toLower("${value}")) >= 0.7 OR toLower(e.name) CONTAINS toLower("${value}"))`;
    } else {
        wherePart = `WHERE (toLower(e.type) = toLower("${type}") AND (apoc.text.levenshteinSimilarity(toLower(e.name), toLower("${value}")) >= 0.7 OR toLower(e.name) CONTAINS toLower("${value}")))`;
    }

    const queryString = `${matchPart} ${wherePart} RETURN DISTINCT c`;

    session.run(queryString).then((result) => {
        let annotationIdSet = new Set();

        const cases = []
        const communityIdSet = new Set();
        result.records.forEach((record) => {
            let caseObj = record._fields[0].properties;
            caseObj.showMore = false;
            communityIdSet.add(caseObj.community);
            annotationIdSet.add(caseObj.annotation_id);
            cases.push(caseObj);
        });

        cases.sort((a, b) => {
            return b.pagerank - a.pagerank;
        });

        session.run(`MATCH (c:Case) WHERE c.community IN [${Array.from(communityIdSet).join(",")}] RETURN DISTINCT c`).then((result) => {

            const similarCases = [];
            result.records.forEach((record) => {
                let caseObj = record._fields[0].properties;
                caseObj.showMore = false;
                let annotationId = caseObj.annotation_id;
                if (!annotationIdSet.has(annotationId)) {
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

router.post("/categoryStatistics", (req, res) => {
    const session = require("../config/neo4j").getSession();

    const {type, matchRange, sameCaseOccurrence} = req.body;

    if (!(matchRange >= 0.5 && matchRange <= 1)) {
        return res.json({error: "Invalid match range"});
    }

    const queryString = `MATCH (e1:Entity {type: '${type}'})-[]->(s:SubText)-[:SUBTEXT_OF]->(c:Case), (e2:Entity {type: '${type}'})-[]->(s2:SubText)-[:SUBTEXT_OF]->(c2:Case) WHERE e1 <> e2 AND apoc.text.levenshteinSimilarity(e1.name, e2.name) >= ${matchRange} AND c.case_id = c2.case_id WITH e1, e2, c.case_id as caseId, apoc.text.levenshteinSimilarity(e1.name, e2.name) as similarity ORDER BY similarity DESC WITH similarity, COLLECT({name: e1.name, caseId: caseId, otherName: e2.name}) as pairs RETURN similarity, REDUCE(names=[], pair IN pairs | names + pair) as similar_names`
    session.run(queryString).then((result) => {

        const statistics = [];
        result.records.forEach((record) => {
            if (sameCaseOccurrence) {
                statistics.push(record._fields[1]);
            } else {
                let similarNames = record._fields[1];
                let caseIds = new Set();
                let data = []

                for (let i = 0; i < similarNames.length; i++) {
                    if (!caseIds.has(similarNames[i].caseId)) {
                        caseIds.add(similarNames[i].caseId);
                        data.push(similarNames[i]);
                    }
                }
                statistics.push(data);
            }
        });

        return res.json({statistics: statistics});
    }).catch((error) => {
        console.log(error);
        return res.json({error: error});
    });

});


module.exports = router;