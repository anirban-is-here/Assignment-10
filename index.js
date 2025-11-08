const express = require("express");
const cors = require("cors");


const app = express();
const port = process.env.PORT || 3000;

// middlewire
app.use(cors());
app.use(express.json());

// mongodb connection string

const uri =
  "mongodb+srv://smartdbUser:smartdb1001@cluster0.lpak3ak.mongodb.net/next_db?appName=Cluster0";

// mongo client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("next_db");

    //   course collection
    const coursesCollection = db.collection("courses");

    //   users collection

    const usersCollection = db.collection("users");

    //   enrollment collection
    const enrollmentsCollection = db.collection("enrollments");
    //   ------------------------------------------------users apis----------------
    //   get all users api

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.json(result);
    });

    //   add user api
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const result = await usersCollection.insertOne(newUser);
      console.log("Hello there", result);
      res.json(result);
    });

    //   ---------------------------------course apis----------------------------

    //   get all courses
    app.get("/courses", async (req, res) => {
      const result = await coursesCollection.find().toArray();
      res.json(result);
    });

    //   add a course

    app.post("/courses", async (req, res) => {
      const newCourse = req.body;
      const result = await coursesCollection.insertOne(newCourse);
      res.json(result);
    });
      
      //   edit a course
      app.patch

    // Send a ping to confirm a successful connection
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`);
});
