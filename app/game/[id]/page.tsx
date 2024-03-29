"use client"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { NextResponse } from "next/server"
import Image from 'next/image'
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { DifficultyLevel, Board, GameStepRecordBean } from "../../constants and types/types";
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
import { prisma } from "@/app/lib/db";

export const runtime = "nodejs"
export const fetchCache = "force-no-store"
export const revalidate = 0
var gameInfoDbId = 0
var currentStepId = 0
var originStepId = 0

export default function GamePage() {
    const params = useParams();
    const gameId = params?.id;
    console.log("GamePage gameId= " + gameId)

    const [saveToDB, setSaveToDB] = useState(false);
    const [board, setBoard] = useState(() =>
        prepareBoard(exampleSudokuSolution, "easy")
    );
    const [paused, setPaused] = useState(false);
    const [editableFields, setEditableFields] = useState(() => findEmpty(board));
    const timer = useTimer();
    const [difficultyLevel, setDifficultyLevel] =
        useState<DifficultyLevel>("easy");

    const [stepRecord, setStepRecord] =
        useState<GameStepRecordBean>();

    const boardCompleted = useMemo(
        () => isBoardCorrectlyCompleted(board),
        [board]
    );

    useEffect(() => {
        console.log(`useEffect stepRecord called: 
        【${stepRecord?.coordX}, ${stepRecord?.coordY}, 
          ${stepRecord?.valuePre}, ${stepRecord?.valueNow}】`)

        console.log("call stepRecord dbId= " + gameInfoDbId)
        if (gameInfoDbId > 0) {
            addStepRecordToDB()
        }
        //每一步变化的时候，更新数据库中的stepRecord字段
        // prisma.sudokuInfo.update()
        // await prisma.emoji.update({ where: { id }, data: { isFlagged: true, error } })

    }, [stepRecord]);

    const addStepRecordToDB = async () => {
        await fetch('/api/step-create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "infoId": gameInfoDbId, "stepRecord": stepRecord })
        }).then(res => {
            res.json().then(
                it => {
                    console.log("addStepRecordToDB data.stepId= " + it.stepId)
                    currentStepId = it.stepId
                    if (originStepId == 0) {
                        originStepId = it.stepId
                    }
                }
            )

        }).catch(error => {
            console.log("fetch error " + error)
        });
    }

    useEffect(() => {
        if (boardCompleted) {
            timer.pauseTimer();
        }
        console.log("useEffect board called: saveToDB=" + saveToDB)
        if (!saveToDB) {
            saveSudokuGameToDB()
            setSaveToDB(true)
        }
    }, [board]);

    const isCellEditable = (index: number): boolean =>
        editableFields.includes(index);

    const handleChange = (index: number, value: string): void => {
        const copy = [...board];
        const temp = copy[index].toString()
        const preValue = temp === "" ? 0 : parseInt(temp)
        const parsedValue: number = parseInt(value);

        copy[index] = isNaN(parsedValue) ? "" : parsedValue;

        const stepRecord = new GameStepRecordBean(0, index, preValue, parsedValue)
        console.log(`handleChange...
        【${stepRecord.coordX}, ${stepRecord.coordY}, ${stepRecord.valuePre}, ${stepRecord.valueNow}】，
        【${index}, ${preValue}, ${parsedValue}】`)
        setStepRecord(stepRecord)
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

    const handlePreStep = async () => {
        console.log("handlePreStep start currentStepId=" + currentStepId + ", originStepId=" + originStepId)
        if (currentStepId <= 0) {
            console.log("handlePreStep currentStepId 不合规 return")
            return
        }
        if (currentStepId < originStepId) {
            console.log("handlePreStep currentStepId 到达本次游戏边界 return")
            return
        }
        const response = await fetch('/api/query-last-step', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "stepId": currentStepId })
        }).then(res => {
            res.json().then(
                it => {
                    console.log("handlePreStep await data.data=" + it?.data + ", currentStepId" + currentStepId)
                    if (it?.data === null) return
                    console.log("handlePreStep response= " + it.data.id + ", now=" + it.data.valueNow + ", pre=" + it.data.valuePre + ", y=" + it.data.coordY)

                    const index = it.data.coordY
                    const value = it.data.valuePre
                    const copy = [...board];
                    const parsedValue: number = parseInt(value);
                    copy[index] = isNaN(parsedValue) ? "" : parsedValue;
                    if (parsedValue == 0) {
                        copy[index] = ""
                    }
                    setBoard(copy);
                    currentStepId--
                }
            )

        })
            .catch(error => {
                console.log("fetch error " + error)
            });

        // const data = await response.json();
        // console.log("handlePreStep await data.data=" + data?.data + ", currentStepId" + currentStepId)
        // if (data?.data === null) return
        // console.log("handlePreStep response= " + data.data.id + ", now=" + data.data.valueNow + ", pre=" + data.data.valuePre + ", y=" + data.data.coordY)

        // const index = data.data.coordY
        // const value = data.data.valuePre
        // const copy = [...board];
        // const parsedValue: number = parseInt(value);
        // copy[index] = isNaN(parsedValue) ? "" : parsedValue;
        // if (parsedValue == 0) {
        //     copy[index] = ""
        // }
        // setBoard(copy);
        // currentStepId--
    }

    const handleNextStep = async () => {
        if (currentStepId <= 0) {
            console.log("handleNextStep currentStepId 不合规 return")
            return
        }
        const response = await fetch('/api/query-last-step', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "stepId": currentStepId + 1 })
        }).then(res => {
            res.json().then(
                data => {
                    // const data = await response.json();
                    if (data?.data === null) return
                    console.log("handlePreStep response= " + data?.data?.id + ", now=" + data?.data?.valueNow + ", pre=" + data?.data?.valuePre + ", y=" + data?.data?.coordY)

                    const index = data.data.coordY
                    const value = data.data.valueNow
                    const copy = [...board];
                    const parsedValue: number = parseInt(value);
                    copy[index] = isNaN(parsedValue) ? "" : parsedValue;
                    if (parsedValue == 0) {
                        copy[index] = ""
                    }
                    setBoard(copy);
                    currentStepId++
                })
        }).catch(error => {
            console.log("fetch error " + error)
        });
    }

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

    const saveSudokuGameToDB = async () => {
        const gameData = {
            "gameId": gameId,
            "difficulty": "hard",
            "board": exampleSudokuSolution.toString(),
            "solved": false,
            "stepRecord": {
                create: new GameStepRecordBean(0, 0, 0, 0)
            },
        };
        console.log("before server " + JSON.stringify(gameData))
        const response = await fetch('/api/sudoku-create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gameData)
        }).then(res => {
            res.json().then(
                data => { 
                    console.log("saveSudokuGameToDB response= " + response)

                    // const data = await response.json();
                    console.log("saveSudokuGameToDB data.id= " + data.id)
                    gameInfoDbId = data.id
                    console.log("call create dbId= " + gameInfoDbId)
                    if (data.id) {
                        // Router.push(`/game/${data.id}`);
                        // const router = useRouter()
                        // router.push("/");
                        // redirect(`/game/${data.id}`)
                        // redirect("/game/19")
                    }            
                })
        }).catch(error => {
            console.log("fetch error " + error)
        });
    };

    return (

        <>
            <div className="py-[15vh] sm:py-[20vh] container flex flex-col items-center justify-center" >
                <h1 className="header">Sudoku Game</h1>
                <div className="flex gap-4">
                    <button className="px-4 py-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handlePreStep}>上一步</button>
                    <button className="px-4 py-2 font-medium text-white bg-green-500 rounded hover:bg-green-600" onClick={handleNextStep}>下一步</button>
                </div>
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
