import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../LeaderBoardPage/LeaderBoardPage.module.css";
import { getLeaders } from "../../api";
import emptyMagicBall from "./images/emptyMagicBall.svg";
import emptyPuzzle from "./images/emptyPuzzle.svg";
import magicBall from "./images/magicBall.svg";
import puzzle from "./images/puzzle.svg";

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
function AchievementImages({ achievements }) {
  let imagesToShow = [];
  if (achievements.length === 0) {
    imagesToShow = [emptyPuzzle, emptyMagicBall];
  } else if (achievements.length === 2) {
    imagesToShow = [puzzle, magicBall];
  } else if (achievements.length === 1) {
    if (achievements.includes(1)) {
      imagesToShow = [puzzle, emptyMagicBall];
    } else if (achievements.includes(2)) {
      imagesToShow = [emptyPuzzle, magicBall];
    }
  }

  return (
    <div className={styles.achievements}>
      {imagesToShow.map((Src, index) => (
        <img key={index} src={Src} className={styles.image} alt="Achievement" />
      ))}
    </div>
  );
}

export function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await getLeaders();
        if (Array.isArray(data)) {
          const sortedLeaders = data.sort((a, b) => a.time - b.time).slice(0, 10);
          setLeaders(sortedLeaders);
        } else {
          setError("Неверный формат данных");
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);
        setError("Ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div className={styles.header}>
        <p className={styles.title}>Лидерборд</p>
        <Link to="/">
          <button className={styles.btn}>Начать игру</button>
        </Link>
      </div>
      <ul className={styles.flex}>
        <li className={styles.listHeader}>
          <p className={styles.listHeaderText}>Позиция</p>
          <p className={styles.listHeaderText}>Пользователь</p>
          <p className={styles.listHeaderText}>Достижения</p>
          <p className={styles.listHeaderText}>Время</p>
        </li>
        {leaders.map((leader, index) => (
          <li key={leader.id || index} className={styles.listHeader}>
            <p className={styles.listText}>#{index + 1}</p>
            <p className={styles.listText}>{leader.name}</p>
            <AchievementImages achievements={leader.achievements} />
            <p className={styles.listText}>{formatTime(leader.time)}</p> {}
          </li>
        ))}
      </ul>
    </div>
  );
}
