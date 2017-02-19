'use strict';

const MAX_MIGRATION_CHUNK = 25;
const MIGRATION_SEED_CONCURRENCY = 5;

var BbPromise = require('bluebird'),
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path');

var createTable = function(dynamodb, migration) {
    return new BbPromise(function(resolve) {
        dynamodb.raw.createTable(migration.Table, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Table creation completed for table: " + migration.Table.TableName);
            }
            resolve(migration);
        });
    });
};

var formatTableName = function(migration, options) {
    return options.tablePrefix + migration.Table.TableName + options.tableSuffix;
};

/**
 * Writes a batch chunk of migration seeds to DynamoDB. DynamoDB has a limit on the number of
 * items that may be written in a batch operation.
 * @param {string} tableName The table name being written to
 * @param {any[]} seeds The migration seeds being written to the table
 */
var writeSeedBatch = function(dynamodb, tableName, seeds) {
    var params,
        batchSeeds = seeds.map(function(seed) {
            return {
                PutRequest: {
                    Item: seed
                }
            };
        });
    params = {
        RequestItems: {}
    };
    params.RequestItems[tableName] = batchSeeds;
    return new BbPromise((resolve, reject) => {
        var interval = 0,
            execute = function(interval) {
                setTimeout(function() {
                    dynamodb.doc.batchWrite(params, function(err) {
                        if (err) {
                            if (err.code === "ResourceNotFoundException" && interval <= 5000) {
                                execute(interval + 1000);
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve();
                        }
                    });
                }, interval);
            };
        execute(interval);
    });
}

var runSeeds = function(dynamodb, migration) {
    if (!migration.Seeds || !migration.Seeds.length) {
        return new BbPromise(function(resolve) {
            resolve(migration);
        });
    } else {
        var seedChunks = _.chunk(migration.Seeds, MAX_MIGRATION_CHUNK);
        return BbPromise.map(
            seedChunks,
            chunk => writeSeedBatch(dynamodb, migration.Table.TableName, chunk),
            { concurrency: MIGRATION_SEED_CONCURRENCY }
        )
        .then(() => console.log("Seed running complete for table: " + migration.Table.TableName));
    }
};

var create = function(migrationName, options) {
    return new BbPromise(function(resolve, reject) {
        var template = require('./templates/table.json');
        template.Table.TableName = migrationName;

        if (!fs.existsSync(options.dir)) {
            fs.mkdirSync(options.dir);
        }

        fs.writeFile(options.dir + '/' + migrationName + '.json', JSON.stringify(template, null, 4), function(err) {
            if (err) {
                return reject(err);
            } else {
                resolve('New file created in ' + options.dir + '/' + migrationName + '.json');
            }
        });
    });
};
module.exports.create = create;

var executeAll = function(dynamodb, options) {
    return new BbPromise(function(resolve, reject) {
        fs.readdirSync(options.dir).forEach(function(file) {
            if (path.extname(file) === ".json") {
                var migration = require(options.dir + '/' + file);
                migration.Table.TableName = formatTableName(migration, options);
                createTable(dynamodb, migration).then(function(executedMigration) {
                    runSeeds(dynamodb, executedMigration).then(resolve, reject);
                });
            }
        });
    });
};
module.exports.executeAll = executeAll;

var execute = function(dynamodb, options) {
    return new BbPromise(function(resolve, reject) {
        var migration = require(options.dir + '/' + options.migrationName + '.json');
        migration.Table.TableName = formatTableName(migration, options);
        createTable(dynamodb, migration).then(function(executedMigration) {
            runSeeds(dynamodb, executedMigration).then(resolve, reject);
        });
    });
};
module.exports.execute = execute;
