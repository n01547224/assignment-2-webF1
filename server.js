const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
var app = express();
const exphbs = require('express-handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.hbs', exphbs.engine({
  extname: '.hbs', helpers: {
    eq: function (arg1, arg2) {
      return arg1 === arg2 ? true : false;
    },
    isArray: function (value) {
      return Array.isArray(value);
    }
  }
}));
app.set('view engine', 'hbs');

var jsonDataLoaded = false;
let jsonData = null;


// Use bodyParser middleware to parse JSON data
app.use(bodyParser.urlencoded({ extended: true }));

// Function to load JSON data from a file
function loadJSONData() {
  console.log("inside jsondataload");
  const dataFilePath = path.join(__dirname, 'ite5315-A1-Car_sales.json');
  fs.readFile(dataFilePath, (err, data) => {
    if (err) {
      console.error('Error loading JSON data:', err);
    } else {
      jsonDataLoaded = true;
      jsonData = JSON.parse(data);
    }
  });
}

app.get('/', (req, res) => {
  const yourInfo = 'Saeeduddin / N01547224';
  //res.send(`Hello, ${yourInfo}!`);
  res.render('page', { data: yourInfo })
});

app.get('/about', (req, res) => {
  const resumeFilePath = path.join(__dirname, 'resume.pdf');
  console.log(resumeFilePath);
  res.sendFile(resumeFilePath);
});

app.get('/data', (req, res) => {
  loadJSONData();
  if (jsonDataLoaded) {
    res.render('page', { data: 'JSON data is loaded and ready!' });
    console.log(jsonData);
  }
  else {
    //return res.status(500).json({ error: 'Unable to load JSON data.' });
    res.render('error', { message: 'Unable to load JSON data.' });
  }
});

app.get('/data/invoiceNo/:index', (req, res) => {
  // LOading the json data
  loadJSONData();
  const { index } = req.params;
  // Converting the index to an integer
  const recordNo = parseInt(index);
  if (isNaN(recordNo) || recordNo < 0) {
    //return res.status(400).json({ error: 'Invalid index number.' });
    res.render('page', { data: 'Invalid index number.' })
  }
  if (jsonData) {
    //Access the jsonData after it has been loaded
    const carSales = jsonData.carSales;
    // Check if the index is valid
    if (recordNo < carSales.length) {
      const invoiceNo = carSales[recordNo].InvoiceNo;
      res.render('page', { data: `InvoiceNo: ${invoiceNo} for Index: ${index}` });
    }
    else {
      //return res.status(404).json({ error: 'Record not found.' });
      res.render('page', { data: `Record not found. for index: ${index}` })

    }
  } else {
    //return res.status(500).json({ error: 'JSON data not loaded yet.' });
    res.render('error', { message: 'Unable to load JSON data try reloading the page' });
  }
});

app.get('/search/invoiceNo', (req, res) => {
  // res.send(`
  //   <html>
  //     <head>
  //       <style>
  //         body {
  //           font-size: 24px;
  //           text-align: center;
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <h1>Search for InvoiceNo</h1>
  //       <form action="/search/invoiceNo" method="post">
  //         <label for="invoiceNo">InvoiceNo:</label>
  //         <input type="text" id="invoiceNo" name="invoiceNo" required>
  //         <br><br>
  //         <input type="submit" value="Search">
  //       </form>
  //     </body>
  //   </html>
  // `);
  res.render('page', { data: 'invoice' })
});

app.post('/search/invoiceNo', (req, res) => {
  loadJSONData();
  const { invoiceNo } = req.body;
  if (!jsonDataLoaded) {
    res.render('error', { message: 'JSON data not loaded yet. Please try again!!' });
  }
  if (jsonData) {
    const carSales = jsonData.carSales;
    // Find the record that matches the provided InvoiceNo
    const matchingRecord = carSales.find((record) => record.InvoiceNo === invoiceNo);
    if (matchingRecord) {
      //return res.json(matchingRecord);
      res.render('jsondataprint', { data: matchingRecord});
    } else {
      // return res.status(404).json({ error: 'InvoiceNo not found.' });
      res.render('error', { message: 'InvoiceNo not found!! Check the invoice number' });
    }
  } else {
    // return res.status(500).json({ error: 'JSON data not loaded yet.' });
    res.render('error', { message: 'JSON data not loaded yet. Please try again!!' });
  }
});


app.get('/search/manufacturer', (req, res) => {
  // res.send(`
  //     <html>
  //       <head>
  //         <style>
  //           body {
  //             font-size: 24px;
  //             text-align: center;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <h1>Search for Cars by Manufacturer</h1>
  //         <form action="/search/manufacturer" method="post">
  //           <label for="manufacturer">Manufacturer:</label>
  //           <input type="text" id="manufacturer" name="manufacturer" required>
  //           <br><br>
  //           <input type="submit" value="Search">
  //         </form>
  //       </body>
  //     </html>
  //   `);
  res.render('page', { data: 'manufacturer' })

});

app.post('/search/manufacturer', (req, res) => {
  loadJSONData();
  const { manufacturer } = req.body;
  // Ensure the JSON data is loaded
  if (!jsonDataLoaded) {
    res.render('error', { message: 'JSON data not loaded yet. Please try again!!' });
  }
  if (jsonData) {
    // Using the filer method to get all records
    const cars = jsonData.carSales;
    const matchingCars = cars.filter((car) => car.Manufacturer.includes(manufacturer));

    if (matchingCars.length > 0) {
      const displayedCars = [];
      for (let i = 0; i < matchingCars.length; i++) {
        const car = matchingCars[i];
        displayedCars.push({
          InvoiceNo: car.InvoiceNo,
          Manufacturer: car.Manufacturer,
          Model: car.Model,
          Latest_Launch: car.Latest_Launch
        });
      }
      // const formattedJSON = JSON.stringify(displayedCars, null, 2);
      // res.setHeader('Content-Type', 'application/json');
      // res.send(formattedJSON);
      res.render('jsondataprint', { data: displayedCars});
    } else {
      //res.status(404).json({ error: 'No matching cars found.' });
      res.render('error', { message: 'No matching cars found.' });
    }
  }
});


//Handling 404 (Not Found) errors
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <style>
          body {
            font-size: 24px;
            text-align: center;
            color: red;
            margin-top:250px;
          }
        </style>
      </head>
      <body>
        <h1>Error 404</h1>
        <p style="font-size: 36px;">Route not found</p>
      </body>
    </html>
  `);
});

// Start the server on port 5500
// Define a route for the home page (http://localhost:5500/)
const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
