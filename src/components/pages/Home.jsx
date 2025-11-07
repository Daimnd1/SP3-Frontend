export default function Home() {
  return (
    <div className="flex flex-col gap-12 items-center pt-8">
      <GreetUser />
      <Banner
        title="Explore the benefits of great posture"
        text="Learn how maintaining good posture can improve your health and productivity."
        buttonLabel="Explore now"
        imageUrl="/man-at-desk-no-bg.png"
        alt="Person working at an ergonomic standing desk"
      />
      <h2 className="md:self-start text-2xl text-zinc-200 font-semibold -mb-8">Posture</h2>
      <div className="flex flex-wrap justify-center items-stretch gap-6 w-full">
        <Card title="Tracker" text="You stood for " time="2h" />
        <Card title="Reminder" text="Time to take a break!" />
        <Card title="Goal" text="Stand up for 4 hours today!" />
      </div>
    </div>
  );
}

function GreetUser() {
  return (
    <div className="text-center">
      <h1 className="font-bold text-5xl text-zinc-200">Hi, user</h1>
      <h2 className="font-medium text-2xl text-zinc-400 mt-4">
        Welcome to your smart workspace
      </h2>
    </div>
  );
}

function Banner({
  title = "Title here",
  text = "Description here",
  buttonLabel = "Button label here",
  imageUrl = "/vite.svg",
  alt = "Image alt here",
}) {
  return (
    <div className="flex flex-wrap w-full rounded-lg items-center justify-center gap-8">
      <div className="flex flex-col flex-1 min-w-[200px] max-w-146 text-zinc-400 font-semibold text-center md:text-left items-center md:items-start">
        <h3 className="text-2xl text-zinc-200 mb-4">{title}</h3>
        <p className="mb-8">{text}</p>
        <Button label={buttonLabel} />
      </div>
      <div className="flex-1 min-w-[200px] max-w-146 h-100 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={alt}
          className="object-cover w-full h-full rounded-lg"
        />
      </div>
    </div>
  );
}

function Button({ label, onClick = () => {} }) {
  return (
    <button
      onClick={onClick}
      className={`w-fit px-4 py-2 bg-sky-900/80 hover:bg-sky-700 text-zinc-200 font-semibold rounded-lg`}
    >
      {label}
    </button>
  );
}

function Card({
  title = "Card Title",
  text = "Card description goes here.",
  time = "",
}) {
  return (
    <div className="flex flex-wrap flex-1 bg-sky-900/60 rounded-lg p-6">
      <div className="flex items-stretch gap-4">
        <div className="w-1 bg-sky-500 rounded-full"></div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-zinc-200 mb-2">{title}</h3>
          <p className="text-zinc-300 text-lg">
            {text} {time && <span className={`text-2xl font-bold ${time < '2h' ? 'text-sky-500' : 'text-red-500'}`}>{time}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
