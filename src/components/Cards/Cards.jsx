import { shuffle } from "lodash";
import { useContext, useEffect, useState } from "react";
import { generateDeck } from "../../utils/cards";
import styles from "./Cards.module.css";
import { EndGameModal } from "../../components/EndGameModal/EndGameModal";
import { Button } from "../../components/Button/Button";
import { Card } from "../../components/Card/Card";
import { LightContext } from "../../context/easyMode";
// Игра закончилась
const STATUS_LOST = "STATUS_LOST";
const STATUS_WON = "STATUS_WON";
// Идет игра: карты закрыты, игрок может их открыть
const STATUS_IN_PROGRESS = "STATUS_IN_PROGRESS";
// Начало игры: игрок видит все карты в течении нескольких секунд
const STATUS_PREVIEW = "STATUS_PREVIEW";

function getTimerValue(startDate, endDate) {
  if (!startDate && !endDate) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }

  if (endDate === null) {
    endDate = new Date();
  }

  const diffInSecconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSecconds / 60);
  const seconds = diffInSecconds % 60;
  return {
    minutes,
    seconds,
  };
}
/**
 * Основной компонент игры, внутри него находится вся игровая механика и логика.
 * pairsCount - сколько пар будет в игре
 * previewSeconds - сколько секунд пользователь будет видеть все карты открытыми до начала игры
 */
export function Cards({ pairsCount = 3, previewSeconds = 5 }) {
  const { isLight, tries, setTries } = useContext(LightContext);
  // В cards лежит игровое поле - массив карт и их состояние открыта\закрыта
  const [cards, setCards] = useState([]);

  const [playerLost, setPlayerLost] = useState(false);

  // Текущий статус игры
  const [status, setStatus] = useState(STATUS_PREVIEW);

  // Дата начала игры
  const [gameStartDate, setGameStartDate] = useState(null);
  // Дата конца игры
  const [gameEndDate, setGameEndDate] = useState(null);

  // Стейт для таймера, высчитывается в setInteval на основе gameStartDate и gameEndDate
  const [timer, setTimer] = useState({
    seconds: 0,
    minutes: 0,
  });
  const [superPowerUsed, setSuperPowerUsed] = useState(false);
  function finishGame(status = STATUS_LOST) {
    setGameEndDate(new Date());
    setStatus(status);
  }
  function startGame() {
    const startDate = new Date();
    setGameEndDate(null);
    setGameStartDate(startDate);
    setTimer(getTimerValue(startDate, null));
    setStatus(STATUS_IN_PROGRESS);
  }
  function resetGame() {
    setTries(isLight ? 3 : 1);
    setPlayerLost(false);
    setGameStartDate(null);
    setGameEndDate(null);
    setTimer(getTimerValue(null, null));
    setStatus(STATUS_PREVIEW);
    setSuperPowerUsed(false);
  }

  /**
   * Обработка основного действия в игре - открытие карты.
   * После открытия карты игра может переходить в следующие состояния
   * - "Игрок выиграл", если на поле открыты все карты
   * - "Игрок проиграл", если на поле есть две открытые карты без пары
   * - "Игра продолжается", если не случилось первых двух условий
   */

  useEffect(() => {
    if (tries === 0) setPlayerLost(true);
  }, [tries, playerLost]);

  useEffect(() => {
    if (playerLost) finishGame(STATUS_LOST);
  }, [playerLost]);

  const openCard = clickedCard => {
    // Если карта уже открыта, то ничего не делаем
    if (clickedCard.open) {
      return;
    }

    // Игровое поле после открытия кликнутой карты
    const nextCards = cards.map(card => {
      if (card.id !== clickedCard.id) {
        return card;
      }

      return {
        ...card,
        open: true,
      };
    });

    setCards(nextCards);

    const isPlayerWon = nextCards.every(card => card.open);

    // Победа - все карты на поле открыты
    if (isPlayerWon) {
      finishGame(STATUS_WON);
      return;
    }

    // Открытые карты на игровом поле
    const openCards = nextCards.filter(card => card.open);

    // Ищем открытые карты, у которых нет пары среди других открытых
    const openCardsWithoutPair = openCards.filter(card => {
      const sameCards = openCards.filter(openCard => card.suit === openCard.suit && card.rank === openCard.rank);

      if (sameCards.length < 2) {
        return true;
      }

      return false;
    });

    function tryLost() {
      if (openCardsWithoutPair.length === 2) {
        setTries(tries - 1);
        setTimeout(() => {
          setCards(
            cards.reduce((acc, card) => {
              if (card.id === clickedCard.id) {
                return [...acc, { ...card, open: false }];
              }
              return [...acc, card];
            }, []),
          );
          setCards(
            cards.reduce((acc, card) => {
              const previousCard = openCardsWithoutPair.find(item => item.id !== clickedCard.id);
              if (card.id === previousCard.id) {
                return [...acc, { ...card, open: false }];
              }
              return [...acc, card];
            }, []),
          );
        }, 1000);
      }
    }
    tryLost();

    // "Игрок проиграл", т.к на поле есть две открытые карты без пары
    // if (lost) {
    //   finishGame(STATUS_LOST);
    //   return;
    // }

    // ... игра продолжается
  };

  const isGameEnded = status === STATUS_LOST || status === STATUS_WON;

  // Игровой цикл
  useEffect(() => {
    // В статусах кроме превью доп логики не требуется
    if (status !== STATUS_PREVIEW) {
      return;
    }

    // В статусе превью мы
    if (pairsCount > 36) {
      alert("Столько пар сделать невозможно");
      return;
    }

    setCards(() => {
      return shuffle(generateDeck(pairsCount, 10));
    });

    const timerId = setTimeout(() => {
      startGame();
    }, previewSeconds * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [status, pairsCount, previewSeconds]);

  // Обновляем значение таймера в интервале
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer(getTimerValue(gameStartDate, gameEndDate));
    }, 300);
    return () => {
      clearInterval(intervalId);
    };
  }, [gameStartDate, gameEndDate]);

  const superPowerEye = () => {
    if (superPowerUsed) {
      return;
    }
    const updatedCards = cards.map(card => ({ ...card, open: true }));
    setCards(updatedCards);
    setTimeout(() => {
      const resetCards = updatedCards.map(card => ({ ...card, open: false }));
      setCards(resetCards);
      setSuperPowerUsed(true);
    }, 3000);
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          {status === STATUS_PREVIEW ? (
            <div>
              <p className={styles.previewText}>Запоминайте пары!</p>
              <p className={styles.previewDescription}>Игра начнется через {previewSeconds} секунд</p>
            </div>
          ) : (
            <>
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>min</div>
                <div>{timer.minutes.toString().padStart("2", "0")}</div>
              </div>
              .
              <div className={styles.timerValue}>
                <div className={styles.timerDescription}>sec</div>
                <div>{timer.seconds.toString().padStart("2", "0")}</div>
              </div>
              <div>
                <button className={styles.superpower} onClick={superPowerEye}>
                  {superPowerUsed ? (
                    <svg width={60} height={36} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2.06365 19.2703L2.06519 19.273C7.81667 29.1958 18.5591 35.3889 30 35.3889C41.4394 35.3889 52.1832 29.2593 57.9355 19.2718L57.9363 19.2703L58.4341 18.3992L58.5759 18.1511L58.4341 17.903L57.9364 17.0319L57.9348 17.0293C52.1833 7.10638 41.4409 0.91333 30 0.91333C18.5591 0.91333 7.81667 7.10638 2.06519 17.0293L2.06518 17.0293L2.06366 17.0319L1.56588 17.903L1.42412 18.1511L1.56588 18.3992L2.06366 19.2703L2.06365 19.2703Z"
                        fill="white"
                        stroke="#E4E4E4"
                      />
                      <mask
                        id="mask0_34_4"
                        style={{ maskType: "alpha" }}
                        maskUnits="userSpaceOnUse"
                        x={2}
                        y={1}
                        width={56}
                        height={34}
                      >
                        <path
                          d="M30 34.8889C18.7378 34.8889 8.16 28.7911 2.49778 19.0222L2 18.1511L2.49778 17.28C8.16 7.51111 18.7378 1.41333 30 1.41333C41.2622 1.41333 51.84 7.51111 57.5022 17.28L58 18.1511L57.5022 19.0222C51.84 28.8533 41.2622 34.8889 30 34.8889Z"
                          fill="#727272"
                        />
                      </mask>
                      <g mask="url(#mask0_34_4)">
                        <path
                          d="M43.0004 28.5C43.0004 35.9558 36.9562 42 29.5004 42C22.0445 42 16.0004 35.9558 16.0004 28.5C16.0004 21.0441 22.0445 15 29.5004 15C36.9562 15 43.0004 21.0441 43.0004 28.5Z"
                          fill="#3CCACA"
                          fillOpacity="0.47"
                        />
                        <path
                          d="M46.6109 24.8889C46.6109 34.3391 38.9506 42 29.5004 42C20.0502 42 12.3887 34.3391 12.3887 24.8889C12.3887 15.4387 20.0496 7.77777 29.4998 7.77777C38.95 7.77777 46.6109 15.4387 46.6109 24.8889Z"
                          fill="#3CCACA"
                          fillOpacity="0.47"
                        />
                        <path
                          d="M36.0099 31.2171C33.0972 30.9548 30.9543 28.3879 31.2166 25.4752C31.3114 24.4217 31.7161 23.3961 32.3464 22.6407C32.0421 22.5508 31.7323 22.5229 31.4844 22.5006C26.8985 22.0877 22.9074 25.4768 22.5001 30.0007C22.0872 34.5866 25.4763 38.5777 30.0002 38.985C34.5861 39.3979 38.5772 36.0088 38.9845 31.4849C39.0124 31.175 39.0403 30.8652 39.0007 30.6117C38.1448 31.0969 37.1254 31.3175 36.0099 31.2171Z"
                          fill="url(#paint0_linear_34_4)"
                        />
                        <g filter="url(#filter0_i_34_4)">
                          <path
                            d="M29.5 29.5C18.2378 29.5 8.16024 28.7689 2.49802 19L2 18.5L2.49802 17C11.5 4.5 17.7378 1 29 1C40.2622 1 49 5 56.5 15.5L57.5025 17L58.0002 18.5C52.338 28.3311 40.7622 29.5 29.5 29.5Z"
                            fill="white"
                          />
                        </g>
                      </g>
                      <defs>
                        <filter
                          id="filter0_i_34_4"
                          x={2}
                          y={1}
                          width={60}
                          height="30.5"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood floodOpacity={0} result="BackgroundImageFix" />
                          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dx={4} dy={2} />
                          <feGaussianBlur stdDeviation={3} />
                          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_34_4" />
                        </filter>
                        <linearGradient
                          id="paint0_linear_34_4"
                          x1="31.4844"
                          y1="22.5006"
                          x2="30.0002"
                          y2="38.985"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#161616" />
                          <stop offset={1} stopColor="#0B004B" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ) : (
                    <svg
                      className={styles.svg}
                      width={60}
                      height={36}
                      viewBox="0 0 60 36"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.06365 19.2703L2.06519 19.273C7.81667 29.1958 18.5591 35.3889 30 35.3889C41.4394 35.3889 52.1832 29.2593 57.9355 19.2718L57.9363 19.2703L58.4341 18.3992L58.5759 18.1511L58.4341 17.903L57.9364 17.0319L57.9348 17.0293C52.1833 7.10638 41.4409 0.91333 30 0.91333C18.5591 0.91333 7.81667 7.10638 2.06519 17.0293L2.06518 17.0293L2.06366 17.0319L1.56588 17.903L1.42412 18.1511L1.56588 18.3992L2.06366 19.2703L2.06365 19.2703Z"
                        fill="white"
                        stroke="#E4E4E4"
                      />
                      <mask
                        id="mask0_3_5612"
                        style={{ maskType: "alpha" }}
                        maskUnits="userSpaceOnUse"
                        x={2}
                        y={1}
                        width={56}
                        height={34}
                      >
                        <path
                          d="M30 34.8889C18.7378 34.8889 8.16 28.7911 2.49778 19.0222L2 18.1511L2.49778 17.28C8.16 7.51111 18.7378 1.41333 30 1.41333C41.2622 1.41333 51.84 7.51111 57.5022 17.28L58 18.1511L57.5022 19.0222C51.84 28.8533 41.2622 34.8889 30 34.8889Z"
                          fill="white"
                        />
                      </mask>
                      <g mask="url(#mask0_3_5612)">
                        <g filter="url(#filter0_i_3_5612)">
                          <path
                            d="M30 34.8889C18.7378 34.8889 8.16 28.7911 2.49778 19.0222L2 18.1511L2.49778 17.28C8.16 7.51111 18.7378 1.41333 30 1.41333C41.2622 1.41333 51.84 7.51111 57.5022 17.28L58 18.1511L57.5022 19.0222C51.84 28.8533 41.2622 34.8889 30 34.8889Z"
                            fill="white"
                          />
                        </g>
                        <circle cx="30.3108" cy="10.1867" r="17.1111" fill="url(#paint0_linear_3_5612)" />
                        <path
                          d="M35.2891 10.3733C32.3646 10.3733 30.0002 8.00889 30.0002 5.08445C30.0002 4.02667 30.3113 2.96889 30.8713 2.16C30.5602 2.09778 30.2491 2.09778 30.0002 2.09778C25.3957 2.09778 21.7246 5.83111 21.7246 10.3733C21.7246 14.9778 25.4579 18.6489 30.0002 18.6489C34.6046 18.6489 38.2757 14.9156 38.2757 10.3733C38.2757 10.0622 38.2757 9.75111 38.2135 9.50222C37.4046 10.0622 36.4091 10.3733 35.2891 10.3733Z"
                          fill="url(#paint1_linear_3_5612)"
                        />
                      </g>
                      <defs>
                        <filter
                          id="filter0_i_3_5612"
                          x={2}
                          y="1.41333"
                          width={60}
                          height="35.4756"
                          filterUnits="userSpaceOnUse"
                          colorInterpolationFilters="sRGB"
                        >
                          <feFlood floodOpacity={0} result="BackgroundImageFix" />
                          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                          <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                          />
                          <feOffset dx={4} dy={2} />
                          <feGaussianBlur stdDeviation={3} />
                          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
                          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3_5612" />
                        </filter>
                        <linearGradient
                          id="paint0_linear_3_5612"
                          x1="30.3108"
                          y1="-6.92444"
                          x2="30.3108"
                          y2="27.2978"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#004980" />
                          <stop offset={1} stopColor="#C2F5FF" />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear_3_5612"
                          x1="30.0002"
                          y1="2.09778"
                          x2="30.0002"
                          y2="18.6489"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#161616" />
                          <stop offset={1} stopColor="#0B004B" />
                        </linearGradient>
                      </defs>
                    </svg>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
        {status === STATUS_IN_PROGRESS ? (
          <div className="tries">
            <Button onClick={resetGame}>Начать заново</Button>
            {isLight && <p className={styles.tries}>Осталось попыток: {tries}</p>}
          </div>
        ) : null}
      </div>
      <div className={styles.cards}>
        {cards.map(card => (
          <Card
            key={card.id}
            onClick={() => openCard(card)}
            open={status !== STATUS_IN_PROGRESS ? true : card.open}
            suit={card.suit}
            rank={card.rank}
          />
        ))}
      </div>

      {isGameEnded ? (
        <div className={styles.modalContainer}>
          <EndGameModal
            isWon={status === STATUS_WON}
            gameDurationSeconds={timer.seconds}
            gameDurationMinutes={timer.minutes}
            onClick={resetGame}
          />
        </div>
      ) : null}
    </div>
  );
}
