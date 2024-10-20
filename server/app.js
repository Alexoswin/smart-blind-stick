const Express = require('express');
const locations = require('./mapCollection');
const app = Express();
const cors = require('cors');

app.use(Express.json());
app.use(Express.urlencoded({extended: true}))
app.use(cors())

app.get("/", cors(), (req, res) => {
    // Define your root route logic here
    res.json("Welcome to the server!");
  });
app.post("/location", async (req, res) => {
    const {lat, long,id} = req.body;
   
   
    
    const details = {
     
      lat:lat,
      long:long,
      id:id,
    };
    try {
      const result = await locations.findOneAndUpdate(
        { id: id },          
        details,             
        { upsert: true, new: true } 
      );
  
      res.status(200).json({ message: "Location upserted successfully!", data: result });
  
    } catch (e) {
      res.json("server error  " );
      console.error("Error:", e);
      
    }
  });
  
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });