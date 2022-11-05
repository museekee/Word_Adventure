import { FieldPacket, RowDataPacket } from "mysql2/promise"
export = DB

declare namespace DB {
    interface Room extends RowDataPacket {
        ID: string;
        CATEGORY: string;
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
}