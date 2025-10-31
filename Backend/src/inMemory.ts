import { Message } from "./types";

const evictiontime = 5 * 60 * 1000;
const eviction_clock_time = 1 * 60 * 1000;
export class InMemoryStore {
    private static store: InMemoryStore;
    private store: Record<string, {
        message: Message[],
        evictionTime: number
    }>
    private clock: NodeJS.Timeout;

    private constructor () {
        this.store = {};
        this.clock = setInterval(() => {
            Object.entries(this.store).forEach(([key, {evictionTime}]) => {
                if(evictionTime < Date.now()) {
                    delete this.store[key];
                }
            });
        }, eviction_clock_time)
    }

    private destroy() {
        clearInterval(this.clock);
    }
    static getInstance () {
        if(!InMemoryStore.store) {
            InMemoryStore.store =  new InMemoryStore();
        }
        return InMemoryStore.store;
    }

    get(conversationId: string) {
        const conversation = this.store[conversationId];
        return conversation ? conversation.message : [];
    }
    add(conversationid: string, message: Message) {
        if(!this.store[conversationid]) {
            this.store[conversationid] = {
                message: [],
                evictionTime: Date.now() + evictiontime
            };
        }
        this.store[conversationid]?.message.push(message);
        this.store[conversationid].evictionTime = Date.now() + evictiontime;
    }
}