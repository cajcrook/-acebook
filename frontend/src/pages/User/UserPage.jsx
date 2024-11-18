import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getPosts } from "../../services/posts";
import { getUserInfo } from "../../services/user";
import NavBar from "../../components/NavBar";
import ListOfPosts from "../../components/ListOfPosts";
import UserInfo from "../../components/UserInfo";
import Username from "../../components/UserName";
import { getFriends } from "../../services/friends";
import { Button } from "../../components/Button";
import { handleDeleteFriendClick } from "../../handlers/friends";
import { handleAddFriendClick } from "../../handlers/friends";

export function UserPage() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
  });
  const [friends, setFriends] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
  const navigate = useNavigate();
  const { userId } = useParams();
  const [likeState, setLikeState] = useState(false);
  const [deleted, setDelete] = useState(false);
  const [loggedInUser, SetLoggedInUser] = useState([])

  // function to get users posts
  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = token !== null;
    if (loggedIn) {
      getPosts(token, userId)
        .then((data) => {
          setPosts(data.posts);
          localStorage.setItem("token", data.token);
        })
        .catch((err) => {
          console.error(err);
          navigate("/login");
        });
    }
  }, [navigate, deleted, userId, likeState]);

  // function to get user information
  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = token !== null;
    if (loggedIn) {
      getUserInfo(token, userId)
        .then((data) => {
          setUser({
            _id: data.userInfo[0]._id,
            username: data.userInfo[0].username,
            firstName: data.userInfo[0].firstName,
            lastName: data.userInfo[0].lastName,
            birthday: data.userInfo[0].birthday,
          });
          // console.log(data.userInfo[0])
          localStorage.setItem("token", data.token);
        })
        .catch((err) => {
          console.error(err);
          // navigate("/login");
        });
    }
  }, [navigate, userId]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = token !== null;
    if (loggedIn) {
      getUserInfo(token)
        .then((data) => {
          SetLoggedInUser({
            _id: data.userInfo[0]._id,
          });
          // console.log(data.userInfo[0])
          localStorage.setItem("token", data.token);
        })
        .catch((err) => {
          console.error(err);
          // navigate("/login");
        });
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loggedIn = token !== null;
    if (loggedIn) {
      getFriends(token)
        .then((data) => {
          setFriends(data.friends);
          localStorage.setItem("token", data.token);
        })
        .catch((err) => {
          console.error(err);
          navigate("/login");
        });
    }
  }, [navigate]);
  console.log("friends", friends);
  useEffect(() => {
    if (friends) {
      const hasId = friends.some((friend) => friend._id === user._id);
      setIsFriend(hasId);
    }
  }, [user, friends]);
  console.log(isFriend);

  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return;
  }
  return (
    <>
      <NavBar />
      <Username username={user.username} />
      <UserInfo
        firstName={user.firstName}
        lastName={user.lastName}
        birthday={user.birthday}
      />
      <br />
      {isFriend && (
        <Button
          handleClick={() => handleDeleteFriendClick(navigate, userId)}
          buttonText={"Remove Friend"}
        />
      )}
      {!isFriend && (
        <Button
          handleClick={() => handleAddFriendClick(navigate, userId)}
          buttonText={"Add Friend"}
        />
      )}
      <h2>Posts</h2>
      <ListOfPosts
        posts={posts}
        userId={loggedInUser._id}
        setDelete={setDelete}
        likeState={likeState}
        setLikeState={setLikeState}
      />
    </>
  );
}
