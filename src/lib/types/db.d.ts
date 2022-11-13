import { FieldPacket, RowDataPacket } from "mysql2/promise"
export = DB

declare namespace DB {
    interface Room extends RowDataPacket {
        ID: string;
        CATEGORY: string;
        PLAYER: string;
        ROUND: number;
        TIME: number;
    }
    interface Word extends RowDataPacket {
        WORD: string;
        CATEGORY: string;
    }
    interface Categories extends RowDataPacket {
        ID: string;
        NAME: string;
        DESCRIPTION: string;
    }
    interface Users extends RowDataPacket {
        ID: string;
        PW: string;
        NICK: string;
        EXP: number;
        MONEY: number;
        ITEM: string;
    }
    interface Shop extends RowDataPacket {
        ID: string;
        NAME: string;
        DESCRIPTION: string;
        CATEGORY: string;
        PRICE: number;
        IMG_TYPE: string;
    }
}