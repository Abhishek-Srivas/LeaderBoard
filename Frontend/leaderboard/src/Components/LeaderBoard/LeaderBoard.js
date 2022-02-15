import React, { useState, useEffect } from "react";
import Row from "../Row/Row";
import "./LeaderBoard.css";
import axios from "axios";

const LeaderBoard = () => {
  const [users, setUsers] = useState([]);
  const [currUser, setCurrUser] = useState();

  useEffect(() => {
    async function fetchLeaderBoard() {
      const data = await axios.get(
        "http://localhost:8000/api/top10?user=62069c598b90493bf455f7a8"
      );

      console.log(data.data.results);
      setUsers(data.data.results);
      setCurrUser({
        points: data.data.user_score,
        name: data.data.user_name,
        rank: data.data.user_rank,
      });
    }

    fetchLeaderBoard();
  }, []);

  const submitHandler = async (e) => {
    console.log(e.target.points.value);
    e.preventDefault();
    const data = {
      score: e.target.points.value,
    };
    const response = await axios.post(
      "http://localhost:8000/api/addPoint?user=62069c598b90493bf455f79a",
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
                  points={user.score}
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
        <label>Userid </label>
        <input type="text" name="id" />
        <br />
        <label>Increased Points</label>
        <input type="number" name="points" />
        <br />
        <input type="submit" />
      </form>
    </div>
  );
};

export default LeaderBoard;
