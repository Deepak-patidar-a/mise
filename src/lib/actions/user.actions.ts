import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "../db"

export const syncUser = async () => {
    //first we will fecthd etails from clerk
    const {userId} = await auth()
    const clerkUser = await currentUser()

    //check
    if(!clerkUser || !userId) {
        console.log("No user found in Clerk")
        return
    }

    //if we have a clerk user, we want to make sure they exist in our database
    const existinguser = await db.user.findUnique({
        where: {
            clerkId: userId
        }
    })

    if(existinguser) {
        console.log("User already exists in database")
        return
    }

    //if we don't have a user, we create one    
    const newUser = await db.user.create({
        data:{
            clerkId: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
            imageUrl: clerkUser.imageUrl,
        }
    })

    return newUser
}
