interface TextB {
    text: string;
}

export default function TextB({text}: TextB) {
    return (
        <>
        <h1 className="text-black font-roboto text-button text-b">     
            {text}
        </h1>
        </>
    )
}