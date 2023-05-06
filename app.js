//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date=require(__dirname+"/date.js");
const _=require("lodash");
console.log(date());
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://lakshmisriramadari1427:qhbiuawIMvcjEpDZ@cluster0.mrxx9gr.mongodb.net/todoDB').then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.log('Error connecting to MongoDB', error);
});

  const todoSchema =  new mongoose.Schema ({
    name: String
});

const Todo = mongoose.model("Todo",todoSchema);

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const item1=new Todo({
  name:"Welcome"
});
const item2=new Todo({
  name:"Hit the + button to add a new item."
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
const listSchema =  new mongoose.Schema ({
  name: String,
  items:[todoSchema]
});

const List= mongoose.model("List",listSchema);
const day =date();
app.get("/", function(req, res){
  
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
  const listname =req.body.list;
  const newitem= new Todo({
    name:item
  });
  if(listname===day){
  newitem.save();
  res.redirect("/"); 
  }
  else{
    List.findOne({name: listname}) 
  .then((foundList)=>{
    foundList.items.push(newitem);
    foundList.save();
    res.redirect("/"+listname);
  }).catch(function (err) {
    console.log(err);
  });
  }
  // if(req.body.list==="WorkList"){
  //   workitems.push(item);
  //   res.redirect("/work");
  // }
  // else{
  // items.push(item);
  //  res.redirect("/");
  // }
});
app.get("/:customlistName", function(req,res){
  //adding new list that completed by the user
 const customlistName = _.capitalize(req.params.customlistName);
 
  List.findOne({name: customlistName}) 
  .then((foundList)=> 
  {
     if(!foundList)
     {
       //Creating a new list 
       const list = new List({
         name: customlistName,
         items: defaultitems
      });
      list.save();
      res.redirect("/" + customlistName);
     }
     else
     {
       //Show an existing list
       res.render("list", {listtitle: foundList.name, newlistitems: foundList.items
      });
     }
  })
  .catch((err)=>{
    console.log(err);
  })
 }); 
 app.post("/delete",function(req,res){
  const deleted=req.body.checkbox;
  const delnlname=req.body.listname;
  if(delnlname===day){
    Todo.findByIdAndRemove(deleted).then(() => {
      console.log('successfully deleted');
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:delnlname},{$pull:{items:{_id:deleted}}}).then(()=>{
      res.redirect("/"+delnlname);
    });
  }
  
})

app.get("/about",function(req,res){
  res.render("about");
});
app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
