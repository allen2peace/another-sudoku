"use client"
import React from "react";
import Router, { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from "react";
import LoadingPage from './components/Loading';

export default function Home() {

  const [isLoading, setIsLoading] = useState(true);

  const gameId = Date.now() + Math.floor(Math.random() * 1000); // 例如：1577854800000146
  // console.log("gameId = "+gameId +", "+Math.random())
  const router = useRouter()

  useEffect(() => {
    // 模拟数据加载
    // setTimeout(() => {
    setIsLoading(false);
    // }, 100);
  }, [])

  if (!isLoading) {
    router.push(`/game/${gameId}`)
  }
  return <LoadingPage />;
}