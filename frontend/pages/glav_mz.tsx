import axios from "axios";
import TextB from "@/components/textB";
import { FormEvent, useState } from "react";

// let list = ["a", "b", "c"];
// let list1 = [<a>ffff</a>]

// {list.map((i) => (
//   <p>{i}</p>
// ))}
// {list.length === 3 && <p>3</p>}

// {list.length === 2 ? <p>2</p> : <p>Ya hz</p>}
// {list1}

  // axios.get("http://localhost:3001/getUsers")
  // .then(({ data }) => {

  //   setInfo(data)

  // })
  // .catch((error) => {
  //   console.log(error);
  // });

export default function Home() {
  const [info, setInfo] = useState([])

  return (
    <div className="font-roboto" >
      <TextB text="Вход в систему" />
    </div>
  );
}
