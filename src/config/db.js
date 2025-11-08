import { MongoClient, ServerApiVersion } from "mongodb";



const connectDB = async () => {

    // uri
    
    // mongo client
    const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    });
    
    
    try {
        await client.connect();
        console.log("Mongo connected")

    }
    catch (error) {
        console.log("Mongo error", error)
    }
}

export default connectDB;