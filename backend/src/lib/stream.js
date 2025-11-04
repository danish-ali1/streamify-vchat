import {StreamChat} from 'stream-chat';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API key or secret is missing");
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        // allow callers to pass either `_id` (mongoose) or `id` (stream)
        if (!userData) {
            throw new Error('No userData provided to upsertStreamUser');
        }
        if (!userData.id && userData._id) {
            userData.id = typeof userData._id === 'string' ? userData._id : userData._id.toString();
        }
        if (!userData.id) {
            throw new Error('Stream user id is missing');
        }

        // stream-chat SDK expects either upsertUser(userObject) or upsertUsers(array)
        // pass an array to upsertUsers to batch a single user
        await serverClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error upserting Stream user:", error);
        // rethrow so callers (controllers) can act on the error if needed
        throw error;
    }
}

export const generateStreamToken = (userId) => {
    try {
        const userIdStr= userId.toString();
        return serverClient.createToken(userIdStr);
    } catch (error) {
        console.error("Error generating Stream token:", error);
        // rethrow so callers know the generation failed
        throw error;
    }
}
