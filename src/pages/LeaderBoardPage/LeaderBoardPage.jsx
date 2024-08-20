import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../LeaderBoardPage/LeaderBoardPage.module.css";
import { getLeaders } from "../../api";

export function LeaderBoard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await getLeaders();
        setLeaders(data);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };
    fetchLeaders();
  }, []);

  return (
    <div>
      <div className={styles.header}>
        <p className={styles.title}>Лидерборд</p>
        <Link to="/">
          <button className={styles.btn}>Начать игру</button>
        </Link>
      </div>
      <div className={styles.flex}>
        <div className={styles.listHeader}>
          <p className={styles.listHeaderText}>Позиция</p>
          <p className={styles.listHeaderText}>Пользователь</p>
          <p className={styles.listHeaderText}>Время</p>
        </div>
        {leaders.map((leader, index) => (
          <div key={index} className={styles.listHeader}>
            <p className={styles.listText}>#{index + 1}</p>
            <p className={styles.listText}>{leader.name}</p>
            <p className={styles.listText}>{leader.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
