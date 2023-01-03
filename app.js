//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const app = express();
const _ =require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// mongoose connection
mongoose.connect("mongodb+srv://sriramdivvi:test123@cluster0.zlxw0vo.mongodb.net/todolistdb",{useNewUrlParser:true} ,(err)=>{
  if(err){
    console.log("failed to connect");
  }
});
const itemschema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemschema);
const item1=new Item({
  name:"welcome to do list"
})
const item2=new Item({
  name:"hey there "
})
const item3=new Item({
  name:"It is last day of year"
})

const defaultitems=[item1,item2,item3];
     
//list items


      const listSchema={
        name:String,
        items: [itemschema]
      }
      const List =mongoose.model("List",listSchema);

// end of mongoose





//  get 
app.get("/", function(req, res){
    
  Item.find((err,founditems)=>{
    if(founditems.length===0){
      Item.insertMany([item1,item2,item3],(err)=>{
        if(err) console.log("hey there is a error");
        else{
          console.log("saved succesfully");
        }
      });
       
      res.render("list", {listTitle:"Today", newListItems: founditems});
    }
    else{
      res.render("list", {listTitle:"Today", newListItems: founditems,});
    }
  })
 
});

app.get("/:vvi",(req,res)=>{
  const listName=_.capitalize(req.params.vvi);
   List.findOne({name:listName},(err,foundlist)=>{
    if(!err){
     if(!foundlist){
      const newlist=new List({
        name:listName,
        items:defaultitems
      });
      
      newlist.save();
      res.redirect("/"+listName);
      // res.render("list", {listTitle:listName, newListItems: newlist.items});

     }
     else{
      
      res.render("list", {listTitle:listName, newListItems:foundlist.items});
     }
    }
   })
  })
  

// end of get

// start of post
 app.post("/",(req,res)=>{
  const inputValue=req.body.newItem;
  const btnName=req.body.list;
  const hidden=req.body.hidden;
  console.log("name of btnName"+ btnName);
 
  const newitem=new Item({
    name:inputValue
  })
  if(btnName==" Today" || btnName=="Today" ){
    newitem.save();
    res.redirect("/")
    
  }
  else{
  
      List.find({name:btnName},(err,content)=>{
        if(!err){
          console.log(content[0].items);
          content[0].items.push(newitem);
          content[0].save();
          res.redirect("/"+btnName);
        }
      })
  
  }

 })


////// delete

app.post("/delete",(req,res)=>{
  const checkedItemId=req.body.checked;
  const listName=req.body.listname;
  
  if(listName=="Today " || listName=="Today"){
    Item.findByIdAndRemove(checkedItemId,(err)=>{
      console.log("successfully removed");
      res.redirect("/");
    })
  }
  else{
    console.log(listName);
    console.log(listName.length);
    console.log(checkedItemId);
    let len=listName.length;
    let vall=listName.slice(0,len-1);

       List.findOneAndUpdate({name:vall},{$pull:{items:{_id:checkedItemId}}},(err,foundlist)=>{
        if(!err){
          res.redirect("/"+vall)
        }
       })
  }
 



  
})
  
  

// app.post("/delete",(req,res)=>{
//   // console.log(req.body.checked);
//   const itemid=req.body.checked;
//   Item.deleteOne({_id:itemid},(err)=>{
//       if(err) console.log("failded to delete");
//       else{

//         res.redirect("/");
//       }
//   })
  
// })
//
let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
