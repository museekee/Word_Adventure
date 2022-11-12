export = Game

declare namespace Game {
    interface Rooms {
        [x: string]: {
            answer: string | undefined;
            category: string | undefined;
            exp: number;
            wrong: number;
            now_round: number;
            max_round: number;
            time: number;
            def_time: number;
            categories: string[] | undefined;
            money: number;
        }
    }
    interface WsSend {
        type: string;
        value?: any;
        room?: {
            question: string;
            category: string;
            exp: number;
            wrong: number;
            now_round: number;
            max_round: number;
            time: number;
            categories: string[];
            money: number;
        }
    }
}