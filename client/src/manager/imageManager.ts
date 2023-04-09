import background from "./../images/background.png"
import plus from "./../images/plus.svg"
import login from "./../images/login.svg"

//! 주제
import SNone from "./../images/subjects/none.svg"
import SKartBody from "./../images/subjects/kartbody.png"
import SKartCharactor from "./../images/subjects/kartcharactor.png"
import SKartTrack from "./../images/subjects/karttrack.png"

//! 테마
import TAll from "./../images/themes/ALL.svg"
import TKartrider from "./../images/themes/kartrider.png"

//! 게이지
import Gx from "./../images/gauges/X.svg"

export default {
    bg: background,
    bottomBar: {
        Plus: plus,
        Login: login   
    },
    subject: {
        none: SNone,
        KartBody: SKartBody,
        KartCharactor: SKartCharactor,
        KartTrack: SKartTrack
    },
    theme: {
        none: SNone,
        All: TAll,
        KartRider: TKartrider
    },
    gauges: {
        x: Gx
    }
}