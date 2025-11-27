import { useAuth } from '../../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {user?.email?.split('@')[0] || 'User'}! 👋
        </h1>
        <p className="text-blue-100 dark:text-blue-200">Welcome back to your SmartDesk dashboard</p>
      </div>

      <div className="flex flex-col gap-12 items-center pt-8">
        <GreetUser />
        <Banner
          title="Explore the benefits of great posture"
          text="Learn how maintaining good posture can improve your health and productivity."
          buttonLabel="Explore now"
          imageUrl="/man-at-desk-no-bg.png"
          alt="Person working at an ergonomic standing desk"
          buttonHref="https://www.ohow.com/2021/02/08/standing-desk-ergonomics-7-benefits-of-standing-at-work/"
        />
        <h2 className="md:self-start text-2xl text-gray-900 dark:text-gray-100 font-semibold -mb-8">
          Posture
        </h2>
        <div className="flex flex-wrap justify-center items-stretch gap-6 w-full">
          <Card title="Tracker" text="You stood for " time="2h" />
          <Card title="Reminder" text="Time to take a break!" />
          <Card title="Goal" text="Stand up for 4 hours today!" />
        </div>
      </div>
    </div>
  );
}

function GreetUser() {
  return (
    <div className="text-center">
      <h1 className="font-bold text-5xl text-gray-900 dark:text-gray-100">Hi, user</h1>
      <h2 className="font-medium text-2xl text-gray-600 dark:text-gray-400 mt-4">
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
  buttonHref,
}) {
  return (
    <div className="flex flex-wrap w-full rounded-lg items-center justify-center gap-8">
      <div className="flex flex-col flex-1 min-w-[200px] max-w-146 text-gray-700 dark:text-gray-300 font-semibold text-center md:text-left items-center md:items-start">
        <h3 className="text-2xl text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        <p className="mb-8">{text}</p>
        <Button label={buttonLabel} href={buttonHref} />
      </div>
      <div className="flex-1 min-w-[200px] max-w-146 h-100 rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <img
          src={imageUrl}
          alt={alt}
          className="object-cover w-full h-full rounded-lg"
        />
      </div>
    </div>
  );
}

function Button({ label, onClick, href }) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-fit px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-lg inline-block text-center transition-colors"
      >
        {label}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-fit px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors"
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
    <div className="flex flex-wrap flex-1 bg-sky-100 dark:bg-sky-900/60 border border-sky-200 dark:border-sky-800 rounded-lg p-6">
      <div className="flex items-stretch gap-4">
        <div className="w-1 bg-sky-500 dark:bg-sky-400 rounded-full"></div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            {text}{" "}
            {time && (
              <span
                className={`text-2xl font-bold ${
                  time < "2h" ? "text-sky-500 dark:text-sky-400" : "text-red-500 dark:text-red-400"
                }`}
              >
                {time}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
