const Express = require('express');
const location = require('./mapCollection');
const helmet = require('helmet');
const cors = require('cors');

const app = Express();

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cors());

// Use Helmet to set Content Security Policy
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    fontSrc: ["'self'", "https://smart-blind-stick-4.onrender.com"],
    scriptSrc: ["'self'"], // Adjust as needed
  }
}));

app.get("/", (req, res) => {
  // Define your root route logic here
  res.json("Welcome to the server!");
});

app.post("/location", async (req, res) => {
  const { lat, long, id } = req.body;

  const details = {
    lat: lat,
    long: long,
    id: id,
  };

  try {
    await location.insertMany([details]);
    res.json("done");
  } catch (e) {
    res.json("server error");
    console.error("Error:", e);
  }
});

// Start the server
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
