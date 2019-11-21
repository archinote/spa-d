import Move from "./move";

export { Move };

export default function install(Vue) {
  Vue.directive(Move.name, Move);
}
