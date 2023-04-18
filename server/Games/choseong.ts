import Api from "../types/api";

export default class Choseong {
    data: Api.Rooms;
    startTime: bigint;
    
    constructor (room: Api.Rooms) {
        this.data = room
        this.startTime = process.hrtime.bigint()
    }
    startTimer(): void {
        const tick = (): void => {
            const currentTime = process.hrtime.bigint()
            const elapsedTime = (currentTime - this.startTime) / BigInt(1000000)
            const remainingTime = BigInt(Math.max(Number(BigInt(this.data.time) - elapsedTime), 0))
            
            if (remainingTime > 0) {
                setImmediate(tick)
            }
            else {
                console.log('Time is up!')
            }
        }

        setImmediate(tick)
      }
}