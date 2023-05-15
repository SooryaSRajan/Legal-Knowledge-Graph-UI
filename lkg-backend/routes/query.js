const express = require("express");
const router = express.Router();
const stringSimilarity = require("string-similarity");

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

    const {type, matchRange, sameCaseOccurrence, top50Only} = req.body;

    if (!(matchRange >= 0.5 && matchRange <= 1)) {
        return res.json({error: "Invalid match range"});
    }

    const queryString = `MATCH (e:Entity {type: "${type}"})-[]->(s:SubText)-[:SUBTEXT_OF]->(c:Case) WITH e, COLLECT( ${sameCaseOccurrence ? "" : "DISTINCT"} {case_id: c.case_id}) AS connectedCases RETURN e.name, connectedCases`
    session.run(queryString).then((result) => {
        let records = []
        result.records.forEach((record) => {
            const name = record._fields[0];
            const connectedCases = record._fields[1];
            records.push({name: name, connectedCases: connectedCases});
        });
        if (matchRange >= 0.95) {
            return res.json(buildChartData(records, type, top50Only));
        }
        return res.json(buildChartData(mergeSimilarNodes(records, matchRange), type, top50Only));
    }).catch((error) => {
        console.log(error);
        return res.json({error: error});
    });

});


function mergeSimilarNodes(records, accuracy) {
    const mergedRecords = [];

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        if (record) {
            const mergedRecord = {...record};
            const connectedCases = [...record.connectedCases];

            for (let j = i + 1; j < records.length; j++) {
                const compareRecord = records[j];
                if (compareRecord && stringSimilarity.compareTwoStrings(record.name, compareRecord.name) >= accuracy) {
                    connectedCases.push(...compareRecord.connectedCases);
                    records.splice(j, 1);
                    j--;

                }
            }

            mergedRecord.connectedCases = connectedCases;
            mergedRecords.push(mergedRecord);
        }
    }

    return mergedRecords;
}

function buildChartData(records, group, top50Only) {

    let chartData = {
        labels: [],
        datasets: [{
            label: 'Frequency analysis of entity group - ' + group,
            backgroundColor: [],
            data: []
        }]
    }

    records.forEach((record) => {
        chartData.labels.push(record.name);
        chartData.datasets[0].data.push(record.connectedCases.length);
        chartData.datasets[0].backgroundColor.push(randomColorGenerator());
    });

    //sort chart data based on connectedCases.length
    chartData.datasets[0].data.sort((a, b) => {
        return b - a;
    });

    //if more than 50 records, only show top 50
    if (top50Only && chartData.labels.length > 50) {
        chartData.labels = chartData.labels.slice(0, 50);
        chartData.datasets[0].data = chartData.datasets[0].data.slice(0, 50);
        chartData.datasets[0].backgroundColor = chartData.datasets[0].backgroundColor.slice(0, 50);
    }

    chartData.datasets[0].label = chartData.datasets[0].label + `, ${
        top50Only ? "Top" : "All"
    } ${chartData.labels.length} results`;

    return chartData;

}

function randomColorGenerator() {
    return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
}


module.exports = router;