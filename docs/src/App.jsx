import './App.css'
import * as icons from "../../icons"
function App() {
  console.log(icons)
  const nameList = Object.keys(icons)
  const IconList = nameList.map((item) => {
    return icons[item]
  })
  return (
    <div className='main-content'>
      {IconList.map((Icon, index) => {
        return (
          <div key={index} className="icon-item">
            <Icon size={32}/>
            <div>{nameList[index]}</div>
          </div>
        )
      })}
    </div>
  )
}

export default App
