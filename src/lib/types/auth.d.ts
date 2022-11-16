import session from "express-session"
export = Auth

declare namespace Auth {
    interface Session extends session.SessionData, session.Session {
        isLogin?: boolean;
        user?: {
            id: string;
            nick: string;
        }
    }
    interface DB_SessionData extends Session{
        cookie: {
            originalMaxAge: number;
            expires: number;
            httpOnly: boolean;
            path: string;
        };
    }
}