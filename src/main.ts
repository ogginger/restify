import test from "./dev/test"
import * as Restify from "./restify"
import MysqlInterface from "./lib/mysqli"
import fetch from "isomorphic-fetch"

export async function tests( database: any ) {
    function test( input: any ) {
        let object: any = {
            name: "",
            input: [],
            context: database ,
            function: undefined,
            output: true,
            debug: false
        };
        Object.assign( object, input );
        return object;
    }
    return [test({
        name: "get_{db,fruits}_returnsAll",
        input: [{
            database: "db",
            table: "fruits"
        }],
        function: async function({ database, table }: { database: string, table: string} ) {
            let self = this;
            let url = "http://localhost:3000/" + database + "/" + table;
            let output: any = await fetch( url ).then( response => response.json() );
            output = JSON.stringify( output.data );
            let expected = await self.get({ database, table });
            expected = JSON.stringify( expected );
            return expected == output;
        },
        output: true,
        debug: false
    }), test({
        name: "get_{db,fruits,id}_returnsRow",
        input: [{
            database: "db",
            table: "fruits",
            id: "fruitsId"
        }],
        function: async function({ database, table, id }: { database: string, table: string, id: string } ) {
            let self = this;
            let _id = await self.post({ database, table, properties: { name: "Apple", color: "Green" }});
            let url = "http://localhost:3000/" + database + "/" + table + "/" + _id;
            let output: any = await fetch( url ).then( response => response.json() );
            output = output.data.pop();
            output = JSON.stringify( output );
            let expected = await self.get({database, table, id: {
                fruitsId: _id
            }});
            expected = expected.pop();
            expected = JSON.stringify( expected );
            return expected == output;
        },
        output: true,
        debug: false
    }), test({
        name: "post_{db,fruits,properties}_returnsId",
        input: [{
            database: "db",
            table: "fruits",
            properties: {
                name: "Orange",
                color: "Orange"
            }
        }],
        function: async function({ database, table, properties }: { database: string, table: string, properties: any } ) {
            let url = "http://localhost:3000/" + database + "/" + table;
            let body = JSON.stringify( properties );
            let output: any = await fetch( url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body
            }).then( response => { return (response.status == 200)? response.json(): response });
            return typeof output.data == "number";
        },
        output: true,
        debug: false
    }),
    test({
        name: "put_{db,fruits,id,properties}_returnsVoid",
        input: [{
            database: "db",
            table: "fruits",
            id: undefined,
            properties: {
                name: "Orange",
                color: "Orange"
            }
        }],
        function: async function({ database, table, id, properties }: { database: string, table: string, id: number, properties: any } ) {
            let self = this;
            id = await self.post({
                database,
                table,
                properties: {
                    name: "Apple",
                    color: "Red"
                }
            })
            let url = "http://localhost:3000/" + database + "/" + table + "/" + id;
            let body = JSON.stringify( properties );
            await fetch( url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body
            });
            let _id = {
                fruitsId: id
            };

            let output = await self.get({ database, table, id: _id });
            let expected: any = {
                fruitsId: id,
                name: "Orange",
                color: "Orange"
            };
            output = output.pop();
            output = JSON.stringify( output );
            expected = JSON.stringify( expected );
            return expected == output;
        },
        output: true,
        debug: false
    }),
    test({
        name: "delete_{db,fruits,id}_returnsVoid",
        input: [{
            database: "db",
            table: "fruits",
            id: undefined
        }],
        function: async function({ database, table, id, properties }: { database: string, table: string, id: number, properties: any } ) {
            let self = this;
            id = await self.post({
                database,
                table,
                properties: {
                    name: "Apple",
                    color: "Red"
                }
            })
            let url = "http://localhost:3000/" + database + "/" + table + "/" + id;
            await fetch( url, {
                method: "DELETE"
            });

            let _id = {
                fruitsId: id
            };

            let output = await self.get({ database, table, id: _id });
            let expected: any = [];
            output = JSON.stringify( output );
            expected = JSON.stringify( expected );
            return expected == output;
        },
        output: true,
        debug: false
    })]
}

async function main() {
    let database = new MysqlInterface({
        user: "user",
        host: "localhost",
        password: "password"
    });
    
    await database.connect();

    let restify = new Restify.default({
        port: 3000,
        database,
        schema: [{
            database: "db",
            table: "fruits",
            id: "fruitsId",
            properties: [ "fruitsId", "name", "color" ]
        }]
    });
    await restify.initialize();
    await test(await tests( database ));
    await restify.close();
    await database.close();
}
main();