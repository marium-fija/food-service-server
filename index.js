const express = require('express');
const cors = require('cors');   
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000


// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eey3bcc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesCollection = client.db("foodServiceDB").collection("services");
    const usersCollection = client.db("foodServiceDB").collection("users");

    app.get('/services', async(req, res) => {
      const services = await servicesCollection.find({}).limit(6).toArray();
      res.send(services);
    })

    app.get('/all-services', async(req, res) => {
      const services = await servicesCollection.find({}).toArray(); 
      res.send(services);
    });

    app.post("/add-service", async (req, res) => {
        const serviceData = req.body;
        serviceData.addedDate = new Date(); 
        const result = await servicesCollection.insertOne(serviceData);
        res.send(result);
      });

       //  Get single service details by ID
      app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const {ObjectId} = require('mongodb');
        const query = {_id: new ObjectId(id) };
        const service =await servicesCollection.findOne(query);
        res.send(service);
      });

      //  Add new review to a service
      // app.post('/services/:id/reviews', async (req, res) => {
      //   const id = req.params.id;
      // const { ObjectId } = require('mongodb');
      // const review = req.body;

      // const filter = { _id: new ObjectId(id) };
      // const updateDoc = {
      //   $push: { reviews: review }
      // };

      // const result = await servicesCollection.updateOne(filter, updateDoc);
      // res.send(result);
      // });

      //  Update a service (only by owner)
    //   app.put('/services/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const { ObjectId } = require('mongodb');
    //   const updatedService = req.body;

    //   const filter = { _id: new ObjectId(id) };
    //   const updateDoc = {
    //     $set: {
    //       foodImg: updatedService.foodImg,
    //       foodTitle: updatedService.foodTitle,
    //       restaurantName: updatedService.restaurantName,
    //       website: updatedService.website,
    //       description: updatedService.description,
    //       category: updatedService.category,
    //       price: updatedService.price
    //     }
    //   };

    //   const result = await servicesCollection.updateOne(filter, updateDoc);
    //   res.send(result);
    // });


     //  Delete a service (only by owner)
    // app.delete('/services/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const { ObjectId } = require('mongodb');
    //   const query = { _id: new ObjectId(id) };

    //   const result = await servicesCollection.deleteOne(query);
    //   res.send(result);
    // });

       // Users related APIs

    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const userProfile = req.body;
      const result = await usersCollection.insertOne(userProfile);
      res.send(result);
    })

    app.patch('/users', async (req, res) => {
      const {email, lastSignInTime} = req.body;
      const filter = {email : email}
      const updatedDoc = {
        $set: {
          lastSignInTime: lastSignInTime
        }
      }

      const result =await usersCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Food Service Review webApplication is ready')
})

app.listen(port, () => {
  console.log(`Food Service Review server is on running on port ${port}`)
})