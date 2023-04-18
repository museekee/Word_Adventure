namespace Api {
    interface Rooms {
        title: string
        user: string
        subjects: string[],
        rounds: number
        time: number
    }
}

export default Api