import styles from "./EndGameModal.module.css";
import { Button } from "../Button/Button";
import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { postLeader } from "../../api";
import { useContext, useState } from "react";
import { LightContext } from "../../context/easyMode";
import { useNavigate } from "react-router-dom";

export function EndGameModal({ isWon, gameDurationSeconds, gameDurationMinutes, onClick }) {
  const { isLight } = useContext(LightContext);
  const title = isWon ? `${isLight ? "Вы выиграли" : "Вы попали на Лидерборд!"}` : "Вы проиграли!";
  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;
  const imgAlt = isWon ? "celebration emoji" : "dead emoji";
  const [addPlayer, setAddPlayer] = useState({
    name: "",
    time: gameDurationSeconds.toString().padStart(2, "0"),
  });
  const navigate = useNavigate();

  const handleLeaderboardRedirect = async e => {
    e.preventDefault();
    if (isWon && !isLight) {
      try {
        await postLeader(addPlayer);
      } catch (error) {
        console.error("Ошибка при добавлении игрока:", error);
      }
    }
    navigate("/leaderboard");
  };
  const handleKeyDown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLeaderboardRedirect(e);
    }
  };
  return (
    <form>
      <div className={styles.modal}>
        <img className={styles.image} src={imgSrc} alt={imgAlt} />
        <h2 className={styles.title}>{title}</h2>
        {isWon && !isLight && (
          <input
            onChange={e => setAddPlayer({ ...addPlayer, name: e.target.value })}
            onKeyDown={handleKeyDown}
            className={styles.input}
            placeholder="Пользователь"
            type="text"
            value={addPlayer.name}
          />
        )}
        <p className={styles.description}>Затраченное время:</p>
        <div className={styles.time}>
          {gameDurationMinutes.toString().padStart(2, "0")}.{gameDurationSeconds.toString().padStart(2, "0")}
        </div>
        <Button type="button" onClick={onClick}>
          Начать сначала
        </Button>
        <button className={styles.btnLeaderBoard} type="button" onClick={handleLeaderboardRedirect}>
          Перейти к лидерборду
        </button>
      </div>
    </form>
  );
}
