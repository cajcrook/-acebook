const Post = require("../models/post");
const { generateToken } = require("../lib/token");
const User = require("../models/user");
const { tokenChecker } = require('../middleware/tokenChecker')

async function getAllPosts(req, res) {
    try {
      const token = generateToken(req.user_id); 
      let query = {}; 
      if (req.query.userId) {
        const user = await User.findById(req.query.userId);
        // If the user is found, add the user filter to the query
        if (user) {
          query.user = user._id;
        }
      }
      // Find posts (filtered by user if applicable, or all posts if no user or user not found)
      // const posts = await Post.find(query).populate('user', 'username', 'firstName'); should be a list like [username, firstName]
      const posts = await Post.find(query).populate('user', 'username'); 
      res.status(200).json({ posts: posts, token: token });
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts", error: error.message });
    };
  };

async function createPost(req, res) {
  const postObject = req.body
  postObject.user = req.user_id
  const post = new Post(postObject);
  post.save();

  const newToken = generateToken(req.user_id);
  res.status(201).json({ message: "Post created", token: newToken });
}

async function deletePost(req, res) {
  try {
    const postId = req.params.id;

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization check
    if (post.user.toString() !== req.user_id) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    // Delete the post
    await post.deleteOne(post);
    const newToken = generateToken(req.user_id);

    
    res.status(200).json({ message: "Post deleted", token: newToken });
  } catch (error) {
    console.error("Error deleting post:", error); // Log the error
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

async function addLike(req, res) {
  try {
    const postId = req.params.id;
    const token = generateToken(req.user_id); 
    // Find the user
    const user = await User.findById(req.user_id)

    // Find the post by ID
    const post = await Post.findById(postId);
    
    // if post not found
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // add the like
    console.log("user id api", user._id)
    post.likes.push(user._id)
    // await post.updateOne({$addToSet : {likes: req.user_id}})
    await post.save()
    console.log("likes", post.likes)
    const newToken = generateToken(req.user_id);

    res.status(200).json({ message: "Post deleted", token: newToken });


  } catch (error) {
    console.error("Error adding like to the post:", error); // Log the error
    res.status(500).json({ message: "Server error", error: error.message });
  }

};

async function deleteLike(req, res) {
  try {
    const postId = req.params.id;
    const token = generateToken(req.user_id); 
    // Find the user
    const user = await User.findById(req.user_id)

    // Find the post by ID
    const post = await Post.findById(postId);
    
    // if post not found
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // add the like
    post.likes.pull(user._id)
    await post.save()
    console.log("likes", post.likes)
    const newToken = generateToken(req.user_id);

    res.status(200).json({ message: "Post deleted", token: newToken });


  } catch (error) {
    console.error("Error adding like to the post:", error); // Log the error
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const PostsController = {
  getAllPosts,
  createPost,
  deletePost,
  addLike,
  deleteLike
};

module.exports = PostsController;