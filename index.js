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

app.get("/", (req, res) => {
  res.send("smart Server is runnning~~!!");
});

 async function run() {
   try {
     // Connect the client to the server	(optional starting in v4.7)
     await client.connect();
     const db = client.db('next_db');

     //   course collection
     const coursesCollection = db.collection('courses');

     //   users collection

     const usersCollection = db.collection('users');

     //   enrollment collection
     const enrollmentsCollection = db.collection('enrollments');
     //   ------------------------------------------------users apis----------------
     //   get all users api

       app.get("/users", async (req, res) => {
         
       const result = await usersCollection.find().toArray();
       res.json(result);
     });

     //   add user api
     app.post("/users", async (req, res) => {
       console.log(req.body);
       const newUser = req.body;
       const query = { _id: newUser._id };
       let user = await usersCollection.findOne(query);
       if (!user) {
         const result = await usersCollection.insertOne(newUser);
         console.log("not in db, inserting......");
       } else {
         console.log("already in db");
       }

       console.log("Hello there", result);
       res.json(result);
     });

     //   ---------------------------------courses apis----------------------------

     //   get all courses api
     app.get("/courses", async (req, res) => {
       const email = req.query.email;
       const query = {};
       if (email) {
         query.email = email;
       }
       const result = await coursesCollection.find(query).toArray();
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
       const {
         title,
         imageUrl,
         price,
         duration,
         category,
         description,
         instructorId,
         isFeatured,
       } = req.body;

       const newCourse = {
         title,
         imageUrl,
         price: Number(price),
         duration,
         category,
         description,
         instructorId,
         isFeatured: Boolean(isFeatured),
         createdAt: new Date(),
         enrolledStudents: [],
       };
       const result = await coursesCollection.insertOne(newCourse);
       res.json(result);
     });

     //   update a course

     app.put("/courses/:id", async (req, res) => {
       const {
         title,
         imageUrl,
         price,
         duration,
         category,
         description,
         isFeatured,
       } = req.body;

       const updatedCourse = {
         ...(title && { title }),
         ...(imageUrl && { imageUrl }),
         ...(price !== undefined && { price: Number(price) }),
         ...(duration && { duration }),
         ...(category && { category }),
         ...(description && { description }),
         ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
         updatedAt: new Date(),
       };
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
     app.post("/courses/:id/enroll", async (req, res) => {
       const courseId = req.params.id;
       const { userId } = req.body;
       // add course to user
       try {
         await usersCollection.updateOne(
           { _id: userId },
           { $addToSet: { enrolledCourses: courseId } }
         );
         //  add user to course
         await coursesCollection.updateOne(
           { _id: new ObjectId(courseId) },
           { $addToSet: { enrolledStudents: userId } }
         );
         res.json({ message: "enrollment successful" });
       } catch (error) {
         console.log(error);
         res.status(500).json({ message: "Enrollment failed" });
       }
     });

     //   get enrolled courses for a user
     app.get("/users/:id/enrolled", async (req, res) => {
       const userId = req.params.id;

       try {
         const user = await usersCollection.findOne({ _id: userId });
         if (!user) return res.status(404).json({ message: "user not found" });
         const enrolledCourseIds = user.enrolledCourses || [];
         if (enrolledCourseIds.length === 0) {
           return res.json([]);
         }

         //  fetch all courses enrolled by an user
         const courses = await coursesCollection
           .find({
             _id: { $in: enrolledCourseIds.map((id) => new ObjectId(id)) },
           })
           .toArray();
         res.json(courses);
       } catch (error) {
         console.log(error);
         res.status(500).json({ message: "failed to fetch enrolled courses" });
       }
     });

     //  get all students enrolled in a course
     app.get("/courses/:id/students", async (req, res) => {
       const courseId = req.params.id;

       try {
         const course = await coursesCollection.findOne({
           _id: new ObjectId(courseId),
         });
         if (!course)
           return res.status(404).json({ message: "course not found" });
         const enrolledUserIds = course.enrolledStudents || [];
         if (enrolledUserIds.length === 0) {
           return res.json([]);
         }

         //  fetch all students enrolled in a course

         const users = await usersCollection
           .find({
             _id: { $in: enrolledUserIds },
           })
           .toArray();
         res.json(users);
       } catch (error) {
         console.log(error);
         res.status(500).json({ message: "failed to fetch enrolled users" });
       }
     });
       
       app.listen(port, () => {
         console.log(`Smart server is running on port: ${port}`);
       });
       
       
    //  await client.db("admin").command({ ping: 1 });
     console.log("✅ MongoDB connection successful");
     // Send a ping to confirm a successful connection
   } finally {
     // Ensures that the client will close when you finish/error
   }
}
    

run().catch(console.dir);

