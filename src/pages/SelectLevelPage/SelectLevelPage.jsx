import { Link } from "react-router-dom";
import styles from "./SelectLevelPage.module.css";
import { useContext } from "react";
import { LightContext } from "../../context/easyMode";

export function SelectLevelPage() {
  const { isLight, setIsLight } = useContext(LightContext);
  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <h1 className={styles.title}>Выбери сложность</h1>
        <ul className={styles.levels}>
          <li className={styles.level}>
            <Link className={styles.levelLink} to="/game/3">
              1
            </Link>
          </li>
          <li className={styles.level}>
            <Link className={styles.levelLink} to="/game/6">
              2
            </Link>
          </li>
          <li className={styles.level}>
            <Link className={styles.levelLink} to="/game/9">
              3
            </Link>
          </li>
        </ul>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            name="checkbox"
            checked={isLight}
            onChange={() => setIsLight(!isLight)}
          />
          Easy mode
        </label>
      </div>
    </div>
  );
}
