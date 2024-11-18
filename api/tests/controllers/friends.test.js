const request = require("supertest");
const JWT = require("jsonwebtoken");

const app = require("../../app");
const User = require("../../models/user");
const mongoose = require("mongoose");
const { describe } = require("node:test");
const { generateToken } = require("../../lib/token");

require("../mongodb_helper");

const secret = process.env.JWT_SECRET;

function createToken(userId) {
  return JWT.sign(
    {
      user_id: userId,
      // Backdate this token of 5 minutes
      iat: Math.floor(Date.now() / 1000) - 5 * 60,
      // Set the JWT token to expire in 10 minutes
      exp: Math.floor(Date.now() / 1000) + 10 * 60,
    },
    secret
  );
}
let user;
let token;
describe("/friends", () => {
  beforeEach(async () => {
    await User.deleteMany({})
    user = new User({
      email: "post-test@test.com",
      password: "aA1!12222",
      username: "testdummy",
      firstName: "test",
      lastName: "dummy",
      gender: "dummy",
      birthday: new Date("1989-11-12"),
    });
    await user.save();
    token = createToken(user.id);
  });
  describe("addFriend", () => {
    test("POST, when a valid token is present and valid query parameter", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });

      await user2.save();

      const response = await request(app)
        .post(`/friends?userId=${user2._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200);
    });
    test("POST, when a valid token is present but an invalid query parameter", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();

      const response = await request(app)
        .post(`/friends?userId=1234`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(500);
    });
  });
  test("POST, when valid, friend is appened to the friends requestslist", async () => {
    const user2 = new User({
      email: "chris@email.com",
      password: "aA1!12222",
      username: "marion",
      firstName: "Alexia",
      lastName: "Chris",
      gender: "both",
      birthday: new Date("0000-12-25"),
    });

    await user2.save();

    const response = await request(app)
      .post(`/friends?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    const userObject = await User.findOne({ _id: user2._id });
    expect(userObject._id).toEqual(user2._id);
    expect(userObject.friendRequests).toEqual([user._id]);
  });
  test("POST, if friend is already friend return error", async () => {
    const user2 = new User({
      email: "chris@email.com",
      password: "aA1!12222",
      username: "marion",
      firstName: "Alexia",
      lastName: "Chris",
      gender: "both",
      birthday: new Date("0000-12-25"),
    });
    await user2.save();
    user.friends.push(user2);
    await user.save();

    const response = await request(app)
      .post(`/friends?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
  });
  test("POST, if user is already in friends requests return error", async () => {
    const user2 = new User({
      email: "chris@email.com",
      password: "aA1!12222",
      username: "marion",
      firstName: "Alexia",
      lastName: "Chris",
      gender: "both",
      birthday: new Date("0000-12-25"),
    });
    await user2.save();
    user2.friendRequests.push(user);
    await user2.save();

    const response = await request(app)
      .post(`/friends?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
  });
  describe("getFriends", () => {
    test("GET, when a token is valid, return 200 status", async () => {
      const response = await request(app)
        .get("/friends")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200);
    });
    test("Get, returns all friends", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friends.push(user2);
      await user.save();

      const response = await request(app)
        .get("/friends")
        .set("Authorization", `Bearer ${token}`);

      const friends = response.body.friends;
      expect(friends.length).toEqual(1);
      expect(friends[0]._id).toEqual(user2._id.toString());
    });
    test("GET, with invalid token", async () => {
      let token = generateToken("123")
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();

      const response = await request(app)
        .get("/friends")
        .set("Authorization", `Bearer ${token}`);


      expect(response.status).toEqual(500);

    });
  });

  describe("getNonFriendUsers", () => {
    test("GET, when a token is valid, return 200 status", async () => {
      const response = await request(app)
        .get("/friends/non")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200);
    });
    test("GET, given friends return all other users expect logged in user", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friends.push(user2);
      await user.save();

      const user3 = new User({
        email: "email3@email.com",
        password: "aA1!12222",
        username: "janedoe",
        firstName: "Jane",
        lastName: "Doe",
        gender: "Female",
        birthday: new Date("1985-07-15"),
      });

      const user4 = new User({
        email: "email4@email.com",
        password: "aA1!12222",
        username: "alexjones",
        firstName: "Alex",
        lastName: "Jones",
        gender: "Non-binary",
        birthday: new Date("1990-11-20"),
      });

      await user3.save();
      await user4.save();

      const response = await request(app)
        .get("/friends/non")
        .set("Authorization", `Bearer ${token}`);

      const users = response.body.users;
      
      expect(users.length).toEqual(2)
      expect(users[0].email).toEqual("email3@email.com")
      expect(users[1].email).toEqual("email4@email.com")

    });
    test("GET, with invalid token", async () => {
      let token = generateToken("123")
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();

      const response = await request(app)
        .get("/friends/non")
        .set("Authorization", `Bearer ${token}`);


      expect(response.status).toEqual(500);
  });
  describe("accept friend request", () => {
    test("POST, when a valid token is present and valid query parameter", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friendRequests.push(user2);
      await user.save();
      
      const response = await request(app)
        .post(`/friends/accept?userId=${user2._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200);
    });
    test("POST, when a valid token is present but an invalid query parameter", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();


      const response = await request(app)
        .post(`/friends/accept?userId=1234`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(500);
    });
  });
  test("POST, when valid, remove friend from requests and append to both users friends", async () => {
    const user2 = new User({
      email: "chris@email.com",
      password: "aA1!12222",
      username: "marion",
      firstName: "Alexia",
      lastName: "Chris",
      gender: "both",
      birthday: new Date("0000-12-25"),
    });
    await user2.save();
    user.friendRequests.push(user2);
    await user.save();
    
    const response = await request(app)
      .post(`/friends/accept?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    const user1Object = await User.findOne({ _id: user._id });
    const user2Object = await User.findOne({ _id: user2._id });
    expect(user1Object._id).toEqual(user._id);
    expect(user1Object.friendRequests).toEqual([]);
    expect(user1Object.friends).toEqual([user2._id])
    expect(user2Object.friends).toEqual([user._id])
  });
  test("POST, if userid isnt in request return error", async () => {
    const user2 = new User({
      email: "chris@email.com",
      password: "aA1!12222",
      username: "marion",
      firstName: "Alexia",
      lastName: "Chris",
      gender: "both",
      birthday: new Date("0000-12-25"),
    });
    await user2.save();
    user.friends.push(user2);
    await user.save();

    const response = await request(app)
      .post(`/friends/accept?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(500);
  });
  describe("get friend request", () => {
    test("GET, when a token is valid, return 200 status", async () => {
      const response = await request(app)
        .get("/friends/requests")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200);
    });
    test("Get, returns all friend requests", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friendRequests.push(user2);
      await user.save();

      const response = await request(app)
        .get("/friends/requests")
        .set("Authorization", `Bearer ${token}`);

      const friendRequests = response.body.friendRequests;
      expect(friendRequests.length).toEqual(1);
      expect(friendRequests[0]._id).toEqual(user2._id.toString());
    });
    test("GET, with invalid token", async () => {
      let token = generateToken("123")
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();

      const response = await request(app)
        .get("/friends/requests")
        .set("Authorization", `Bearer ${token}`);


      expect(response.status).toEqual(500);
    })
  })
  describe("get pending friend request", () => {
    test("GET, when a token is valid, return 200 status", async () => {
      const response = await request(app)
        .get("/friends/requests/pending")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200);
    });
    test("Get, returns all friend pending requests", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user2.friendRequests.push(user);
      await user2.save();

      const response = await request(app)
        .get("/friends/requests/pending")
        .set("Authorization", `Bearer ${token}`);

      const pendingRequests = response.body.pendingRequests;
      expect(pendingRequests.length).toEqual(1);
      expect(pendingRequests[0]._id).toEqual(user2._id.toString());
    });
    test("GET, with invalid token", async () => {
      let token = generateToken("123")
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();

      const response = await request(app)
        .get("/friends/requests/pending")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(500);
    })
  })
  describe("Delete a freind", () => {
    test("Given a valid token and request a 200 response is returned", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friends.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200)
    })
    test("Given a valid token and request a message saying friend has been deleted is returned", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friends.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.body.message).toEqual("A friend has been deleted")
    })
    test("Given a valid token and request a new token is returned with the correct userId", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friends.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      const newToken = response.body.token;
      const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
      const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET);

      // iat stands for issued at
      expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
      expect(newTokenDecoded.user_id).toEqual(user._id.toString())
    })
    test("Given a valid token and request a friend is deleted", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friends.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      const userObject = await User.findById(user._id)

      expect(userObject.friends.length).toEqual(0)
    })
    test("A user has multiple friends only the given on is deleted", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      const user3 = new User({
        email: "bob@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user3.save();
      user.friends.push(user2);
      user.friends.push(user3);
      await user.save();

      const response = await request(app)
      .delete(`/friends?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      const userObject = await User.findById(user._id)

      expect(userObject.friends.length).toEqual(1)
      expect(userObject.friends[0]._id).toEqual(user3._id)
    })
    test("Given an invalid friend id an error status of 500 is returned", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friends.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends?userId=1234`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(500)
    })
    test("Given an invalid friend id an error status of 500 is returned", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friends.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends?userId=1234`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.body.message).toEqual("Unable to delete friend")
    })
  })
  describe("decline freind request", () => {
    test("Given a valid token and request a 200 response is returned", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friendRequests.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends/accept?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(200)
    })
    test("Given a valid token and request a message saying friend has been deleted is returned", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friendRequests.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends/accept?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.body.message).toEqual("Friend request declined")
    })
    test("Given a valid token and request a new token is returned with the correct userId", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friendRequests.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends/accept?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      const newToken = response.body.token;
      const newTokenDecoded = JWT.decode(newToken, process.env.JWT_SECRET);
      const oldTokenDecoded = JWT.decode(token, process.env.JWT_SECRET);

      // iat stands for issued at
      expect(newTokenDecoded.iat > oldTokenDecoded.iat).toEqual(true);
      expect(newTokenDecoded.user_id).toEqual(user._id.toString())
    })
    test("Given a valid token and request a friend is deleted", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friendRequests.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends/accept?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      const userObject = await User.findById(user._id)

      expect(userObject.friends.length).toEqual(0)
    })
    test("A user has multiple friends only the given on is deleted", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      const user3 = new User({
        email: "bob@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user3.save();
      user.friendRequests.push(user2);
      user.friendRequests.push(user3);
      await user.save();

      const response = await request(app)
      .delete(`/friends/accept?userId=${user2._id}`)
      .set("Authorization", `Bearer ${token}`);

      const userObject = await User.findById(user._id)

      expect(userObject.friendRequests.length).toEqual(1)
      expect(userObject.friendRequests[0]._id).toEqual(user3._id)
    })
    test("Given an invalid friend id an error status of 500 is returned", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friendRequests.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends/accept?userId=1234`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(500)
    })
    test("Given an invalid friend id an error status of 500 is returned", async () => {
      const user2 = new User({
        email: "chris@email.com",
        password: "aA1!12222",
        username: "marion",
        firstName: "Alexia",
        lastName: "Chris",
        gender: "both",
        birthday: new Date("0000-12-25"),
      });
      await user2.save();
      user.friendRequests.push(user2);
      await user.save();

      const response = await request(app)
      .delete(`/friends/accept?userId=1234`)
      .set("Authorization", `Bearer ${token}`);

      expect(response.body.message).toEqual("Can not decline request")
    })
  })
});
})
