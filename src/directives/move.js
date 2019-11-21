/**
 * Insert derective
 *
 * @param {*} el
 * @param {*} binding
 */
function inserted(el, binding) {
  const value = binding.value || {};

  const callback = typeof value === "function" ? value : value.callback;

  let target = value.target || window;
  if (target === "undefined") return;

  if (target !== window) {
    target = document.querySelector(target);
  }

  //Variables
  let moving = false;
  let oldMouseX = 0;
  let oldMouseY = 0;

  //Move handle
  const handleMove = e => {
    if (moving == false) {
      return;
    }
    let mouseX = e.pageX || e.clientX + document.documentElement.scrollLeft;
    let mouseY = e.pageY || e.clientY + document.documentElement.scrollTop;
    let dx = mouseX - oldMouseX;
    let dy = mouseY - oldMouseY;
    oldMouseX = mouseX;
    oldMouseY = mouseY;
    callback({ dx, dy });
  };

  //Mouse down handler
  const handleMouseDown = e => {
    const _target = e.target || e.srcElement;
    if (!(el === _target || el.contains(_target))) {
      return;
    }
    oldMouseX = e.pageX || e.clientX + document.documentElement.scrollLeft;
    oldMouseY = e.pageY || e.clientY + document.documentElement.scrollTop;
    moving = true;
  };

  //Mouse up handler
  const handleMouseUp = e => {
    moving = false;
  };

  //Set event handlers
  target.addEventListener("mousemove", handleMove, true);
  target.addEventListener("mousedown", handleMouseDown, true);
  target.addEventListener("mouseup", handleMouseUp, true);

  //Save data to element
  el._onDMove = {
    handleMove,
    handleMouseDown,
    handleMouseUp,
    target
  };
}
/**
 * Unbind derective
 * @param {*} el
 * @param {*} binding
 */
function unbind(el, binding) {
  const { handleMove, handleMouseDown, handleMouseUp, target } = el._onDMove;

  target.removeEventListener("mousemove", handleMove, true);
  target.removeEventListener("mousedown", handleMouseDown, true);
  target.removeEventListener("mouseup", handleMouseUp, true);
  delete el._onDMove;
}
/**
 * Деректива перемещене объекта
 */
export default {
  name: "d-move",
  inserted,
  unbind
};
