import "./styles.css";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function loadScores() {
      const q = query(collection(db, "leaderboard"), orderBy("score", "desc"));
      const snapshot = await getDocs(q);
      setScores(snapshot.docs.map((doc) => doc.data()));
    }

    loadScores();
  }, []);

  return (
    <div className="leaderboard">
      <h2>leaderboard</h2>
      <ol>
        {scores.map((entry, index) => (
          <li key={index}>
            {entry.name}: {entry.score}
            <br />
            <br />
          </li>
        ))}
      </ol>
    </div>
  );
}
