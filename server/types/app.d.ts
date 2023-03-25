import type { IncomingMessage } from 'http';
import type { SessionData } from 'express-session';
import type { Socket } from 'socket.io';

declare module 'express-session' {
    interface SessionData {
        passport: {
            user: string
        }
    }
}

// interface SessionIncomingMessage extends IncomingMessage {
//     session: SessionData
// }

// export interface SessionSocket extends Socket {
//     request: SessionIncomingMessage
// }