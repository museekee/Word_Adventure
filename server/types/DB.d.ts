export namespace DB {
    interface Session {
        session_id: string //? VARCHAR[128]
        expires: number
        data: string //? MediumText
    }
    interface User {
        ID: string //? TinyText
        NICK: string
        EMAIL: string
        PFP: string
        PROVIDER: string //? TinyText
    }
    interface Theme {
        ID: string //? TinyText
        NAME: string //? TinyText
    }
    interface Subjects {
        ID: string //? TinyText
        NAME: string //? TinyText
        THEME: string //? TinyText
        BG_DEGREE: number //? SmaillInt
        BG_COLORS: string //! #000000/#000000
    }
    interface Word {
        WORD: string
        SUBJECT: string //? TinyText
    }
}