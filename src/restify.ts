import express from "express";

interface getInfo {
    database: string,
    table: string,
    id?: any
    where?: any,
    properties: string | string[]
    limit?: string | number
}
interface postInfo {
    database: string,
    table: string,
    properties: any
}
interface putInfo {
    database: string,
    table: string,
    id: any,
    properties: any
}
interface deleteInfo {
    database: string,
    table: string,
    id: any
}
interface database {
    [key: string]: any,
    post: (postInfo: postInfo) => Promise<number>,
    put: (putInfo: putInfo) => Promise<void>,
    get: (getInfo: getInfo) => Promise<any>,
    delete: (deleteInfo: deleteInfo) => Promise<void>
}
interface schema {
    database: string,
    table: string,
    properties: any,
    id: string,
    url?: string,
    methods?: string[],
    middleware?: any,
    limit?: number
}
interface config {
    schema: schema[],
    database: database,
    port: number
}
export default class Restify {
    private app: any = express();
    private server: any = undefined;
    private schema: schema[] = undefined;
    private database: database = undefined;
    private port: number = 80;

    constructor({
        schema,
        database,
        port = 80
    }: config ) {
        let self = this;
        self.schema = schema;
        self.database = database;
        self.port = port;
        self.app.use(express.json())
    }

    public async initialize(): Promise<void> {
        let self = this;
        return new Promise(async function( resolve, reject ) {
            try {
                self.schema.forEach(await self.setup.bind( self ));
                self.server = self.app.listen(self.port, () => { resolve(); });
            } catch( error ) {
                reject( error );
            }
        });
    }

    public async close(): Promise<void> {
        let self = this;
        return new Promise(function( resolve ) {
            self.server.close( resolve );
        });
    }

    private setup({ 
        database,
        table,
        properties,
        id,
        middleware,
        limit,
        url = "",
        methods = [ "get", "post", "put", "delete" ]
    }: schema) {
        let self = this;

        url = (url[0] == "/")? url: "/"  + url;
        url += (url[url.length - 1] == "/")? "": "/";
        url += database + "/" + table + "/:id?";
        
        let databaseArguments: any = {
            get: ( request: any ) => {
                let _id: any = undefined;
                if ( request.params.id ) {
                    _id = {};
                    _id[id] = request.params.id;
                }
                let where = request.query;
                return {
                    id: _id,
                    where,
                    properties,
                    limit,
                    database,
                    table
                };
            },
            post: ( request: any ) => {
                return {
                    properties: request.body,
                    database,
                    table
                };
            },
            put: ( request: any ) => {
                let _id: any = {};
                _id[id] = request.params.id;
                return {
                    id: _id,
                    properties: request.body,
                    database,
                    table
                };
            },
            delete: ( request: any ) => {
                let _id: any = {};
                _id[id] = request.params.id;
                return {
                    id: _id,
                    database,
                    table
                };
            }
        };

        methods.forEach(method => {
            self.app[method](url, async ( request: any, response: any ) => {
                let data = undefined;
                let status = "success";
                try {
                    if ( middleware ) {
                        let result = await middleware( request, response, properties );
                        request = result? result: request;
                    }
                    data = await self.database[method]( databaseArguments[method]( request ) );
                } catch( error ) {
                    status = "error";
                    data = error.toString? error.toString(): JSON.stringify( error );
                } finally {
                    response.send({
                        status: status,
                        data
                    });
                }
            });
        });
    }
}