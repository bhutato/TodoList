const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const res = require('express/lib/response');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema ({
    name: String
});

const workItemSchema = new mongoose.Schema ({
    name: String
});

const Item = mongoose.model("Item", itemSchema);
const WorkItem = mongoose.model("WorkItem", workItemSchema);

const item1 = new Item ({
    name: "Welcome to your todo list"
});

const item2 = new Item ({
    name: "Hit the + button to add a new list"
});

const item3 = new Item ({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];
const workItems = [];

let route = "";

app.get('/', (req,res) => {
    const day = date.getDay();
    
    Item.find({}, function(err,foundItems) {
        if (foundItems.length === 0 ) {
            Item.insertMany(defaultItems, function (err) {
                err ? console.log(err) : console.log("default items add successful")
            });
            res.redirect("/");
        } else {
            res.render('list', {listTitle: day, newListItems:foundItems, route:route});
        }
    });

})

app.post("/", function(req,res){
    const itemName = req.body.newEntry;

    const item = new Item ({
        name: itemName
    });

    item.save();
    
    res.redirect("/");
})

app.post("/delete", function(req,res){
    const checkedItemID = req.body.checkedBox;

    Item.findByIdAndDelete(checkedItemID, function(err,checkedItemID){
        err ? console.log(err) : console.log(checkedItemID + "deleted!")
        res.redirect("/");
    })
    
})

app.get("/work", function(req,res){
    const workTitle = "Work List";
    route = "work";
    res.render('list', {listTitle: workTitle, newListItems: workItems, route:route});
})

app.post("/work", function(req,res){
    const itemName = req.body.newEntry;

    const workItem = new WorkItem ({
        name: itemName
    });

    workItem.save();
    
    res.redirect("/work");
})

app.get("/about",function(req,res){
    res.render("about");
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
})