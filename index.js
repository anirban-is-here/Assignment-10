const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// middlewire
app.use(cors());
app.use(express.json());

// mongodb connection string

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lpak3ak.mongodb.net/next_db?appName=Cluster0`;
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

    //   ---------------------------------courses apis----------------------------

    //   get all courses api
    app.get("/courses", async (req, res) => {
      const result = await coursesCollection.find().toArray();
      res.json(result);
    });

    //   get course by id api
    app.get("/courses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coursesCollection.findOne(query);
      res.json(result);
    });

    //   add a course
    app.post("/courses", async (req, res) => {
      const newCourse = req.body;
      const result = await coursesCollection.insertOne(newCourse);
      res.json(result);
    });

    //   update a course

    app.put("/courses/:id", async (req, res) => {
      const updatedCourse = req.body;
      const result = await coursesCollection.updateOne(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: updatedCourse,
        }
      );
      res.json(result);
    });

    //   delete a course by id api
    app.delete("/courses/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await coursesCollection.deleteOne(query);
      res.json(result);
    });

    //   -------------------------------enrollment apis---------

    //   user enrolls in a course(post enroll)
    app.post("/enroll", async (req, res) => {
      const newEnrollment = req.body;
      const result = await enrollmentsCollection.insertOne(newEnrollment);
      res.json(result);
    });

    //   get enrolled courses for a user
    app.get("/enrollments/:userId", async (req, res) => {
      const querry = { userId: req.params.userId };
      const result = await enrollmentsCollection.find(querry).toArray();
      res.json(result);
    });
    // Send a ping to confirm a successful connection
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port} 🚀`);
});
