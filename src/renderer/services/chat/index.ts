import axios from 'axios'
import store from '../../store'
import { Context } from 'renderer/store/contextSlice';

export const chatAPI = async <T extends Array<any>, U>(call: (context: Context, ...args: T) => U, ...args: T) => {
    const context = store.getState().context.activeContext;
    if (!context) {
        throw new Error('No active context')
    }
    try {
        return await call(context, ...args)
    } catch(e) {
        if (axios.isAxiosError(e) && e.response?.data) {
            throw new Error(e.response.data)
        } else {
            console.error(e)
            throw new Error('Cannot contact API! Check console for details.')
        }
    }
}

export const getUserInfo = async (context: {backendURL: string}, userID: string): Promise<ChatAPI.User | null> => {
    try {
        // check if user exists
        const response = await axios.get(`${context.backendURL}/user/${userID}`)
        return response.data
    } catch(e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
            return null
        } else {
            throw e
        }
    }
}

export const createUser = async (context: {backendURL: string}, name: string, image_url?: string): Promise<ChatAPI.User> => {
    return (await axios.post(`${context.backendURL}/user`, { name, image_url })).data
}

export const postMessage = async (context: Context, message: string, replyingTo?: number) => {
    await axios.post(`${context.backendURL}/message`, { message, sender: context.userID, replying_to: replyingTo })
}

export const getBots = async (context: Context): Promise<ChatAPI.Bot[]> => {
    return (await axios.get(`${context.backendURL}/bots`)).data
}
