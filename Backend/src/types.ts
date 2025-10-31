import {z} from 'zod';
export enum Model {
    "openai/gpt-4o" = "openai/gpt-4o"
}
const Max_Input_Token = 1000;
export const chatSchema = z.object({
    conversationId: z.uuid().optional(),
    model: z.enum(Model),
    message: z.string().max(Max_Input_Token)
})

export const userSchema = z.object({
    email: z.email(),
})

export const signinSchema = z.object({
    email: z.email(),
    otp: z.string()
})

export enum Role {
    Agent = 'assistant',
    User = 'user'
}

export type Message = {
    content: string;
    role: Role;
}

export type Messages = Message[];
