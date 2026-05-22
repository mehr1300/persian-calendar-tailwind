import Calendar from "./lib/Calendar.jsx";

const App = () => {
    return (
        <div className="max-w-2xl mx-auto py-10  tw:flex tw:flex-col tw:p-20 tw:dark:bg-gray-900 tw:h-screen">
            <div className="flex flex-row justify-center py-2 text-xl w-full  text-gray-600 hover:text-gray-500 cursor-pointer">
                <a className=" " href="https://github.com/mehr1300/persian-calendar-tailwind" target="_blank">Show in Github</a>
            </div>
          <Calendar/>
            <div className="flex flex-row justify-center py-2 text-sm w-full  text-gray-500 hover:text-gray-500 cursor-pointer">
                <a className=" " href="https://nilfamtech.com/" target="_blank">nilfamtech.com</a>
            </div>
        </div>

    );
};

export default App;