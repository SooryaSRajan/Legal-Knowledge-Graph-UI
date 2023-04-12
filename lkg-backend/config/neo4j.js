const neo4j = require('neo4j-driver')

let driver = null

exports.connect = () => {
    if (driver === null) {
        console.log('Connecting to Neo4j')
        driver = neo4j.driver("neo4j://localhost:7687", neo4j.auth.basic("neo4j", "password"))
    }
}

exports.getSession = () => {
    if (driver === null) {
        return null
    }
    return driver.session()
}