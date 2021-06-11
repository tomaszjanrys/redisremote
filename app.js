const express = require('express');
const exphb = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

//set port
const port = process.env.PORT || 8080;

//init app

const app = express();

// Create Redis
//let client = redis.createClient();
//client.on('connect', function(){
//console.log("Connected to Redis ....")
//})

var client = redis.createClient ({
    host : 'eu1-equipped-sheep-32188.upstash.io',
    port : '32188',
    password: '77aac4bc126041b8a8a4b1f0f7a0d92a'
    });



//View engine

app.engine('handlebars', exphb({defaultLayout : 'main'}));
app.set('view engine', 'handlebars');

//Body parser 
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({extended : false}));


//Method overRide
app.use(methodOverride('_method'));

//search home
app.get('/', function(req,res,next){
res.render('searchuser')
})

//search processing 
app.post('/user/search', function(req, res,next){
let id = req.body.id;
client.hgetall(id,function(err,obj){
    if(!obj){
        res.render('searchuser',{
            error: 'user does not exist'
        })
    } else {
            obj.id = id;
            res.render('detail', {
                user : obj
            })
    }
})
})

//add user poage
app.get('/user/add', function(req,res,next){

    res.render('adduser')
})

//Process add user page
app.post('/user/add', function(req,res,next){

    let id = req.body.id;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;

    client.hmset(id , [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], function(err,reply){
        if(err){
            console.log(err);
        } else{
            console.log(reply);
            res.redirect('/');
        }

    })

})

//delete id 

app.delete('/user/delete/:id', function(req,res,next){
    client.del(req.params.id);
    res.redirect('/');

})

app.listen(port,function(){
console.log('Server started on port : ' + port)
})