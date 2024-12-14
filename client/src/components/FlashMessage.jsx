import "../css/flashMsgCss.css";
const FlashMessage = () => {
  return (
    <>
      <div
        id="manualflashSuccess"
        className="fixed top-14 left-1/2 z-[99999] transform -translate-x-1/2 px-4 py-2 text-center bg-green-200 border border-green-500 rounded hidden"
      >
        <div id="SuccMsg" className="w-fit"></div>
        <div className="h-1 bg-green-600 animation-dec-width rounded-xl"></div>
      </div>
      <div
        id="manualflashError"
        className="fixed top-14 left-1/2 transform -translate-x-1/2 px-4 py-2 text-center z-[99999] bg-red-200 border border-red-500 rounded hidden"
      >
        <div id="errMsg" className="w-fit"></div>
        <div className="h-1 bg-red-600 animation-dec-width rounded-xl"></div>
      </div>
    </>
  );
};

export default FlashMessage;
