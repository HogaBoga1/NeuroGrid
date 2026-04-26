import { useEffect, useState } from "react";
import "./App.css";

const difficultyConfig = {
  easy: {
    label: "Easy",
    gridSize: 3,
    patternLength: 3,
    previewTime: 1400,
  },
  medium: {
    label: "Medium",
    gridSize: 4,
    patternLength: 4,
    previewTime: 1200,
  },
  hard: {
    label: "Hard",
    gridSize: 5,
    patternLength: 5,
    previewTime: 1000,
  },
};

function generatePattern(totalCells, patternLength) {
  const cells = Array.from({ length: totalCells }, (_, index) => index);
  const shuffled = [...cells].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, patternLength);
}

function isSamePattern(pattern, selectedCells) {
  if (pattern.length !== selectedCells.length) return false;

  return pattern.every((cell) => selectedCells.includes(cell));
}

function App() {
  const [difficulty, setDifficulty] = useState("easy");
  const [phase, setPhase] = useState("start");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [pattern, setPattern] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [message, setMessage] = useState("Choose difficulty and start training.");

  const config = difficultyConfig[difficulty];
  const totalCells = config.gridSize * config.gridSize;

  useEffect(() => {
    const savedHighScore = localStorage.getItem("neurogrid-high-score");
    if (savedHighScore) {
      setHighScore(Number(savedHighScore));
    }
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("neurogrid-high-score", String(score));
    }
  }, [score, highScore]);

  useEffect(() => {
    if (phase !== "preview") return;

    const timer = setTimeout(() => {
      setPhase("input");
      setMessage("Now click the cells you remember.");
    }, config.previewTime);

    return () => clearTimeout(timer);
  }, [phase, config.previewTime]);

  function startGame(selectedDifficulty = difficulty) {
    const selectedConfig = difficultyConfig[selectedDifficulty];
    const selectedTotalCells = selectedConfig.gridSize * selectedConfig.gridSize;

    setDifficulty(selectedDifficulty);
    setLevel(1);
    setScore(0);
    setSelectedCells([]);

    const newPattern = generatePattern(
      selectedTotalCells,
      selectedConfig.patternLength
    );

    setPattern(newPattern);
    setPhase("preview");
    setMessage("Memorize the highlighted cells.");
  }

  function startNextLevel() {
    const nextLevel = level + 1;
    const nextPatternLength = Math.min(
      config.patternLength + Math.floor(nextLevel / 2),
      totalCells
    );

    const newPattern = generatePattern(totalCells, nextPatternLength);

    setLevel(nextLevel);
    setSelectedCells([]);
    setPattern(newPattern);
    setPhase("preview");
    setMessage("Memorize the new pattern.");
  }

  function handleCellClick(cellIndex) {
    if (phase !== "input") return;

    if (selectedCells.includes(cellIndex)) {
      setSelectedCells(selectedCells.filter((cell) => cell !== cellIndex));
      return;
    }

    if (selectedCells.length >= pattern.length) return;

    setSelectedCells([...selectedCells, cellIndex]);
  }

  function submitAnswer() {
    const correct = isSamePattern(pattern, selectedCells);

    if (correct) {
      const points = 100 + level * 25;
      setScore(score + points);
      setPhase("success");
      setMessage(`Correct! You earned ${points} points.`);
    } else {
      setPhase("gameOver");
      setMessage("Wrong pattern. Game over.");
    }
  }

  function resetGame() {
    setPhase("start");
    setLevel(1);
    setScore(0);
    setPattern([]);
    setSelectedCells([]);
    setMessage("Choose difficulty and start training.");
  }

  return (
    <main className="page">
      <section className="info-panel">
        <p className="badge">Cognitive Training Game</p>

        <h1>NeuroGrid</h1>
        <br />
        <p className="creator-credit">Created by Osher Asulin</p>

        <p className="description">
          Memorize the highlighted grid pattern, then reproduce it from memory.
          Each level becomes more challenging.
        </p>

        <div className="difficulty-buttons">
          {Object.entries(difficultyConfig).map(([key, item]) => (
            <button
              key={key}
              className={difficulty === key ? "active" : ""}
              onClick={() => startGame(key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="stats">
          <div>
            <span>Level</span>
            <strong>{level}</strong>
          </div>

          <div>
            <span>Score</span>
            <strong>{score}</strong>
          </div>

          <div>
            <span>Best</span>
            <strong>{highScore}</strong>
          </div>
        </div>

        <div className="message-box">{message}</div>
      </section>

      <section className="game-card">
        <div className="game-header">
          <div>
            <h2>Memory Grid</h2>
            <p>
              {config.gridSize}x{config.gridSize} grid
            </p>
          </div>

          <button className="reset-button" onClick={resetGame}>
            Reset
          </button>
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: totalCells }, (_, index) => {
            const highlighted = phase === "preview" && pattern.includes(index);
            const selected = selectedCells.includes(index);

            return (
              <button
                key={index}
                className={`cell ${highlighted ? "highlighted" : ""} ${selected ? "selected" : ""
                  }`}
                onClick={() => handleCellClick(index)}
              />
            );
          })}
        </div>

        <div className="actions">
          {phase === "start" && (
            <button className="main-button" onClick={() => startGame()}>
              Start Game
            </button>
          )}

          {phase === "preview" && (
            <button className="main-button" disabled>
              Memorize...
            </button>
          )}

          {phase === "input" && (
            <button
              className="main-button"
              disabled={selectedCells.length !== pattern.length}
              onClick={submitAnswer}
            >
              Submit {selectedCells.length}/{pattern.length}
            </button>
          )}

          {phase === "success" && (
            <button className="main-button" onClick={startNextLevel}>
              Next Level
            </button>
          )}

          {phase === "gameOver" && (
            <button className="main-button" onClick={() => startGame()}>
              Try Again
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;