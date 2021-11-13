const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors')
require('dotenv').config()


const app = express()
const port = process.env.PORT || 3002


// MiddleWare 
app.use(cors())
app.use(express.json())


// Initialize Server 
app.get('/', (req, res) => {
  res.send("Server Running...")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fwb1h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Mongo Function 
const run = async () => {
    try{
        await client.connect();
        console.log("Database connected!")

        const db = client.db('watex')
        const productsCol = db.collection('products')
        const reviewsCol = db.collection('reviews')
        const saleCol = db.collection('sales')
        const userCol = db.collection('users')
        // Product Database 
        //
        // Getting Products 
        app.get('/products', async(req, res) => {
            const cursor = productsCol.find({})
            const products = await cursor.toArray();
            res.send(products)
        })
        // Getting Single Product 
        app.get('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const singleProduct = await productsCol.findOne(query)
            res.send(singleProduct)
        })
        
        // Getting Reviews 
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCol.find({})
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        // Getting Sale Details 
        app.get('/sales', async(req, res) => {
            const cursor = saleCol.find({})
            const result = await cursor.toArray()
            res.json(result)
        })
        // Getting Sale Data using email 
        app.get('/sale', async(req, res) =>{
            const email = req.query.email;
            const query = {email : email}
            const cursor = saleCol.find(query)
            const sale = await cursor.toArray()
            res.json(sale)
        })


        // Get Admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email : email};
            const user = await userCol.findOne(query)
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin})
        })

        // Posting Data 
        // Posting Customer 
        app.post('/sale', async(req, res)=>{
            const sale = req.body;
            const result = await saleCol.insertOne(sale)
            res.json(result)
        })

        // Post Product 
        app.post('/products', async(req, res) => {
            const product = req.body;
            const cursor = await productsCol.insertOne(product)
            res.json(cursor)
        })

        // Posting User Data
        app.post('/users', async(req, res) =>{
            const user = req.body;
            const cursor = await userCol.insertOne(user)
            res.json(cursor)
        })

        // Upsert Firebase Logged User 
        app.put('/users', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email}
            const option = { upsert : true}
            const updataDoc = { $set: user}
            const result = await userCol.updateOne(filter, updataDoc, option)
            res.json(result)
        })
        app.put('/users/admin', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email}
            const updataDoc = { $set: {role: 'admin'}}
            const result = await userCol.updateOne(filter, updataDoc)
            res.json(result)
        })
        app.put('/sales/:id', async(req, res) => {
            const id = req.params.id;
            const data = req.body
            console.log(data)
            const filter = {_id:ObjectId(id)}
            const option = { upsert : true}
            const updataDoc = { $set: {status: 'Shipped'}}
            const result = await saleCol.updateOne(filter, updataDoc, option)
            res.json(result)
        })


        // Deleting Data 
        // Cancel Order by User 
        app.delete('/sales/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id) }
            const result = await saleCol.deleteOne(query)
            res.json(result)
        })

    }
    finally{

    }
}
run().catch(console.dir)



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})