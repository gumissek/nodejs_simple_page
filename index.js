import express from 'express';
import bodyParser from 'body-parser';
import {dirname} from 'path';
import { fileURLToPath } from 'url';


const app = express();
const port = 5000;
const current_folder  = dirname(fileURLToPath(import.meta.url));
const master_key='gumissek';
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


// OWN API

// GET ALL POSTS
app.get('/allPosts',(req,res)=>{
    if (postsList.length>0) {
        res.status(200).send(postsList);
    } else {
        res.status(404).send({error:'There are no posts'});
    }
});

// GET post by id

app.get('/post/:id',(req,res)=>{
    let post_id = req.params.id;
    let requested_post ='';

    for (let index = 0; index < postsList.length; index++) {
        const post = postsList[index];
        if (postsList[index].id==post_id) {
            requested_post=postsList[index];
        }
    };

    if (requested_post!='') {
        res.status(200).send(requested_post)
    }else{
        res.status(404).send({error:`Post with id:${post_id} doesnt exist`})
    }
});


// POST add new post

app.post('/post/add',(req,res)=>{
    if (req.body['title']&&req.body['description']&&req.body['author']) {
        let new_post = new postConstructor(generateId(postsList.length),req.body['title'],req.body['description'],req.body['author']);
        postsList.push(new_post);
        res.status(200).send({success:'New post has been added'});
    } else {
        res.status(404).send({error:'No complete data provided'})
    }
    
});

// PATCH edit existing post
app.patch('/post/:id',(req,res)=>{
    let post_id = req.params.id;
    let requested_post='';

    for (let index = 0; index < postsList.length; index++) {
        const post = postsList[index];
        if (post.id==post_id) {
            for(let key in req.body){
                post[key]=req.body[key];
            }
            requested_post=post;
        }
    };
    if (requested_post!='') {
        res.status(200).send(requested_post)
    }else{
        res.status(404).send({error:`Post with id:${post_id} doesnt exist`})
    }
});

// DELETE post by id
app.delete('/post/:id',(req,res)=>{
    let post_id = req.params.id;
    let requested_post_index='';

    for (let index = 0; index < postsList.length; index++) {
        const post = postsList[index];
        if (post.id==post_id) {
            requested_post_index=parseInt(index);
        }
    }
    if (requested_post_index!=='') {
        postsList.splice(requested_post_index,1);
        res.status(200).send({success:`Post with id:${post_id} has been removed`})
    }else{
        res.status(404).send({error:`Post with id:${post_id} doesnt exist in database`})
    }
});

// DELETE all posts 
app.delete('/allPosts',(req,res)=>{
    if (req.body.key===master_key) {
        postsList=[]
        res.status(200).send({success:'All posts have been removed'})
    } else {
        res.status(404).send({error:'Not authorized'})
    }
});

app.listen(port,()=>{
    console.log(`app is working on : http://localhost:${port}`)
});