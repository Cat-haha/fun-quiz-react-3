// TO-DO:

// 6. bonus point functionality for questions like "also accepts". should be on top of the main point aswell
// 7. for questions where it's stuff like "red lettuce", add stuff like "almost there" if they just put lettuce
// ---------------------------------------------------------
// 8. `it's not ${userAnswer}, it's digiorno!` DONE
// 5. give up functionality DONE
// 1. #25: add logic that accepts brady and geometry no matter what you put DONE
// 9. when add bonus system, make monday left me broken be a bonus point DONE
// 2. make answer input field go away once answer is marked as correct DONE
// 6. make it so it accepts any answer that includes "blue" for question #4 DONE
// 14. List of questions (progress list if you will) that you've answered and havenmt answered DONE
// 10. "green lemons" = bonus point DONE
// 4. jump to specific question functionality but cant answer a question twice DONE
// 13. remove score on "what question is this" DONE
// 3. skip question functionalitY DONE but only because of the jump to specific question functionality
// 11. fix numbering for 16a. and 16b. and adjust based on that DONE because i'm NOT messing up my whole question array just for 16a and 16b :)

import "./styles.css";
import Leaderboard from "./leaderboard.js";
import questions from "./questions.js";
import TemporaryDrawer from "./drawer.js";
import {
  serverTimestamp,
} from "firebase/firestore";
import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function App() {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    signInAnonymously(auth).catch(console.error);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        console.log("Signed in as:", user.uid);
      }
    });

    return unsub;
  }, []);

  async function addScore(name, score, timestamp) {
    if (!uid) {
      console.error("UID not ready yet");
      return;
    }

    try {
      await setDoc(doc(db, "leaderboard", uid), {
        name,
        score,
        timestamp,
      });
      console.log("Score added!");
    } catch (err) {
      console.error("Error adding score:", err);
    }
  }

  async function addAnswers(answersArray, timestamp) {
    if (!uid) {
      console.error("UID not ready yet");
      return;
    }

    try {
      await setDoc(doc(db, "answers", uid), {
        answersArray,
        timestamp,
      });
      console.log("Answers logged!");
    } catch (err) {
      console.error("Error adding answers:", err);
    }
  }

  const [answersArray, setAnswersArray] = useState([]);
  const [alreadyAnsweredArray, setAlreadyAnsweredArray] = useState([]);
  const [hasUsername, setHasUsername] = useState(false);
  const [startButton, setStartButton] = useState("stBtnShow");
  const [username, setUsername] = useState(undefined);
  const [displayImg, setDisplayImg] = useState("");
  const [qIndex, setqIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [score, setScore] = useState(0);
  const [result, setResult] = useState("");
  const [showHint, setShowHint] = useState("hidden");
  const [alrAnswered, setAlrAnswered] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [showPopupa, setShowPopup] = useState("hidden");
  const [popupContenta, setPopupContent] = useState("hidden");
  const [sectionIndf, setSectionInd] = useState("hidden");
  const [closeButton, setCloseButton] = useState("hidden");
  const [section, setSection] = useState("pretest");
  const [attempts, setAttempts] = useState(0);
  const [bonusAnswered, setBonusAnswered] = useState(false);
  const [showInput, setShowInput] = useState(true);
  const [gaveUp, setGaveUp] = useState(false);
  const [scoreClass, setScoreClass] = useState("show");

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    setDisplayImg(questions[qIndex].image);
    setFade(true);
  }, [qIndex]);

  const giveUp = () => {
    const confirmGiveUp = window.confirm(
      "Are you sure you want to give up for this question?"
    );
    if (confirmGiveUp) {
      setAttempts(5);
      setGaveUp(true);
      handleAnswer({ forcedGiveUp: true });
    }
  };

  const setAsCorrect = () => {
    const userAnswer = inputValue.trim().toLowerCase();
    const isCorrect = questions[qIndex].answer.some(
      (ans) => ans.toLowerCase() === userAnswer
    );
    setShowInput(false);
    setFade(false);

    setTimeout(() => {
      setDisplayImg(questions[qIndex].feedbackImage);
      setFade(true);
    });
    setScore(score + 1);
    setAnswersArray((prev) => [
      ...prev,
      {
        ausername: username,
        questionNumber: qIndex + 1,
        questionAnswer: questions[qIndex].answer[0],
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        gaveUp: gaveUp,
        score: score + 1,
      },
    ]);
    setShownName("shown");
    setResult("Correct!");
    setShowHint("hidden");
    setAlrAnswered(true);
    setAttempts(0);
    setCanContinue(true);
    setAlreadyAnsweredArray((prev) =>
      prev.includes(qIndex) ? prev : [...prev, qIndex]
    );
  };

  const setAsIncorrect = () => {
    const userAnswer = inputValue.trim().toLowerCase();
    const isCorrect = questions[qIndex].answer.some(
      (ans) => ans.toLowerCase() === userAnswer
    );
    setAttempts(attempts + 1);
    console.log(attempts);
    if (attempts > 0) {
      setShowInput(false);
      setShownName("shown");
      setResult("Incorrect. Go to the next question.");
      setCanContinue(true);
      setShowHint("hidden");
      setAlrAnswered(true);
      setAttempts(0);
      setAnswersArray((prev) => [
        ...prev,
        {
          ausername: username,
          questionNumber: qIndex + 1,
          questionAnswer: questions[qIndex].answer[0],
          userAnswer: userAnswer,
          isCorrect: isCorrect,
          gaveUp: gaveUp,
          score: score,
        },
      ]);
    } else {
      setResult("Incorrect! Try again.");
    }
  };

  const handleAnswer = ({ forcedGiveUp = false } = {}) => {
    const userAnswer = inputValue.trim().toLowerCase();
    const isCorrect = questions[qIndex].answer.some(
      (ans) => ans.toLowerCase() === userAnswer
    );

    const handleBonus = () => {
      if (!bonusAnswered) {
        setResult(
          "You got a bonus point! You can continue or go for the other point."
        );
        setScore(score + 1);
        setBonusAnswered(true);
      }
      setCanContinue(true);
      setBonusAnswered(true);
    };

    if (!alrAnswered) {
      if (!forcedGiveUp) {
        if (isCorrect) {
          setAsCorrect();
        } else if (qIndex === 10 && userAnswer === "lettuce") {
          setResult("Hint: It's NOT Lettuce.");
          setShowHint("shown");
        } else if (qIndex === 8 && userAnswer === "australia") {
          handleBonus();
        } else if (qIndex === 14 && userAnswer === "monday left me broken") {
          handleBonus();
        } else if (qIndex === 18 && userAnswer === "green lemons") {
          handleBonus();
        } else if (qIndex === 3) {
          if (userAnswer === "france") {
            handleBonus();
          } else if (userAnswer.includes("blue")) {
            setAsCorrect();
          }
        } else if (qIndex === 22) {
          setScoreClass("hide");
        } else if (qIndex === 24) {
          if (userAnswer.includes("brady") && userAnswer.includes("geometry")) {
            setAsCorrect();
          } else if (
            userAnswer.includes("brady") ||
            userAnswer.includes("geometry")
          ) {
            setResult("Almost there...");
          } else {
            setAsIncorrect();
          }
        } else {
          if (qIndex === 10 && attempts >= 1) {
            setAsIncorrect();
            setResult(`It's not ${userAnswer}, it's Digiorno!`);
          } else {
            setAsIncorrect();
          }
        }
      } else {
        setResult("You gave up. Continue to next question.");
        setGaveUp(true);
        setShowInput(false);
        setShownName("shown");
        setCanContinue(true);
        setShowHint("hidden");
        setAlrAnswered(true);
        setAttempts(0);
        setAnswersArray((prev) => [
          ...prev,
          {
            ausername: username,
            questionNumber: qIndex + 1,
            questionAnswer: questions[qIndex].answer[0],
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            gaveUp: gaveUp,
            score: score,
          },
        ]);
        goToNextQuestion();
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAnswer();
  };

  const handleClick = (event) => {
    const img = event.target;

    const clickX = event.nativeEvent.offsetX;
    const clickY = event.nativeEvent.offsetY;

    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    const x = Math.round(clickX * scaleX);
    const y = Math.round(clickY * scaleY);

    setCoords({ x, y });
    console.log(`Clicked at natural coords: X=${x}, Y=${y}`); // REMOVE LATER

    const isWithinRangeX = x >= 1 && x <= 85;
    const isWithinRangeY = y >= 171 && y <= 271;

    if (qIndex === 11) {
      if (!alrAnswered) {
        if (isWithinRangeX && isWithinRangeY) {
          setAsCorrect();
          setResult("There he is!");
        } else {
          setAsIncorrect();
          setResult("You did NOT find waldo. Try again.");
        }
      }
    }
  };

  function showPopup() {
    setShowPopup("popup");
    setSectionInd("sectionInd");
    setCloseButton("closeButton");
    setPopupContent("popupContent");
  }

  function closePopup() {
    setShowPopup("hidden");
    setSectionInd("hidden");
    setCloseButton("hidden");
    setPopupContent("hidden");
  }

  const goToNextQuestion =  useCallback(() =>{
    if (qIndex === 21) {
      setScoreClass("hide");
    } else {
      setScoreClass("show");
    }
    if (canContinue) {
      if (qIndex === 18) {
        setSection("Math");
        showPopup();
      } else if (qIndex === 33) {
        setSection("Reading");
        showPopup();
      } else if (qIndex === 48) {
        setSection("Brain Teasers");
        showPopup();
      } else if (qIndex === 62) {
        setSection("Colors");
        showPopup();
      } else if (qIndex === 83) {
        setSection("Geography");
        showPopup();
      } else if (qIndex === 105) {
        setSection("Animals");
        showPopup();
      }
      setqIndex(qIndex + 1);
      setAlrAnswered(false);
      setResult("");
      setShownName("hidden");
      setInputValue("");
      setCanContinue(false);
      setBonusAnswered(false);
      setGaveUp(false);
      setShowInput(true);
    }
  }, [goToNextQuestion]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" && canContinue) {
        goToNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canContinue, qIndex]);

  useEffect(() => {
    const unloadCallback = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  const startQuiz = () => {
    if (hasUsername) {
      setQuizActive(true);
      setStartButton("stBtnHide");
      setSection("Warmup");
      showPopup();
    } else {
      alert("Please enter a username");
    }
  };

  const endQuiz = () => {
    const confirmEnd = window.confirm(
      "Are you sure you want to end the quiz? Your score will be submitted and you will be taken the leaderboard."
    );
    if (confirmEnd) {
      addScore(username, score, serverTimestamp());
      addAnswers(answersArray, serverTimestamp());
      setQuizActive(false);
      setScore(0);
      setUsername("");
      setqIndex(0);
    }
  };

  return (
    <div className={`App ${section}`}>
      <br />
      <div className={startButton}>
        <button onClick={startQuiz}>Start Quiz</button> <br />
        <br />
      </div>
      {!hasUsername && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log(username);
            setHasUsername(true);
          }}
        >
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <button type="submit">Submit Name</button>
          <br />
          <br />
        </form>
      )}
      {quizActive ? (
        <div>
          <h1>fun quiz</h1>
          <p>boy do i love the fun quiz</p>
          <p>
            press the go to next question button or{" "}
            <strong>right arrow key</strong> to <strong>continue</strong>
          </p>
          <p>
            also please bear with me, i know the image system isn't the best,
            but it's surprisingly difficult to fix it. just wait for the image
            to load to ensure proper functionality
          </p>
          <hr />
          <br />
          <p className={scoreClass}>Score: {score}</p>
          <br />
          <TemporaryDrawer
            setqIndex={setqIndex}
            setAlreadyAnsweredArray={setAlreadyAnsweredArray}
            qIndex={qIndex}
            alreadyAnsweredArray={alreadyAnsweredArray}
          />
          <br />
          <button onClick={() => setqIndex(qIndex + 1)}>plus one one</button>
          <button onClick={() => setqIndex(qIndex - 1)}>minus one</button>
          <button onClick={goToNextQuestion}>Go To Next Question</button>
          <br />
          <br />
          <h1>{questions[qIndex].question}</h1>
          <br />
          {displayImg && (
            <img
              onClick={handleClick}
              key={displayImg}
              className="img"
              src={displayImg}
              onLoad={(e) => e.target.classList.add("loaded")}
              alt=""
            />
          )}
          <br />
          <br />
          <p>{result}</p>
          <br />
          {showInput && (
            <form onSubmit={handleSubmit}>
              <label htmlFor="nameInput">Enter your answer: </label>
              <input
                id="nameInput"
                type="text"
                value={inputValue}
                autoComplete="off"
                onChange={handleChange}
              />
            </form>
          )}
          <br />
          <br />
          <img className={showHint} src={questions[qIndex].hintImage} />
          <br />
          <br />
          <button type="submit">Submit</button>
          <br />
          <br />
          <button onClick={giveUp}>Give Up [this question]</button>
          <div className={showPopupa}>
            <div className={popupContenta}>
              <h2 className={sectionIndf}>
                You are now in the {section} Section.
              </h2>
              <button onClick={closePopup} className={closeButton}>
                Close
              </button>
            </div>
          </div>
          <br />
          <button onClick={endQuiz}>End Quiz</button>
        </div>
      ) : (
        <Leaderboard />
      )}
    </div>
  );
}
