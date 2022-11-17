import { FieldPacket, RowDataPacket } from "mysql2/promise"
export = DB

declare namespace DB {
    interface Session extends RowDataPacket {
        session_id: string;
        expires: number;
        data: string;
    }
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
        EQUIP: string;
    }
    interface Shop extends RowDataPacket {
        ID: string;
        NAME: string;
        DESCRIPTION: string;
        CATEGORY: string;
        PRICE: number;
        IMG_TYPE: string;
    }
    interface UserItem {
        [x: string]: { // category_id
            [x: string]: { // item_id
                num: number; // 개수
            }
        };
    }
    interface UserEquip {
        [x: string]: string // category_id: item_id
    }
}