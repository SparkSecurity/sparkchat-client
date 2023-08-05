declare namespace ChatAPI {
    type Message = {
        id: number;
        message: string;
        sender: string;
        botAction: string | undefined;
        replying_to: number;
    }
    type BotMessage = {
        id: number;
        message: string;
        status: "begin" | "continue" | "end" | "error";
        sender: string;
        replying_to: number;
    }
    type User = {
        id: string;
        name: string;
        image_url: string;
    }
    type Bot = {
        name: string;
        action: string;
        id: string;
    }
}