"use client"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { NextResponse } from "next/server"
import Image from 'next/image'
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { DifficultyLevel, Board } from "../../constants and types/types";
import { redirect } from "next/navigation"
import {
    prepareBoard,
    isBoardCorrectlyCompleted,
    findEmpty,
} from "../../logic/functions";
import { useTimer } from "../../hooks/useTimer";
import Stopwatch from "../../components/StopWatch";
import Rows from "../../components/Rows";
import PauseModal from "../../components/PauseModal";
import GameOverModal from "../../components/GameOverModal";
import { exampleSudokuSolution } from "../../constants and types/constants";

export const runtime = "nodejs"
export const fetchCache = "force-no-store"
export const revalidate = 0

export default function GamePage() {
    const params = useParams();
    const gameId = params?.id;
    // console.log("GamePage gameId= " + gameId)

    const [board, setBoard] = useState(() =>
        prepareBoard(exampleSudokuSolution, "easy")
    );
    const [paused, setPaused] = useState(false);
    const [editableFields, setEditableFields] = useState(() => findEmpty(board));
    const timer = useTimer();
    const [difficultyLevel, setDifficultyLevel] =
        useState<DifficultyLevel>("easy");

    const boardCompleted = useMemo(
        () => isBoardCorrectlyCompleted(board),
        [board]
    );

    useEffect(() => {
        if (boardCompleted) {
            timer.pauseTimer();
        }
        console.log("useEffect board boardCompleted="+boardCompleted+", board="+board)
        // generateSudoku()
    }, [board]);

    const isCellEditable = (index: number): boolean =>
        editableFields.includes(index);

    const handleChange = (index: number, value: string): void => {
        const copy = [...board];
        const parsedValue: number = parseInt(value);

        copy[index] = isNaN(parsedValue) ? "" : parsedValue;

        setBoard(copy);
    };

    const changeDifficulty = (
        board: Board,
        exampleSudokuSolution: number[],
        level: string
    ): ("" | number)[] => {
        let boardWithChangedDifficultyLevel: ("" | number)[] = prepareBoard(
            exampleSudokuSolution,
            level
        );
        setBoard(boardWithChangedDifficultyLevel);
        setEditableFields(findEmpty(boardWithChangedDifficultyLevel));
        timer.reset();
        handleStart();
        return board;
    };

    const handleNewGame = () =>
        changeDifficulty(board, exampleSudokuSolution, difficultyLevel);

    const handleStart = (): void => {
        timer.startTimer();
        setPaused(false);
    };

    const handlePause = (): void => {
        timer.pauseTimer();
        setPaused(true);
    };

    const handleChangeDifficulty = (difficulty: any) => {
        changeDifficulty(board, exampleSudokuSolution, difficulty);
        setDifficultyLevel(difficulty);
    };

    const generateSudoku = async () => {
        const gameData = {
            // The data of your new game, such as the difficulty, the initial state of the board etc.
            "difficulty": "hard",
            // "board":"board"
            "board": exampleSudokuSolution.toString(),
            "solved": false,
        };
        console.log("before server " + JSON.stringify(gameData))
        const response = await fetch('/api/sudoku', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameData)
        }).then().catch(error => {
            console.log("fetch error " + error)
        });
        console.log("generateSudoku response= " + response)

        const data = await response.json();
        console.log("generateSudoku data= " + data.id)
        if (data.id) {
            // Router.push(`/game/${data.id}`);
            // const router = useRouter()
            // router.push("/");
            // redirect(`/game/${data.id}`)
            // redirect("/game/19")
        }
    };

    return (

        <>
            <div className="py-[15vh] sm:py-[20vh] container flex flex-col items-center justify-center" >
                <h1 className="header">Sudoku Game</h1>
                <div className="difficultyLevelAndTimerContainer">
                    <div className="difficultyLevel">
                        <label>Difficulty level: </label>
                        <select className="select"
                            onChange={(e) => {
                                handleChangeDifficulty(e.target.value);
                            }}
                        >
                            <option value="easy">Easy </option>
                            <option value="medium">Medium </option>
                            <option value="hard">Hard </option>
                        </select>
                    </div>
                    <Stopwatch
                        onPause={handlePause}
                        onStart={handleStart}
                        time={timer.time}
                        isActive={timer.isActive}
                        boardCompleted={boardCompleted}
                    />
                </div>
                <div className="board">
                    {boardCompleted && (
                        <GameOverModal onClick={handleNewGame} solutionTime={timer.time} />
                    )}
                    {boardCompleted && <div className="overlay"></div>}
                    {paused && <PauseModal onStart={handleStart} />}
                    <table>
                        <tbody>
                            <Rows
                                board={board}
                                onChange={handleChange}
                                isCellEditable={isCellEditable}
                            />
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
}
