export default function AboutUs() {
  return (
    <div className="space-y-8">
      <h1 className="font-semibold text-4xl text-gray-900 dark:text-zinc-200">About Us</h1>

      {/* About the App */}
      <section className="bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-200">About the App</h2>
        <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
          SP3 is a smart ergonomic desk management system designed to help you maintain better posture 
          and work habits throughout your day. By connecting to your smart desk, our app provides 
          real-time monitoring, intelligent reminders, and detailed analytics to optimize your workspace 
          ergonomics.
        </p>
        <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
          With features like customizable height presets, posture tracking, and personalized insights, 
          SP3 makes it easy to transition between sitting and standing positions, reducing the health 
          risks associated with prolonged sitting.
        </p>
      </section>

      {/* Key Features */}
      <section className="bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-200">Key Features</h2>
        <ul className="space-y-3 text-gray-700 dark:text-zinc-300">
          <li className="flex items-start gap-3">
            <span className="text-sky-500 dark:text-sky-400 font-bold">•</span>
            <span><strong className="text-gray-900 dark:text-zinc-200">Smart Desk Control:</strong> Seamlessly control your desk height with intuitive controls and customizable presets.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-sky-500 dark:text-sky-400 font-bold">•</span>
            <span><strong className="text-gray-900 dark:text-zinc-200">Posture Analytics:</strong> Track your sitting and standing patterns with detailed reports and visualizations.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-sky-500 dark:text-sky-400 font-bold">•</span>
            <span><strong className="text-gray-900 dark:text-zinc-200">Intelligent Reminders:</strong> Receive timely notifications to change your posture and maintain healthy work habits.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-sky-500 dark:text-sky-400 font-bold">•</span>
            <span><strong className="text-gray-900 dark:text-zinc-200">Personalized Tips:</strong> Get habit insights and recommendations based on your usage patterns.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-sky-500 dark:text-sky-400 font-bold">•</span>
            <span><strong className="text-gray-900 dark:text-zinc-200">Easy Configuration:</strong> Simple setup with API integration for your smart desk device.</span>
          </li>
        </ul>
      </section>

      {/* Our Mission */}
      <section className="bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-200">Our Mission</h2>
        <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
          We believe that technology should enhance wellbeing, not compromise it. Our mission is to 
          empower professionals to create healthier work environments through smart, data-driven 
          ergonomic solutions. By making desk height management effortless and providing actionable 
          insights, we help you focus on what matters most—your work and your health.
        </p>
      </section>

      {/* Contact Info */}
      <section className="bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-200">Get in Touch</h2>
        <p className="text-gray-700 dark:text-zinc-300 leading-relaxed">
          Have questions or feedback? We'd love to hear from you!
        </p>
        <div className="space-y-2 text-gray-700 dark:text-zinc-300">
          <p><strong className="text-gray-900 dark:text-zinc-200">Email:</strong> vadimiovsupport@gmail.com</p>
          <p><strong className="text-gray-900 dark:text-zinc-200">Version:</strong> 1.0.0</p>
        </div>
      </section>
    </div>
  )
}
