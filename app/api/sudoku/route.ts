// /api/sudoku.js
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  console.log("request.method = "+request.method)

  if (request.method !== 'POST') {
    return NextResponse.json({ error: "Not Allowed..."  }, { status: 400 })
  }
  const bodyData = await request.json()
  console.log("bodyData = "+JSON.stringify(bodyData))

  
  // const users = await prisma.sudokuGame.findMany()
  // console.log("POST findMany = "+users.length)

  try{
  // const newGame = await prisma.sudokuGame.create({data:{
  //   difficulty:"easy",
  //   board:"easy",
  //   solved:true,
  //   // createdAt:now(),
  //   // updatedAt:Date.now(),
  // }});

  const newGame = await prisma.sudokuInfo.create({data:bodyData})
  console.log("prisma create gameId= "+newGame.gameId)
  return NextResponse.json({ id: newGame.gameId }, { status: 200 })
  } catch(error){
    console.error('创建数据时发生错误:', error);
  }
  return NextResponse.json({msg: "Some Errors.."}, { status: 501 })
  // return NextResponse.json({ id: newGame.id }, { status: 200 })
}



// export async function POST(request: Request) {
//   console.log("request.method = "+request.method+", body= " +request.body)

//   if (request.method !== 'POST') {
//     return NextResponse.json({ error: "Not Allowed..."  }, { status: 400 })
//   }
//   // const gameData = request.body;
//   const bodyData = await request.json()
//   console.log("bodyData = "+JSON.stringify(bodyData))

  
//   // const users = await prisma.sudokuGame.findMany()
//   // console.log("POST findMany = "+users.length)

//   try{
//   // const newGame = await prisma.sudokuGame.create({data:{
//   //   difficulty:"easy",
//   //   board:"easy",
//   //   solved:true,
//   //   // createdAt:now(),
//   //   // updatedAt:Date.now(),
//   // }});

//   const newGame = await prisma.sudokuGame.create({data:bodyData})
//   console.log("prisma create id= "+newGame.id)
//   return NextResponse.json({ id: newGame.id }, { status: 200 })
//   } catch(error){
//     console.error('创建数据时发生错误:', error);
//   }
//   return NextResponse.json({msg: "Some Errors.."}, { status: 501 })
//   // return NextResponse.json({ id: newGame.id }, { status: 200 })
// }
// export async function GET(request: Request) {
//   console.log("request.method = "+request.method)

//   // if (request.method !== 'POST') {
//   //   return NextResponse.json({ error: "Not Allowed..."  }, { status: 400 })
//   // }
//   // const gameData = request.body;
  
//   // const newGame = await prisma.sudokuGame.create({data:{difficulty:"easy"}});

//   return NextResponse.json({id: "2020"}, { status: 200 })
//   // return NextResponse.json({ id: newGame.id }, { status: 200 })
// }