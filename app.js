const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const res = require('express/lib/response');
const _ = require('lodash');
require('dotenv').config();


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect(process.env.CLUSTER_0);

const itemSchema = new mongoose.Schema ({
    name: String
});

const listSchema = new mongoose.Schema ({
    name: String,
    items: [itemSchema]

});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

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

const day = date.getDay();

app.get('/', (req,res) => {
    
    Item.find({}, function(err,foundItems) {
        if (foundItems.length === 0 ) {
            Item.insertMany(defaultItems, function (err) {
                err ? console.log(err) : console.log("default items add successful")
            });
            res.redirect("/");
        } else {
            res.render('list', {listTitle: day, newListItems:foundItems});
        }
    });

})

//dynamic routes for custom lists
app.get("/:customListName", function (req,res){ 
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err,foundList){
       if (!err){
           if (!foundList){
               //create a new list
               const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);

           } else {
               //show an existing list
               res.render("list", {listTitle: customListName, newListItems: foundList.items});
           }
       }
    })
});

app.post("/", function(req,res){
    const itemName = req.body.newEntry;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });

    if (listName === day){
        item.save();
        res.redirect("/");

    } else {
        List.findOne({name: listName} , function(err,foundList){
            foundList.items.push(item);
            foundList.save();

            res.redirect('/' + listName);
        })
    }
})

app.post("/delete", function(req,res){
    const checkedItemID = req.body.checkedBox;
    const listName = req.body.listName;

    if (listName === day){
        Item.findByIdAndDelete(checkedItemID, function(err,checkedItemID){
            if(!err){
                res.redirect("/");
            }
        })
    } else{
        List.findOneAndUpdate({name: listName},{ $pull: { items: {_id: checkedItemID} } }, function(err,foundList){
            if(!err){
                res.redirect('/' + listName);
            }
        });
    }

})

let port = process.env.port
if (port == null || ""){
    port = 8000;  
}

app.listen(port, () => {
    console.log(`Server running on ${port}`);
})