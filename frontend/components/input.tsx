interface InputProps {
  inputId: string;
  inputName: string;
  labelText: string;
}

export default function Input({
  inputId,
  inputName,
  labelText,
}: InputProps) {

  

  return (
    <div className="flex flex-col gap-9">
      <label className="text-xl font-semibold" htmlFor={inputId}>
        {labelText}
      </label>
      <input
        id={inputId}
        name={inputName}
        className="h-50 w-600 border hover:bg-light-gray focus-visible:border-blue focus-visible:outline-0 px-10"
      ></input>
    </div>
  );
}
