var express = require('express');
const fs = require('fs');
const path = require('path');
var app = express();
const exphbs = require('express-handlebars');
const port = process.env.port || 3000;
app.use(express.static(path.join(__dirname, 'public')));

app.engine('.hbs', exphbs.engine({ extname: '.hbs', helpers: {
    notZero: function(value) {
      return value != 0;
    }
  }}));

app.set('view engine', 'hbs');
var jsonDataLoaded = false;
let jsonData = null;

// Function to load JSON data from a file
function loadJSONData() {
    console.log("inside jsondataload");
    const dataFilePath = path.join(__dirname, 'SuperSales.json');
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error('Error loading JSON data:', err);
        } else {
            jsonDataLoaded = true;
            jsonData = JSON.parse(data);
        }
    });
}

app.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});
app.get('/users', function (req, res) {
    res.send('respond with a resource');
});

//ASSIGNMENT-2-STEP7
app.get('/viewData', (req, res) => {
    loadJSONData();
    if (jsonData != null) {
        res.render('salesTable', { salesData: jsonData });
    } else {
        res.render('error', { message: 'JSON data not loaded yet. Please try again by refreshing the page!!' });
    }
});

app.get('*', function (req, res) {
    res.render('error', { title: 'Error', message: 'Wrong Route' });
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})