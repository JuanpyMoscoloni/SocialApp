import React from "react";
import { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { Aside } from "../Home";
import Post from "./Post";
import { ReactSVG } from "react-svg";
import { AuthContext } from "../../context/AuthContext";
function ProfileUsers() {
  const { user, followingCount, setFollowingCount } = useContext(AuthContext);
  const socket = useRef(null);
  const [data, setData] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  let { id } = useParams();
  const posts = `http://localhost:5050/posts/user/${id}`;
  const url = `http://localhost:5050/users/${id}`;
  const [profile, setProfile] = useState({
    currentUserImage: undefined,
    currentUserName: undefined,
    description: undefined,
    followers: undefined,
    following: undefined,
    background: undefined,
  });
  const urlPost = `http://localhost:5050/posts/user/${id}`;
  const [post, setPost] = useState([]);
  useEffect(() => {
    async function fetchUser() {
      const { data } = await axios.get(url);
      const {
        username,
        descripcion,
        background,
        avatarImage,
        followers,
        following,
      } = data;
      setProfile({
        ...data,
        currentUserImage: avatarImage,
        currentUserName: username,
        description: descripcion,
        background: background,
        followers: followers.length,
        following: following.length,
      });
    }
    fetchUser();
  }, []);

  const fetchData = async () => {
    const res = await axios.get(posts);
    setData(
      res.data.sort((p1, p2) => {
        return new Date(p2.createdAt) - new Date(p1.createdAt);
      })
    );
  };
  useEffect(() => {
    fetchData();
  }, []);

  const fetchPost = async () => {
    const res = await axios.get(urlPost);
    setPost(res.data.length);
  };
  useEffect(() => {
    fetchPost();
  }, []);

  useEffect(() => {
    socket.current = io("http://localhost:5050");
    socket.current.emit("add-user", user);

    socket.current.on("follower-count-updated", ({ userId, followerCount }) => {
      if (userId === user) {
        setFollowingCount(followerCount);
      }
    });

    const checkFollowingStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/users/not-following/${user}`
        );
        const notFollowingList = response.data; // Lista de personas que no sigues

        // Verificar si el _id de la persona de interés está en la lista de no seguidos
        const isCurrentlyFollowing = !notFollowingList.some(
          (person) => person._id === id
        );
        setIsFollowing(isCurrentlyFollowing);
      } catch (error) {
        console.error(error);
      }
    };

    checkFollowingStatus();

    return () => {
      socket.current.disconnect();
    };
  }, [user, id]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axios.post(`http://localhost:5050/users/unfollow/${user}`, {
          follower: id,
        });
      } else {
        await axios.post(`http://localhost:5050/users/follow/${user}`, {
          follower: id,
        });
      }

      socket.current.emit("follow-user", {
        userId: user,
        followerId: id,
      });

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(`http://localhost:5050/users/unfollow/${user}`, {
        follower: id,
      });
      setFollowingCount((prevCount) => prevCount - 1);
      socket.current.emit("unfollow-user", {
        userId: user,
        followerId: id,
      });
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <section className="flex">
      <div className="fixed z-20">
        <Aside />
      </div>
      <div className="relative w-full justify-center items-center min-h-screen h-screen ">
        <div className="flex flex-col dark:bg-[#131324] h-full dark:text-white ml-[35%] mr-[15%] max-lg:m-0 max-lg:overflow-hidden">
          <div className="relative mb-[4rem] pt-20 flex flex-col">
            <div className="flex flex-col  relative bg-white dark:bg-[#0a0a13] rounded-lg shadow-md">
              <div className="w-full h-fit py-12 justify-center relavite flex items-center gap-16 flex-col">
                <div className="flex items-center gap-20">
                  <ReactSVG
                    src={`data:image/svg+xml;base64,${btoa(
                      profile.avatarImage
                    )}`}
                    className="color-item rounded-full w-[8rem] h-auto"
                  />
                  <div className="flex flex-col gap-y-6">
                    <div className="flex  text-xl  items-center gap-6">
                      <h1 className="font-bold capitalize max-w-[220px] whitespace-nowrap">
                        {profile.fullName}
                      </h1>
                      <div
                        className="color-item rounded-lg flex p-1 px-4 h-fit cursor-pointer max-md:hidden"
                        onClick={() => {
                          isFollowing ? handleUnfollow(id) : handleFollow(id);
                        }}
                      >
                        <p className="whitespace-nowrap text-white">
                          {isFollowing ? "Unfollow" : "Follow"}
                        </p>
                      </div>
                    </div>
                    {/* <h1 className="font-light capitalize">@{profile.username}</h1> */}
                    <div className="flex gap-10">
                      <div className="flex cursor-pointer text-center text-xl gap-2 ">
                        <span className="font-bold">
                          {post}{" "}
                          <span className="text-black/40 dark:text-white/30">
                            Posts
                          </span>
                        </span>
                      </div>
                      <div className="flex text-center text-xl gap-2 flex-col">
                        <span className="font-bold">
                          {profile.followers}{" "}
                          <span className="text-black/40 dark:text-white/30">
                            Followers
                          </span>
                        </span>
                      </div>
                      <div className="flex cursor-pointer text-center text-xl gap-2 flex-col">
                        <span className="font-bold">
                          {profile.following}{" "}
                          <span className="text-black/40 dark:text-white/30">
                            Followings
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-y-12 pb-20 flex-col w-full justify-center  items-center">
            {data.map((post, key) => {
              return (
                <>
                  {post.video ? (
                    <video controls width="auto" key={post.id}>
                      <source src={post.video} />
                    </video>
                  ) : (
                    ""
                  )}

                  {post?.user?.map((user, key) => {
                    return (
                      <>
                        <Post
                          key={post.id}
                          post={post}
                          userprofile={user}
                          video={post.video}
                        />
                      </>
                    );
                  })}
                </>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfileUsers;
