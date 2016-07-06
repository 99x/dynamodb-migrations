'use strict';

var migrations = require('./dynamodb/migrations'),
    tableOpt = {
        prefix: "",
        suffix: ""
    },
    dynamo, dir;

var manager = {
    init: function (dynamodb, migrationDir) {
        dynamo = dynamodb;
        dir = migrationDir;
    },
    create: function (migrationName) {
        return migrations.create(migrationName, {
            dir: dir
        });
    },
    execute: function (migrationName, tableOptions) {
        return migrations.execute(dynamo, {
            dir: dir,
            migrationName: migrationName,
            tablePrefix: tableOptions.prefix || tableOpt.prefix,
            tableSuffix: tableOptions.suffix || tableOpt.suffix
        });
    },
    executeAll: function (tableOptions) {
        return migrations.executeAll(dynamo, {
            dir: dir,
            tablePrefix: tableOptions.prefix || tableOpt.prefix,
            tableSuffix: tableOptions.suffix || tableOpt.suffix
        });
    }
};
module.exports = manager;
