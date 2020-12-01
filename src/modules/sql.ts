import mysql from "mysql"
import config from "../../config"
const pool = mysql.createPool({
    database: config.db.name,
    host: config.db.host,
    port: 3306,
    user: config.db.user,
    password: config.db.password,
})

// ? Database function to ensure we always have a connection but without having to repeat ourself in the code.
let sql: any = {}
sql.query = function (query, params, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            if (callback) callback(err, null, null)
            return
        }

        connection.query(query, params, function (error, results, fields) {
            connection.release()
            if (error) {
                if (callback) callback(error, null, null)
                return
            }
            if (callback) callback(false, results, fields)
        })
    })
}

export default sql
