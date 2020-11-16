const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-sahil:test12345@cluster0.bwszy.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true})
.then(() => {
  console.log("Mongodb connected");
})
.catch(err => console.log(err))

const itemsSchema={
  name:String
};

const Item=mongoose.model("Item",itemsSchema);


const item1=new Item({
  name:"Welcome to the todoList"
});

const item2=new Item({
  name:"Hit the '+' sign to add a new item"
});

const item3=new Item({
  name:"<-- Hit the checkbox to delete an item"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/", (req,res)=>{

  Item.find({},function(err,foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems,(err)=>{
          if(err){
            console.log(err);
          }else{
            console.log("Succesfully added all the documents!");
          }
    });
    res.redirect("/");
  }
  else{
    res.render("list",{listTitle:"Today",newListItems:foundItems});
  }
  });

});

app.get("/:customListName",(req,res)=>{
  const customListName=_.capitalize(req.params.customListName);
 
  List.findOne({name:customListName},(err,foundList)=>{
     if(!err){
       if(!foundList){
         //create new list
          const list=new List({
          name:customListName,
          items:defaultItems
        });
      
        list.save();
        res.redirect("/"+customListName);

       }else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        //shows existing list
       }
     }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;

  const item=new Item({
      name:itemName
  });
  
  if(listname==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listname},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listname);
    });
  }
});

app.post("/delete",(req,res)=>{
  const checkeditemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){

    Item.findByIdAndRemove(checkeditemId,(err)=>{
      if(!err){
        console.log("success");
        if(list)
        res.redirect("/");
      }
    })
  }
  else{ 
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemId}}},{useFindAndModify:false},(err,foundList)=>{
      if(!err){
         res.redirect("/"+listName);
      }
    })
  }
 
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server has started successfully");
});
