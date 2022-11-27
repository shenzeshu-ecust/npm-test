const { func } = require("prop-types");

const obj = [
  {
    id: 1,
    height: "100",
    width: "50",
    color: "#fff",
  },
  {
    id: 2,
    location: "100",
    province: "50",
    city: "#fff",
  },
  {
    id: 3,
    left: "100",
    right: "50",
    top: "#fff",
  },
];
interface props {
    visible: boolean
    mode: string
    onCancel: () => void
    onSuccess: () => void
    role: Character | CharacterList | PlayerCharacterList
}
function PunishModal({
    visible,
    mode,
    onCancel,
    onSuccess,
    role 
}) {
    let res
    if(role instanceof Character) {
        res = (<div> 情况1</div>)
    } else if (role instanceof CharacterList) {
        res = (<div> 情况2</div>)
    }

    return res
}