import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../LeaderBoardPage/LeaderBoardPage.module.css";
import { getLeaders } from "../../api";

export function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await getLeaders();
        if (Array.isArray(data)) {
          const sortedLeaders = data.sort((a, b) => a.time - b.time);
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
          <p className={styles.listHeaderText}>Время</p>
        </li>
        {leaders.map((leader, index) => (
          <li key={leader.id || index} className={styles.listHeader}>
            <p className={styles.listText}>#{index + 1}</p>
            <p className={styles.listText}>{leader.name}</p>
            <p className={styles.listText}>{leader.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
