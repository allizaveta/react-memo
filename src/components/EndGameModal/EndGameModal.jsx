import styles from "./EndGameModal.module.css";
import { Button } from "../Button/Button";
import deadImageUrl from "./images/dead.png";
import celebrationImageUrl from "./images/celebration.png";
import { postLeader, getLeaders } from "../../api";
import { useContext, useState, useEffect } from "react";
import { LightContext } from "../../context/easyMode";
import { useNavigate } from "react-router-dom";
import { usePairsCount } from "../../context/PairsCountContext";

export function EndGameModal({ isWon, gameDurationSeconds, onClick }) {
  const { isLight } = useContext(LightContext);
  const { pairsCount } = usePairsCount();
  const [shouldAddToLeaderboard, setShouldAddToLeaderboard] = useState(false);
  const [addPlayer, setAddPlayer] = useState({
    name: "",
    time: gameDurationSeconds,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isWon && !isLight && pairsCount >= 9) {
      const checkLeaderboard = async () => {
        try {
          const leaders = await getLeaders();
          if (Array.isArray(leaders) && leaders.length >= 10) {
            const sortedLeaders = leaders.sort((a, b) => a.time - b.time);
            const slowestTimeInTopTen = sortedLeaders[9].time;
            if (addPlayer.time < slowestTimeInTopTen) {
              setShouldAddToLeaderboard(true);
            }
          } else {
            setShouldAddToLeaderboard(true);
          }
        } catch (error) {
          console.error("Ошибка при проверке лидерборда:", error);
        }
      };
      checkLeaderboard();
    }
  }, [isWon, isLight, pairsCount, addPlayer.time]);

  const title = isWon
    ? shouldAddToLeaderboard
      ? "Поздравляю, вы попали в Лидерборд!"
      : "Вы выиграли!"
    : "Вы проиграли!";

  const imgSrc = isWon ? celebrationImageUrl : deadImageUrl;
  const imgAlt = isWon ? "celebration emoji" : "dead emoji";

  const handleLeaderboardRedirect = async e => {
    e.preventDefault();
    if (isWon && shouldAddToLeaderboard) {
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
        {shouldAddToLeaderboard && (
          <input
            onChange={e => setAddPlayer({ ...addPlayer, name: e.target.value })}
            onKeyDown={handleKeyDown}
            className={styles.input}
            placeholder="Введите имя"
            type="text"
            value={addPlayer.name}
          />
        )}
        <button className={styles.btn} type="button" onClick={handleLeaderboardRedirect}>
          Отправить
        </button>
        <p className={styles.description}>Затраченное время:</p>
        <div className={styles.time}>
          {`${Math.floor(gameDurationSeconds / 60)
            .toString()
            .padStart(2, "0")}:${(gameDurationSeconds % 60).toString().padStart(2, "0")}`}
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
