interface ButtonProps {
    text: string;
    link?: string; // Optional prop with '?'
}

export default function Button({text, link}: ButtonProps) {
    return (
        <>
        <button className="bg-blue w-200 h-50 text-white font-roboto text-button rounded-10 border-3 border-blue cursor-pointer transition-all hover:bg-white hover:text-blue">
            {text}
        </button>
        </>
    )
}