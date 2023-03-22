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
}