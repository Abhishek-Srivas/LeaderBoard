import React, { useState, useEffect } from "react";
import Row from "../Row/Row";
import "./LeaderBoard.css";
import axios from "axios";
const LeaderBoard = () => {
  const [users, setUsers] = useState([]);
  const userId = "";
  const [currUser, setCurrUser] = useState();

  useEffect(() => {
    async function fetchLeaderBoard() {
      const data = await axios.get("http://localhost:8000/api/dummyData/");
      setUsers(data.data);
      console.log(users);
    }

    async function fetchUserDetail() {
      const data = await axios.get("http://localhost:8000/api/userDetail");
      setCurrUser(data.data);
      console.log(currUser);
    }
    fetchLeaderBoard();
    fetchUserDetail();
  }, []);

  const submitHandler = async (e) => {
    console.log(e.target.points.value);
    e.preventDefault();
    const data = {
      newPoint: e.target.points.value,
    };
    const response = await axios.post(
      "http://localhost:8000/api/update-points?user=62069c598b90493bf455f799",
      data
    );
    console.log(response);
  };

  return (
    <div>
      <h2>LeaderBoard</h2>
      <div className="LeaderBoard-Table">
        <div className="LeaderBoard-Table-Row">
          <h3>Rank</h3>
          <h3>Name</h3>
          <h3>Points</h3>
        </div>
        {users.length
          ? users.map((user, i) => {
              return (
                <Row
                  key={i}
                  rank={user.rank}
                  name={user.name}
                  points={user.points}
                />
              );
            })
          : ""}
      </div>
      <h2>User Board</h2>
      {currUser ? (
        <>
        <div className="LeaderBoard-Table-Row">
        <h3>Rank</h3>
        <h3>Name</h3>
        <h3>Points</h3>
      </div>
        <Row
          rank={currUser.rank}
          name={currUser.name}
          points={currUser.points}
        />
        </>
      ) : (
        ""
      )}

      <form onSubmit={submitHandler}>
        <input type="number" name="points" />
        <input type="submit" />
      </form>
    </div>
  );
};

export default LeaderBoard;