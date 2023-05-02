//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date=require(__dirname+"/date.js");
console.log(date());
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/todoDB').then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.log('Error connecting to MongoDB', error);
});

  const todoSchema =  new mongoose.Schema ({
    name: String
});

const Todo = mongoose.model("Todo",todoSchema);
let items=["Buy Food","Cook Food",
"Eat Food"];
let workitems=[];
const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const item1=new Todo({
  name:"welcome"
});
const item2=new Todo({
  name:"hitt the + button to add a new item."
});
const item3=new Todo({
  name:"<--Hit this to delete an item. "
});

const defaultitems = [item1,item2,item3];
//  Todo.insertMany(defaultitems).then(function(){
//   console.log(defaultitems);
// })
// .catch(function(err){
//   console.log(err);
// }); 

app.get("/", function(req, res){
  let day =date();
  Todo.find({}).then(founditem => {
    if(founditem.length===0){
      return Todo.insertMany(defaultitems);
    }
    else{
      return founditem;
    }
  }).then(saveditem => {
    res.render("list",{listtitle:day,newlistitems:saveditem});
  }).catch(err => console.log(err));
});
app.post("/",function(req,res){
  let item= req.body.newItem;
  const newitem= new Todo({
    name:item
  });
  newitem.save();
  res.redirect("/"); 
  // if(req.body.list==="WorkList"){
  //   workitems.push(item);
  //   res.redirect("/work");
  // }
  // else{
  // items.push(item);
  //  res.redirect("/");
  // }
});
app.post("/delete",function(req,res){
  const deleted=req.body.checkbox;
  Todo.findByIdAndRemove(deleted).then(() => {
    console.log('successfully deleted');
  });
  res.redirect("/");
})
app.get("/work",function(req,res){
    res.render("list",{listtitle:"WorkList",newlistitems:workitems});
});
app.get("/about",function(req,res){
  res.render("about");
});
app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
