import express from 'express';
import bodyParser from 'body-parser';
import {dirname} from 'path';
import { fileURLToPath } from 'url';


const app = express();
const port = 5000;
const current_folder  = dirname(fileURLToPath(import.meta.url));
let postsList=[];


function postConstructor(id,title,description,author,) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.author = author;
};

function generateId(number) {
    if (postsList.length>0){
        for (let index = 0; index < postsList.length; index++) {
            let post_id = postsList[index].id;
            if (post_id==number){
                return generateId(number+1);
            }
        }
        return number
    }else{
        return number
    }
   
}

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));


app.get('/',(req,res)=>{
    let data={
        posts:postsList,
    };
    res.render('index.ejs',data);
});

app.get('/addPost',(req,res)=>{
    res.render('addPost.ejs');
});

app.post('/addPost',(req,res)=>{
    let post = new postConstructor(generateId(postsList.length),req.body['title'],req.body['description'],req.body['author']);
    postsList.push(post);
    res.redirect('/');
});

app.get('/deletePost',(req,res)=>{
    let postId = req.query.post_id;
    postsList.forEach(element=>{
        let item_index = postsList.indexOf(element);
        if (element.id==postId) {
            postsList.splice(item_index,1);
        }
    });
    res.redirect('/');
});

app.get('/editPost',(req,res)=>{
    let postId= req.query.post_id;
    let requested_post= '';
    postsList.forEach(element=>{
        if (element.id==postId) {
            requested_post=element;
        }
    });
    res.render('editPost.ejs',{requested_post:requested_post})
});

app.post('/editPost',(req,res)=>{
    let postId= req.query.post_id;
    postsList.forEach(element=>{
        if (element.id==postId) {
            element.title= req.body['title'];
            element.description = req.body['description'];
            element.author = req.body['author'];
        }
    });

    res.redirect('/');
});

app.listen(port,()=>{
    console.log(`app is working on port: ${port}`)
});