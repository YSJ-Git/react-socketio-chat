const Test = () => {
  return (
    <>
      <div class="editor-menu">
        <button id="btn-bold">
          <b>B</b>
        </button>
        <button id="btn-italic">
          <i>I</i>
        </button>
        <button id="btn-underline">
          <u>U</u>
        </button>
        <button id="btn-strike">
          <s>S</s>
        </button>
        <button id="btn-ordered-list">OL</button>
        <button id="btn-unordered-list">UL</button>
        <button id="btn-image">IMG</button>
      </div>
      <div id="editor" contenteditable="true"></div>
    </>
  );
};
export default Test;
