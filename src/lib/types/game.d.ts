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
        }
    }
    interface WsSend {
        type: string;
        value?: any;
        word?: string;
        category?: string;
        wrong?: number;
        now_round?: number;
        exp?: number;
        max_round?: number;
        time?: number;
        categories?: string[];
        dam?: number;
    }
}