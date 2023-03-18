export namespace DB {
    interface User {
        ID: string //? TinyText
        NICK: string
        EMAIL: string
        PFP: string
        PROVIDER: string //? TinyText
    }
}