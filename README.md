dynamodb-migrations
=================================
[![npm version](https://badge.fury.io/js/dynamodb-migrations.svg)](https://badge.fury.io/js/dynamodb-migrations)
[![license](https://img.shields.io/npm/l/dynamodb-migrations.svg)](https://www.npmjs.com/package/dynamodb-migrations)

This library allows you to manager DynamoDB Migration Files (Which includes your Tables Schema and Seed data) with an simplified template for use in devops.

## This Plugin Requires

* Local Dynamodb Instance or AWS Account with Dynamodb Access Configured

## Features

* Create Migration Templates
* Execute Migration Templates Individually
* Execute All the Migration Templates At Once

## Installation

`npm install --save dynamodb-migrations`

## Usage

Usage example

```
var AWS = require('aws-sdk'),
dm = require("dynamodb-migrations");

/* Note: To configure AWS Credentials refer https://aws.amazon.com/sdk-for-node-js/ */

var dynamodb = {raw: new AWS.DynamoDB() , doc: new AWS.DynamoDB.DocumentClient() };
dm.init(dynamodb, '<myprojectroot>/<migrations>'); /* This method requires multiple dynamodb instances with default Dynamodb client and Dynamodb Document Client. All the other methods depends on this. */
dm.create('sampleTable'); /* Use gulp, grunt or serverless to integrate this with the commandline, modify the created template file with your custom table schema and seed data */
dm.execute('sampleTable', { tablePrefix: 'dev-', tableSuffix: '-sample'}); /* This executes the 'sampleTable' migration. Note: second parameter is optional
```

Note: For dynamodb local you can initialize the dynamodb variable as follows
```
var  options = { region: 'localhost', endpoint: "http://localhost:8000" },
     dynamodb = {raw: new AWS.DynamoDB(options) , doc: new AWS.DynamoDB.DocumentClient(options) };
```

Note: for the 'init' method, the migration directory path should be an absolute path. Following example shows how to refer the adbolute path
```
var path = require('path');
var relPath = 'migrations';
var absolutePath = path.dirname(__filename) + '/' + relPath;
```

Supported methods

```
init(dynamodb, migrationsDir)            To initialize DynamoDB Client Instances to execute queries and to initialize the directory where migration files exists
create(migrationName)                    To create a new template with migrationName included, which you can modify to include other attributes and seed data. More information on migration template is shown in the following section.
execute(migrationName, tableOptions)     To execute a single migration file. This create the tables if they don't exists and runs the seeds defined in the migration file. tableOptions provides, tablePrefix and tableSuffix attributes to be set, if the actual table is different from migration name
executeAll()(tableOptions)               To execute all the migration files to create tables and run all the seeds
```

## Migration Template

```
{
    "Table": {
        "TableName": "TableName",
        "KeySchema": [{
            "AttributeName": "attr_1",
            "KeyType": "HASH"
		}, {
            "AttributeName": "attr_2",
            "KeyType": "RANGE"
		}],
        "AttributeDefinitions": [{
            "AttributeName": "attr_1",
            "AttributeType": "S"
		}, {
            "AttributeName": "attr_2",
            "AttributeType": "S"
		}],
        "LocalSecondaryIndexes": [{
            "IndexName": "local_index_1",
            "KeySchema": [{
                "AttributeName": "attr_1",
                "KeyType": "HASH"
			}, {
                "AttributeName": "attr_2",
                "KeyType": "RANGE"
			}],
            "Projection": {
                "NonKeyAttributes": ["attr_1", "attr_2"],
                "ProjectionType": "INCLUDE"
            }
		}],
        "GlobalSecondaryIndexes": [{
            "IndexName": "global_index_1",
            "KeySchema": [{
                "AttributeName": "attr_1",
                "KeyType": "HASH"
			}, {
                "AttributeName": "attr_2",
                "KeyType": "RANGE"
			}],
            "Projection": {
                "NonKeyAttributes": ["attr_1", "attr_2"],
                "ProjectionType": "INCLUDE"
            },
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 1,
                "WriteCapacityUnits": 1
            }
		}],
        "ProvisionedThroughput": {
            "ReadCapacityUnits": 1,
            "WriteCapacityUnits": 1
        }
    },
    "Seeds": [{
        "attr_1": "attr_1_value",
        "attr_2": "attr_2_value"
    }]
}
```
Before modifying the migration template, refer the Dynamodb Client SDK and Dynamodb Document Client SDK links.

## Links
* [Dynamodb Client SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property)
* [Dynamodb Document Client SDK](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property)
* [Dynamodb local documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
* [Contact Us](mailto:ashanf@99x.lk)
* [NPM Registry](https://www.npmjs.com/package/dynamodb-migrations)

## Contributing

We love our contributors! If you'd like to contribute to the project, feel free to submit a PR. But please keep in mind the following guidelines:

* Propose your changes before you start working on a PR. You can reach us by submitting a Github issue. This is just to make sure that no one else is working on the same change, and to figure out the best way to solve the issue.
* If you're out of ideas, but still want to contribute, help us in solving Github issues already verified.
* Contributions are not just PRs! We'd be grateful for having you, and if you could provide some support for new comers, that be great! You can also do that by answering this plugin related questions on Stackoverflow.
You can also contribute by writing. Feel free to let us know if you want to publish a useful guides, improve the documentation (attributed to you, thank you!) that you feel will help the community.