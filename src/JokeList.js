import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

function JokeList({ numJokesToGet = 5 }) {

  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* retrieve jokes from API */


  useEffect(() => {
    // setIsLoading(true); (we could call this here, and remove generateNewJokes all together)

    async function fetchJokes() {
      try {
        // load jokes one at a time, adding not-yet-seen jokes
        let newJokes = [...jokes];
        let seenJokes = new Set(newJokes.map(j => j.id));

        while (newJokes.length < numJokesToGet) {
            let res = await axios.get("https://icanhazdadjoke.com", {
            headers: { Accept: "application/json" }
          });
          let { ...joke } = res.data;

          if (!seenJokes.has(joke.id)) {
            seenJokes.add(joke.id);
            newJokes.push({ ...joke, votes: 0, locked: false });
          } else {
            console.log("duplicate found!");
          }
        }

        setJokes(newJokes);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    }

    if (jokes.length === 0 || jokes.length < numJokesToGet) fetchJokes();
  }, [jokes, numJokesToGet])

  /* empty joke list, set to loading state, and then call getJokes */

  function generateNewJokes() {
    let lockedJokes = jokes.filter(j => j.locked);
    console.log("locked jokes are: ", lockedJokes);
    setJokes(lockedJokes);
    setIsLoading(true);
  }

  /* change vote for this id by delta (+1 or -1) */

  function vote(id, delta) {
    setJokes(jokes => (
      jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      )
    ));
  }

  /* change lock for this id (true to false and vice versa) */

  function lock(id) {
    setJokes(jokes => (
      jokes.map(j =>
        j.id === id ? { ...j, locked: !j.locked } : j
      )
    ));
  }

  /* renderJokeList: either returns loading spinner or list of sorted jokes. */

  function renderJokeList() {
    let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
    
    if (isLoading) {
      return (
        <div className="loading">
          <i className="fas fa-4x fa-spinner fa-spin" />
        </div>
      )
    }

    return (
      <div className="JokeList">
        <button
          className="JokeList-getmore"
          onClick={generateNewJokes}
        >
          Get New Jokes
        </button>

        {sortedJokes.map(j => (
          <Joke
            text={j.joke}
            key={j.id}
            id={j.id}
            votes={j.votes}
            vote={vote}
            locked={j.locked}
            lock={lock}
          />
        ))}
      </div>
    );
  }


  return (
    <div>
      {renderJokeList()}
    </div>
  )
}

export default JokeList;
