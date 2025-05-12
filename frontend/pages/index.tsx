import axios from "axios";
import Button from "../components/button";
import InputBig from "@/components/inputBig";
import { useState } from "react";

{
  /* <img src="/spk.png" alt="" /> */
}
// let list = ["a", "b", "c"];
// let list1 = [<a>ffff</a>]

// {list.map((i) => (
//   <p>{i}</p>
// ))}
// {list.length === 3 && <p>3</p>}

// {list.length === 2 ? <p>2</p> : <p>Ya hz</p>}
// {list1}

export default function Home() {
  const [info, setInfo] = useState([])

  // axios.get("http://localhost:3001/getUsers")
  // .then(({ data }) => {

  //   setInfo(data)

  // })
  // .catch((error) => {
  //   console.log(error);
  // });

  return (
    <div className="font-roboto">
      <Button text={"Help"} />
      <Button text="Priver" link="./" />
      <InputBig inputId="name" inputName="name" labelText="Write your name" />
      
    </div>
  );
}
