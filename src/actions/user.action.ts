"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser(); //* Call the function and await its result

    if (!user || !userId) return;

    //* Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) return existingUser; //* If user exists, return the existing user}

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        //* example johnny@gmail.com => johnny and this is the username
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });
    return dbUser;
  } catch (error) {
    console.error("Error syncing user:", error);
  }
}

export async function getUserByClerkId(clerkId: string){
  return prisma.user.findUnique({
    where: {
      clerkId
    },
    include: {
      _count:{
        select: {
          follower: true,
          following: true,
          posts: true,

        }
      }
    }
  })
}
