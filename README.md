# restify

Is a quick setup for a rest server.

  1. Describe the data and provide a database object.
    1.a - The database should match the interfaces: 
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
    1.b The restify config should match the interfaces:
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

  
