const neo4j = require('neo4j-driver')

let session = null

exports.connect = () => {
    if (session === null) {
        const driver = neo4j.driver(process.env.NEO4j_URL,
            neo4j.auth.basic(process.env.NEO4j_USERNAME,
                process.env.NEO4j_PASSWORD))
        driver.onCompleted = () => {
            console.log('Connected to Neo4j')
        }
        session = driver.session()
    }
}

exports.getSession = () => {
    return session
}