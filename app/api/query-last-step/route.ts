// /api/sudoku.js
import { GameStepRecordBean } from "@/app/constants and types/types";
import { prisma } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { use } from "react";

// const prisma = new PrismaClient();

export async function POST(request: Request) {
  console.log("request.method = "+request.method)

  if (request.method !== 'POST') {
    return NextResponse.json({ error: "Not Allowed..."  }, { status: 400 })
  }
  const bodyData = await request.json()
  // console.log("update bodyData = "+JSON.stringify(bodyData))
  console.log("last step 传入的stepId= "+bodyData.stepId)

  try{
  // const infoData = await prisma.sudokuInfo.findUnique({
  //   where:{
  //     id:bodyData.infoId
  //   }
  // })

  // console.log("get infoData: "+infoData?.id +", "+infoData?.gameId)
  // const data = await prisma.stepRecord.findUnique({
  //   where:{
  //     id:1
  //   }
  // })
  // console.log("POST findUnique before "+data?.id+", "+data?.sudokuInfoId)

  const stepRecord = await prisma.stepRecord.findUnique({
      where:{
        id:bodyData.stepId
      }
  })

  // const data2 = await prisma.stepRecord.findUnique({
  //   where:{
  //     id:bodyData.id
  //   }
  // })
  // console.log("POST findUnique after "+data2?.id+", "+data2?.sudokuInfoId)

  console.log("prisma after last step "+stepRecord?.id+", "+stepRecord?.valueNow+", "+stepRecord?.valuePre)
    return NextResponse.json({ "data": stepRecord }, { status: 200 })
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