import axios from "axios";
import Button from "../components/button";
import Input from "@/components/input";
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
  const [info, setInfo] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(e);
  }

  return (
    <div className="font-roboto relative">
      <form className="login-container flex flex-col items-center justify-center h-screen font-arial">
        <h1 className="text-black font-roboto text-button text-b mb-48">Вход в систему</h1>
        <Input inputId="name" inputName="name" labelText="Логин" />
        {/* <br></br> */}
        <Input inputId="password" inputName="password" labelText="Пароль" />
        {/* <br></br> */}
        {/* <br></br> */}
        <Button text="Войти" link="/" />
      </form>
      <img src="/spk.png" alt="" className="z-10 absolute top-50 left-50" />
    </div>
  );
}
