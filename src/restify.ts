import express from "express";

interface database {
    post?: any,
    put?: any,
    get?: any,
    delete?: any
}

interface info {
    schema: {
        [key: string]: any,
        title: string,
        properties: any
    },
    database: database
}

export default class restify {
    public server = express();
    constructor( 
        info: info[], 
        port: number = 80 
    ) {
        let self = this;
        self.initialize( info );
        self.server.listen( port );
    }

    public initialize( info: info[] ) {
        let self = this;
        info.forEach(self.setup);
    }

    public setup( info: info ) {
        let self = this;
        console.log( self );
    }
}


/*
    //get all
    get( "urls", function() {} )
    //get by id
    get( "urls/:id", function() {} )
    //post single
    post( "urls", function() {} )
        --body(json) 
    //update single
    put( "urls/:id", function() {} )
        --body
    //delete single
    delete( "urls/:id", function() {} )

    [ "all", "get", "delete", "post", "put" ]

    example: 
        mysql - 

    Use: 
    restify({
        table: {
            "": type
        },
        middleware?: function,
        methods?: string[] (["all"])
    });
//*/

export const tests: any[] = [{
    name: "constructor_info_initializesServer",
    input: [[{
        schema: {
            title: "fruits",
            description: "",
            properties: {}
        },
        database: {}
    }]],
    function: function() {
        
    },
    output: false,
    debug: true
    
}];